/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  hasTaggedEndpoint,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {
  shouldCreateChallenge,
  shouldReturnHttpResult,
  skipIfNotImplemented
} from '../assertions.js';
import {filterByTag} from 'vc-test-suite-implementations';
import {TestEndpoints} from '../TestEndpoints.js';

const tag = VCALM_TAG;
const {match} = filterByTag({tags: [tag]});
const withVerifier = [...match].filter(([, implementation]) =>
  hasTaggedEndpoint(implementation, 'verifiers', tag) ||
  hasTaggedEndpoint(implementation, 'vpVerifiers', tag));

describe('VCALM §3.3.3 Create Challenge', function() {
  setupMatrix.call(this, new Map(withVerifier), 'Verifier');
  for(const [name, implementation] of withVerifier) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      it('MUST return a challenge string (HTTP 200).', async function() {
        this.test.link =
          'https://www.w3.org/TR/vcalm-1.0/#create-challenge';
        const {data, result, error} = await endpoints.createChallenge();
        skipIfNotImplemented(this, {
          result,
          label: 'POST /challenges'
        });
        shouldReturnHttpResult({result, error});
        shouldCreateChallenge({data, result});
      });
    });
  }
});
