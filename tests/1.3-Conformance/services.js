/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  resolveVerifyCredentialUrl,
  resolveVerifyPresentationUrl,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {
  OPTIONAL_SERVICE_ROLES,
  SERVICE_ROLES
} from '../service-profiles.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {NORMATIVE} from '../normative-statements.js';
import {
  shouldExposeServiceEndpoint,
  shouldSatisfyConformanceProbe
} from '../assertions.js';

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
    const {data, result, error} = await endpoint.get({url});
    return {data, result, error};
  }
  const {data, result, error} = await endpoint.post({url, json: body ?? {}});
  return {data, result, error};
}

function resolveProbeUrl(endpoint, requirement) {
  if(requirement.probeField) {
    return endpoint.settings.probes?.[requirement.probeField];
  }
  if(requirement.verifyOperation === 'credential') {
    return resolveVerifyCredentialUrl(endpoint.settings.endpoint);
  }
  if(requirement.verifyOperation === 'presentation') {
    return resolveVerifyPresentationUrl(endpoint.settings.endpoint);
  }
  if(requirement.pathSuffix) {
    return joinUrl(endpoint.settings.endpoint, requirement.pathSuffix);
  }
  return endpoint.settings.endpoint;
}

function conformanceStatement(roleKey) {
  switch(roleKey) {
    case 'issuer':
      return NORMATIVE.conformance.issuer;
    case 'verifier':
      return NORMATIVE.conformance.verifier;
    default:
      return NORMATIVE.conformance.issuer;
  }
}

function endpointForRequirement(implementation, role, requirement) {
  return taggedEndpoint(implementation, role.property);
}

async function probeRequirement(implementation, role, requirement, name) {
  const endpoint = endpointForRequirement(implementation, role, requirement);
  should.exist(
    endpoint,
    `Expected ${name} to register a ${role.property} endpoint.`
  );
  const {data, result, error} = await probeEndpoint(endpoint, {
    method: requirement.method,
    body: requirement.body,
    url: resolveProbeUrl(endpoint, requirement)
  });
  shouldSatisfyConformanceProbe({
    result,
    error,
    data,
    label: requirement.title,
    probeKind: requirement.probeKind
  });
}

describe('Service role conformance', function() {
  for(const [roleKey, role] of Object.entries(SERVICE_ROLES)) {
    const {match} = filterByTag({property: role.property, tags: [tag]});
    describe(role.label, function() {
      setupMatrix.call(this, match, 'Implementation');
      for(const [name, implementation] of match) {
        describe(name, function() {
          beforeEach(addPerTestMetadata);
          if(role.groupConformance) {
            it(conformanceStatement(roleKey), async function() {
              this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#conformance';
              for(const requirement of role.required) {
                await probeRequirement(implementation, role, requirement, name);
              }
            });
            return;
          }
          for(const requirement of role.required) {
            it(conformanceStatement(roleKey),
              async function() {
                this.test.link = requirement.link;
                await probeRequirement(implementation, role, requirement, name);
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
      const probesReady = Boolean(
        probes?.exchangeProtocols && probes?.participateExchange
      );
      const describeImpl = probesReady ? describe : describe.skip;
      describeImpl(name, function() {
        beforeEach(addPerTestMetadata);
        for(const requirement of role.required) {
          it(NORMATIVE.conformance.holder,
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
      const describeImpl = endpoint ? describe : describe.skip;
      describeImpl(name, function() {
        beforeEach(addPerTestMetadata);
        for(const requirement of role.required) {
          it(NORMATIVE.conformance.status,
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
