#!/usr/bin/env python3
"""Scrape RFC 2119 statements from the published VCALM TR via BeautifulSoup.

Fetches https://www.w3.org/TR/vcalm-1.0/ (pre-rendered Respec) and extracts
every ``.rfc2119`` keyword plus its enclosing statement and section heading.

Writes:
  docs/normative-statements.json
  docs/normative-statements.md
  docs/normative-statements.html

Usage:
  python3 docs/scripts/scrape_normative.py
  python3 docs/scripts/scrape_normative.py --url https://www.w3.org/TR/vcalm-1.0/
"""
from __future__ import annotations

import argparse
import html as html_lib
import json
import re
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

from bs4 import BeautifulSoup

DEFAULT_URL = 'https://www.w3.org/TR/vcalm-1.0/'
DOCS = Path(__file__).resolve().parent.parent
USER_AGENT = 'vcalm-test-suite-normative-scraper/1.0 (+https://github.com/w3c/vcalm-test-suite)'

KW_ORDER = (
    'MUST NOT', 'MUST', 'SHOULD NOT', 'SHOULD',
    'REQUIRED', 'RECOMMENDED', 'MAY NOT', 'MAY', 'OPTIONAL',
)
KW_COLORS = {
    'MUST': '#c62828',
    'MUST NOT': '#ad1457',
    'REQUIRED': '#e65100',
    'SHOULD': '#f9a825',
    'SHOULD NOT': '#f57f17',
    'RECOMMENDED': '#2e7d32',
    'MAY': '#1565c0',
    'MAY NOT': '#4527a0',
    'OPTIONAL': '#00838f',
}
BOILERPLATE_RE = re.compile(r'key words.+bcp\s*14', re.I)


def fetch(url: str) -> tuple[str, str]:
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode('utf-8', 'replace'), resp.geturl()


def clean(text: str) -> str:
    return re.sub(r'\s+', ' ', text).strip()


def section_for(el) -> dict:
    """Nearest heading + optional section id."""
    heading = ''
    section_id = ''
    for h in el.find_all_previous(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], limit=1):
        heading = clean(h.get_text(' ', strip=True))
        parent = h.find_parent(['section', 'div'], id=True)
        if parent and parent.get('id'):
            section_id = parent['id']
        elif h.get('id'):
            section_id = h['id']
        break
    if not section_id:
        parent = el.find_parent(['section', 'div'], id=True)
        if parent and parent.get('id'):
            section_id = parent['id']
    return {'section': heading, 'section_id': section_id}


def block_for(em):
    return em.find_parent(
        ['p', 'li', 'td', 'th', 'dd', 'dt', 'blockquote']
    ) or em.parent


def scrape(html: str, source: str) -> list[dict]:
    soup = BeautifulSoup(html, 'lxml')
    rows: list[dict] = []
    seen: set[tuple[str, str]] = set()

    for em in soup.select('.rfc2119'):
        keyword = em.get_text(strip=True)
        block = block_for(em)
        statement = clean(
            block.get_text(' ', strip=True) if block else em.get_text(' ', strip=True)
        )
        if not statement:
            continue
        key = (keyword, statement)
        if key in seen:
            continue
        seen.add(key)
        meta = section_for(em)
        rows.append({
            'keyword': keyword,
            'section': meta['section'],
            'section_id': meta['section_id'],
            'statement': statement,
            'boilerplate': bool(BOILERPLATE_RE.search(statement)),
            'source': source,
        })
    return rows


def write_json(path: Path, source: str, rows: list[dict]) -> None:
    counts = Counter(r['keyword'] for r in rows)
    payload = {
        'source': source,
        'count': len(rows),
        'keyword_counts': dict(sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))),
        'statements': rows,
    }
    path.write_text(json.dumps(payload, indent=2) + '\n', encoding='utf-8')


