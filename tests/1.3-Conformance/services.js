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
import {SERVICE_ROLES} from '../service-profiles.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {NORMATIVE} from '../normative-statements.js';
import {shouldSatisfyConformanceProbe} from '../assertions.js';

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

function resolveRequirementUrl(endpoint, requirement) {
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

function endpointForRequirement(implementation, role) {
  return taggedEndpoint(implementation, role.property);
}

async function probeRequirement(implementation, role, requirement, name) {
  const endpoint = endpointForRequirement(implementation, role);
  should.exist(
    endpoint,
    `Expected ${name} to register a ${role.property} endpoint.`
  );
  const {data, result, error} = await probeEndpoint(endpoint, {
    method: requirement.method,
    body: requirement.body,
    url: resolveRequirementUrl(endpoint, requirement)
  });
  shouldSatisfyConformanceProbe({
    result,
    error,
    data,
    label: requirement.title,
    probeKind: requirement.probeKind
  });
}

/**
 * §1.3 issuer and verifier conformance classes only.
 * Holder, status, and workflow probes land in a follow-up.
 */
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
});
