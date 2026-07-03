/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {
  OPTIONAL_SERVICE_ROLES,
  SERVICE_ROLES
} from '../service-profiles.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {shouldExposeServiceEndpoint} from '../assertions.js';

const should = chai.should();
const tag = VCALM_TAG;

function taggedEndpoint(implementation, property, roleTag = tag) {
  return implementation[property]?.find(endpoint => endpoint.tags.has(roleTag));
}

function joinUrl(base, suffix) {
  const trimmed = base.replace(/\/+$/, '');
  const path = suffix.startsWith('/') ? suffix : `/${suffix}`;
  return `${trimmed}${path}`;
}

async function probeEndpoint(endpoint, {method, body, url}) {
  if(method === 'get') {
    return endpoint.get({url});
  }
  return endpoint.post({url, json: body ?? {}});
}

function resolveProbeUrl(endpoint, requirement) {
  if(requirement.probeField) {
    return endpoint.settings.probes?.[requirement.probeField];
  }
  if(requirement.pathSuffix) {
    return joinUrl(endpoint.settings.endpoint, requirement.pathSuffix);
  }
  return endpoint.settings.endpoint;
}

describe('VCALM §1.3 Service role conformance', function() {
  for(const role of Object.values(SERVICE_ROLES)) {
    const {match} = filterByTag({property: role.property, tags: [tag]});
    describe(role.label, function() {
      setupMatrix.call(this, match, 'Implementation');
      for(const [name, implementation] of match) {
        const endpoint = taggedEndpoint(implementation, role.property);
        describe(name, function() {
          beforeEach(addPerTestMetadata);
          for(const requirement of role.required) {
            it(`MUST expose ${requirement.title} (${requirement.section}).`,
              async function() {
                this.test.link = requirement.link;
                should.exist(
                  endpoint,
                  `Expected ${name} to register a ${role.property} endpoint.`
                );
                const {result, error} = await probeEndpoint(endpoint, {
                  method: requirement.method,
                  body: requirement.body
                });
                shouldExposeServiceEndpoint({
                  result,
                  error,
                  label: requirement.title
                });
              });
          }
        });
      }
    });
  }

  describe('Holder service (optional probes)', function() {
    const role = OPTIONAL_SERVICE_ROLES.holder;
    const {match} = filterByTag({property: role.property, tags: [tag]});
    setupMatrix.call(this, match, 'Implementation');
    for(const [name, implementation] of match) {
      const endpoint = taggedEndpoint(implementation, role.property);
      const probes = endpoint?.settings?.probes;
      describe(name, function() {
        beforeEach(addPerTestMetadata);
        if(!probes?.exchangeProtocols || !probes?.participateExchange) {
          it(
            'MAY skip holder probes until workflows[].probes is configured.',
            function() {
              this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#conformance';
              this.skip();
            }
          );
          return;
        }
        for(const requirement of role.required) {
          it(`MUST expose ${requirement.title} (${requirement.section}).`,
            async function() {
              this.test.link = requirement.link;
              const url = resolveProbeUrl(endpoint, requirement);
              should.exist(url, `Missing probes.${requirement.probeField}.`);
              const {result, error} = await probeEndpoint(endpoint, {
                method: requirement.method,
                body: requirement.body,
                url
              });
              shouldExposeServiceEndpoint({
                result,
                error,
                label: requirement.title
              });
            });
        }
      });
    }
  });

  describe('Status service (optional profile)', function() {
    const role = OPTIONAL_SERVICE_ROLES.status;
    const statusTag = role.tag;
    const {match} = filterByTag({tags: [statusTag]});
    setupMatrix.call(this, match, 'Implementation');
    for(const [name, implementation] of match) {
      const endpoint = taggedEndpoint(implementation, role.property, statusTag);
      describe(name, function() {
        beforeEach(addPerTestMetadata);
        if(!endpoint) {
          it(`MAY skip status tests unless tagged ${statusTag}.`, function() {
            this.skip();
          });
          return;
        }
        for(const requirement of role.required) {
          it(`MUST expose ${requirement.title} (${requirement.section}).`,
            async function() {
              this.test.link = requirement.link;
              const url = resolveProbeUrl(endpoint, requirement);
              const {result, error} = await probeEndpoint(endpoint, {
                method: requirement.method,
                body: requirement.body,
                url
              });
              shouldExposeServiceEndpoint({
                result,
                error,
                label: requirement.title
              });
            });
        }
      });
    }
  });
});