def write_markdown(path: Path, source: str, rows: list[dict]) -> None:
    listed = [r for r in rows if not r['boilerplate']]
    counts = Counter(r['keyword'] for r in listed)
    lines = [
        '# VCALM — Normative statements',
        '',
        f'**Source:** {source}',
        '**Method:** BeautifulSoup `select(".rfc2119")` on the published TR.',
        f'**Count:** {len(listed)} statements'
        f' ({len(rows) - len(listed)} RFC 2119 boilerplate hits omitted below)',
        '',
        '## Keyword summary',
        '',
        '| Keyword | Count |',
        '|---------|------:|',
    ]
    for kw in KW_ORDER:
        if counts.get(kw):
            lines.append(f'| {kw} | {counts[kw]} |')
    lines += ['', '## Statements', '']

    by_sec: dict[str, list[dict]] = defaultdict(list)
    for r in listed:
        by_sec[r['section'] or '(no section)'].append(r)

    for sec, items in by_sec.items():
        lines.append(f'### {sec}')
        lines.append('')
        for i, r in enumerate(items, 1):
            lines.append(f'{i}. **[{r["keyword"]}]** {r["statement"]}')
        lines.append('')

    path.write_text('\n'.join(lines), encoding='utf-8')


def write_html(path: Path, source: str, rows: list[dict]) -> None:
    listed = [r for r in rows if not r['boilerplate']]
    boilerplate_n = len(rows) - len(listed)
    by_sec: dict[str, list[dict]] = defaultdict(list)
    for r in listed:
        by_sec[r['section'] or '(no section)'].append(r)

    section_totals = {s: len(items) for s, items in by_sec.items()}
    section_order = sorted(section_totals, key=lambda s: (-section_totals[s], s))
    real_kw = Counter(r['keyword'] for r in listed)

    def esc(s: str) -> str:
        return html_lib.escape(s)

    def sid(sec: str) -> str:
        return re.sub(r'[^a-zA-Z0-9_-]+', '-', sec).strip('-')

    sections_html = []
    for sec in section_order:
        items = by_sec[sec]
        lis = []
        for r in items:
            color = KW_COLORS.get(r['keyword'], '#555')
            lis.append(
                f'<li data-kw="{esc(r["keyword"])}">'
                f'<span class="kw" style="background:{color}">{esc(r["keyword"])}</span> '
                f'<span class="stmt">{esc(r["statement"])}</span></li>'
            )
        sections_html.append(
            f'<section class="sec" id="sec-{esc(sid(sec))}">'
            f'<h3><a href="#sec-{esc(sid(sec))}">{esc(sec)}</a> '
            f'<span class="count">{len(items)}</span></h3>'
            f'<ol>{"".join(lis)}</ol></section>'
        )

    nav = ''.join(
        f'<a href="#sec-{esc(sid(sec))}">{esc(sec)} '
        f'<span>{section_totals[sec]}</span></a>'
        for sec in section_order
    )
    chips = ''.join(
        f'<button type="button" class="chip" data-filter="{esc(k)}" '
        f'style="--chip:{KW_COLORS.get(k, "#555")}">{esc(k)} '
        f'<span>{real_kw[k]}</span></button>'
        for k in KW_ORDER if real_kw.get(k)
    )

    payload = {
        'source': source,
        'listed': len(listed),
        'boilerplate': boilerplate_n,
        'kw_order': [k for k in KW_ORDER if real_kw.get(k)],
        'kw_values': [real_kw[k] for k in KW_ORDER if real_kw.get(k)],
        'kw_colors': [KW_COLORS.get(k, '#555') for k in KW_ORDER if real_kw.get(k)],
        'section_labels': section_order,
        'section_totals': [section_totals[s] for s in section_order],
    }

    must_n = real_kw.get('MUST', 0) + real_kw.get('MUST NOT', 0)
    req_n = real_kw.get('REQUIRED', 0) + real_kw.get('RECOMMENDED', 0)

    doc = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VCALM Normative Statements</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
