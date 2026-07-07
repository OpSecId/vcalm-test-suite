#!/usr/bin/env python3
"""
Extract normative RFC 2119 statements from a VCALM markdown export, grouped by section.
Outputs markdown suitable for docs/normative-requirements.md body sections.
"""
from __future__ import annotations

import argparse
import re
from collections import defaultdict
from pathlib import Path

KEYWORDS = [
    'MUST NOT', 'MUST', 'SHOULD NOT', 'SHOULD',
    'REQUIRED', 'RECOMMENDED', 'MAY NOT', 'MAY',
]

SKIP_HEADINGS = {
    'Status of This Document', 'Table of Contents', 'Abstract',
    '1.1 Design Goals and Rationale', '1.2 Architecture Overview',
    '1.4 Terminology', 'HTTP API Design Guidelines',
}

NON_NORMATIVE_MARKERS = (
    'This section is non-normative',
    '_This section is non-normative._',
)

TABLE_ROW = re.compile(r'^\|\s*.+\|\s*$')
TABLE_SEP = re.compile(r'^\|\s*[-:]+')
HEADING = re.compile(r'^(#{1,4})\s+(.+)$')


def normalize_title(t: str) -> str:
    t = re.sub(r'\\\.', '.', t.strip())
    m = re.match(r'^(\d+(?:\.\d+)*)\.\s+(.+)$', t)
    return f'{m.group(1)} {m.group(2)}' if m else t


def strip_md(s: str) -> str:
    s = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', s)
    s = re.sub(r'[_*`]+', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def has_keyword(line: str) -> bool:
    plain = strip_md(line)
    return any(re.search(rf'\b{re.escape(kw)}\b', plain) for kw in KEYWORDS)


def keyword_tag(line: str) -> str:
    plain = strip_md(line)
    for kw in KEYWORDS:
        if re.search(rf'\b{re.escape(kw)}\b', plain):
            return kw
    return 'MUST'


def clean_statement(line: str) -> str:
    s = strip_md(line)
    s = re.sub(r'^\|\s*', '', s)
    s = re.sub(r'\s*\|$', '', s)
    # Drop table column noise for property rows: keep from first keyword onward context
    if '|' in line and not line.strip().startswith('| Response'):
        parts = [p.strip() for p in line.split('|') if p.strip()]
        if len(parts) >= 2 and has_keyword(parts[1]):
            s = parts[1]
        elif len(parts) >= 1 and has_keyword(parts[0]):
            s = parts[0]
    s = re.sub(r'\s+', ' ', s).strip()
    if len(s) > 280:
        s = s[:277] + '…'
    return s


def is_table_row(line: str) -> bool:
    return bool(TABLE_ROW.match(line.strip())) and not TABLE_SEP.match(line.strip())


def section_key(stack: list[str]) -> str:
    return ' > '.join(stack)


def parse(path: Path) -> dict[str, list[tuple[str, str, bool]]]:
    """Return section -> [(keyword, statement, is_http_table)]."""
    lines = path.read_text(encoding='utf-8', errors='replace').splitlines()
    stack: list[str] = []
    skip_depth = 0
    non_normative = False
    in_http_table = False
    pending_oas = False
    out: dict[str, list[tuple[str, str, bool]]] = defaultdict(list)
    seen: dict[str, set[str]] = defaultdict(set)

    for line in lines:
        hm = HEADING.match(line)
        if hm:
            lvl = len(hm.group(1))
            title = normalize_title(hm.group(2))
            while stack and len(stack) >= lvl:
                stack.pop()
            stack.append(title)
            skip_depth = 0
            if title in SKIP_HEADINGS or title.startswith('1.1 ') or title.startswith('1.2 '):
                skip_depth = lvl
            non_normative = False
            in_http_table = False
            pending_oas = False
            continue

        if skip_depth and len(stack) >= skip_depth:
            continue

        if any(m in line for m in NON_NORMATIVE_MARKERS):
            non_normative = True
            continue

        if non_normative and stack and stack[0].startswith('1 '):
            continue

        if re.search(r'uses (?:one of )?the following schema', line, re.I):
            pending_oas = True
        if re.search(r'can result in any of these responses', line, re.I):
            pending_oas = True

        if is_table_row(line):
            if re.match(r'^\|\s*(Property|Response)\s*\|', line, re.I):
                in_http_table = True
                pending_oas = False
            is_http = in_http_table or pending_oas
        else:
            if not line.strip().startswith('|'):
                in_http_table = False
            is_http = False

        if not has_keyword(line):
            continue

        sec = section_key(stack)
        if not sec:
            continue

        stmt = clean_statement(line)
        if not stmt or stmt in seen[sec]:
            continue
        seen[sec].add(stmt)
        out[sec].append((keyword_tag(line), stmt, is_http))

    return out


def format_section(title: str, items: list[tuple[str, str, bool]]) -> list[str]:
    prose = [(k, s) for k, s, http in items if not http]
    http = [(k, s) for k, s, http in items if http]

    lines = [f'### {title}', '']
    if prose:
        lines.append('**Prose**')
        lines.append('')
        for kw, s in prose:
            lines.append(f'- **[{kw}]** {s}')
        lines.append('')

    if http:
        lines.append('**HTTP / OpenAPI schema**')
        lines.append('')
        # Dedupe by statement text
        seen_http: set[str] = set()
        for kw, s in http:
            if s in seen_http:
                continue
            seen_http.add(s)
            lines.append(f'- **[{kw}]** {s}')
        lines.append('')

    if not prose and not http:
        lines.append('_No normative statements extracted._')
        lines.append('')

    return lines


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('spec', type=Path)
    ap.add_argument('-o', '--output', type=Path)
    args = ap.parse_args()

    data = parse(args.spec)
    # Sort sections: numbered first
    def sort_key(s: str) -> tuple:
        m = re.match(r'^(\d+(?:\.\d+)*)', s)
        if m:
            return (0, [int(x) for x in m.group(1).split('.')], s)
        if s.startswith('Appendix'):
            return (1, [], s)
        return (2, [], s)

    ordered = sorted(data.keys(), key=sort_key)

    md: list[str] = ['<!-- Generated by docs/scripts/extract_requirements.py -->', '']
    current_major = ''
    for sec in ordered:
        major = sec.split(' > ')[0]
        if major != current_major:
            current_major = major
            md.append(f'## {major}')
            md.append('')
        # Use deepest subsection heading for display
        short = sec.split(' > ')[-1] if ' > ' in sec else sec
        if short != major:
            md.extend(format_section(short, data[sec]))
        else:
            md.extend(format_section(major, data[sec]))

    text = '\n'.join(md)
    if args.output:
        args.output.write_text(text, encoding='utf-8')
        print(f'Wrote {args.output} ({len(ordered)} sections, {sum(len(v) for v in data.values())} statements)')
    else:
        print(text)


if __name__ == '__main__':
    main()