:root {{
  --bg: #f6f4ef; --ink: #1a1a1a; --muted: #5c5c5c; --card: #fff;
  --line: #ddd6c8; --accent: #0b3d5c;
}}
* {{ box-sizing: border-box; }}
body {{
  margin: 0; font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
  background: var(--bg); color: var(--ink); line-height: 1.45;
}}
header {{
  background: linear-gradient(135deg, #0b3d5c 0%, #1a6b8a 55%, #2a8f7c 100%);
  color: #fff; padding: 2rem 1.5rem 1.5rem;
}}
header h1 {{ margin: 0 0 .35rem; font-size: 1.75rem; font-weight: 650; }}
header p {{ margin: .25rem 0; opacity: .92; max-width: 56rem; }}
header a {{ color: #c8e7ff; }}
.wrap {{ max-width: 1100px; margin: 0 auto; padding: 1.25rem 1.25rem 3rem; }}
.stats {{
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: .75rem; margin: -2rem 0 1.25rem; position: relative; z-index: 1;
}}
.stat {{
  background: var(--card); border: 1px solid var(--line); border-radius: 10px;
  padding: .9rem 1rem; box-shadow: 0 6px 18px rgba(11,61,92,.08);
}}
.stat .n {{ font-size: 1.6rem; font-weight: 700; color: var(--accent); }}
.stat .l {{
  font-size: .8rem; color: var(--muted); text-transform: uppercase; letter-spacing: .04em;
}}
.charts {{
  display: grid; grid-template-columns: 1fr 1.2fr; gap: 1rem; margin-bottom: 1.25rem;
}}
@media (max-width: 820px) {{ .charts {{ grid-template-columns: 1fr; }} }}
.card {{
  background: var(--card); border: 1px solid var(--line); border-radius: 10px;
  padding: 1rem 1.1rem;
}}
.card h2 {{ margin: 0 0 .75rem; font-size: 1.05rem; }}
.filters {{
  display: flex; flex-wrap: wrap; gap: .4rem; margin: 0 0 1rem; align-items: center;
}}
.chip {{
  border: 1px solid color-mix(in srgb, var(--chip) 45%, #fff);
  background: color-mix(in srgb, var(--chip) 12%, #fff);
  color: #222; border-radius: 999px; padding: .35rem .7rem; cursor: pointer;
  font: inherit; font-size: .85rem;
}}
.chip span {{
  display: inline-block; min-width: 1.2em; margin-left: .25rem;
  font-weight: 700; color: var(--chip);
}}
.chip.active, .chip:hover {{ background: var(--chip); color: #fff; }}
.chip.active span, .chip:hover span {{ color: #fff; }}
.chip[data-filter="ALL"] {{ --chip: #0b3d5c; }}
.layout {{ display: grid; grid-template-columns: 220px 1fr; gap: 1rem; }}
@media (max-width: 820px) {{ .layout {{ grid-template-columns: 1fr; }} }}
nav.toc {{
  position: sticky; top: .75rem; align-self: start; max-height: calc(100vh - 1.5rem);
  overflow: auto; background: var(--card); border: 1px solid var(--line);
  border-radius: 10px; padding: .75rem;
}}
nav.toc a {{
  display: flex; justify-content: space-between; gap: .5rem;
  text-decoration: none; color: var(--ink); font-size: .82rem;
  padding: .35rem .4rem; border-radius: 6px;
}}
nav.toc a:hover {{ background: #eef5f8; }}
nav.toc span {{ color: var(--muted); font-variant-numeric: tabular-nums; }}
.sec {{
  background: var(--card); border: 1px solid var(--line); border-radius: 10px;
  padding: 1rem 1.1rem; margin-bottom: .85rem;
}}
.sec h3 {{ margin: 0 0 .6rem; font-size: 1.05rem; }}
.sec h3 a {{ color: inherit; text-decoration: none; }}
.sec h3 .count {{
  font-size: .8rem; color: var(--muted); font-weight: 600;
  background: #eef2f4; border-radius: 999px; padding: .1rem .45rem;
}}
.sec ol {{ margin: 0; padding-left: 1.25rem; }}
.sec li {{ margin: .55rem 0; }}
.sec li.hidden {{ display: none; }}
.kw {{
  display: inline-block; color: #fff; font-size: .72rem; font-weight: 700;
  letter-spacing: .03em; padding: .12rem .4rem; border-radius: 4px; vertical-align: .05em;
}}
footer {{
  margin-top: 1.5rem; color: var(--muted); font-size: .85rem;
  border-top: 1px solid var(--line); padding-top: .75rem;
}}
.note {{ color: var(--muted); font-size: .9rem; margin: 0 0 1rem; }}
</style>
</head>
<body>
<header>
  <h1>VCALM normative statements</h1>
  <p>Scraped from <a href="{esc(source)}">{esc(source)}</a>
     using BeautifulSoup <code>.rfc2119</code>.</p>
  <p>Grouped by nearest preceding heading.
     RFC 2119 keyword-definition boilerplate omitted ({boilerplate_n} hits).</p>
</header>
<div class="wrap">
  <div class="stats">
    <div class="stat"><div class="n">{len(listed)}</div><div class="l">Statements listed</div></div>
    <div class="stat"><div class="n">{len(by_sec)}</div><div class="l">Sections</div></div>
    <div class="stat"><div class="n">{must_n}</div><div class="l">MUST / MUST NOT</div></div>
    <div class="stat"><div class="n">{req_n}</div><div class="l">REQUIRED / RECOMMENDED</div></div>
  </div>
  <div class="charts">
    <div class="card"><h2>By keyword</h2><canvas id="kwChart" height="220"></canvas></div>
    <div class="card"><h2>By section</h2><canvas id="secChart" height="220"></canvas></div>
  </div>
  <p class="note">Filter by keyword. Multi-keyword sentences appear once per
     <code>.rfc2119</code> hit.</p>
  <div class="filters" id="filters">
    <button type="button" class="chip active" data-filter="ALL">ALL
      <span>{len(listed)}</span></button>
    {chips}
  </div>
  <div class="layout">
    <nav class="toc" aria-label="Sections">{nav}</nav>
    <div id="statements">{''.join(sections_html)}</div>
  </div>
  <footer>
    Generated by <code>docs/scripts/scrape_normative.py</code> ·
    data: <code>docs/normative-statements.json</code> ·
    raw hits: {len(rows)} (incl. boilerplate)
  </footer>
</div>
<script>
const DATA = {json.dumps(payload)};
new Chart(document.getElementById('kwChart'), {{
  type: 'doughnut',
  data: {{
    labels: DATA.kw_order,
    datasets: [{{ data: DATA.kw_values, backgroundColor: DATA.kw_colors }}]
  }},
  options: {{ plugins: {{ legend: {{ position: 'bottom' }} }} }}
}});
new Chart(document.getElementById('secChart'), {{
  type: 'bar',
  data: {{
    labels: DATA.section_labels,
    datasets: [{{ label: 'Statements', data: DATA.section_totals, backgroundColor: '#1a6b8a' }}]
  }},
  options: {{
    indexAxis: 'y',
    plugins: {{ legend: {{ display: false }} }},
    scales: {{ x: {{ beginAtZero: true, ticks: {{ precision: 0 }} }} }}
  }}
}});
const chips = document.querySelectorAll('.chip');
chips.forEach(chip => chip.addEventListener('click', () => {{
  chips.forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  const f = chip.dataset.filter;
  document.querySelectorAll('.sec li').forEach(li => {{
    li.classList.toggle('hidden', f !== 'ALL' && li.dataset.kw !== f);
  }});
  document.querySelectorAll('.sec').forEach(sec => {{
    sec.style.display = sec.querySelectorAll('li:not(.hidden)').length ? '' : 'none';
  }});
}}));
</script>
</body>
</html>
'''
    path.write_text(doc, encoding='utf-8')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default=DEFAULT_URL, help='Published TR URL')
    parser.add_argument(
        '--out-dir', type=Path, default=DOCS,
        help='Output directory (default: docs/)',
    )
    args = parser.parse_args()

    html, final_url = fetch(args.url)
    rows = scrape(html, final_url)
    if not rows:
        raise SystemExit(
            f'No .rfc2119 elements found at {final_url}. '
            'Use a pre-rendered TR page, not the Respec editor-draft source.'
        )

    out = args.out_dir
    out.mkdir(parents=True, exist_ok=True)
    write_json(out / 'normative-statements.json', final_url, rows)
    write_markdown(out / 'normative-statements.md', final_url, rows)
    write_html(out / 'normative-statements.html', final_url, rows)

    listed = sum(1 for r in rows if not r['boilerplate'])
    print(f'Source: {final_url}')
    print(f'Wrote {len(rows)} hits ({listed} listed) → {out}/normative-statements.{{json,md,html}}')


if __name__ == '__main__':
    main()
