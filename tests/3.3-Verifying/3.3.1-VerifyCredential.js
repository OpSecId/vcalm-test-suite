/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  implementationsWithIssuerAndVerifier,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {shouldVerifyCredential} from '../assertions.js';
import {TestEndpoints} from '../TestEndpoints.js';

const should = chai.should();
const tag = VCALM_TAG;
const {match} = filterByTag({tags: [tag]});
const paired = implementationsWithIssuerAndVerifier(match, tag);

describe('VCALM §3.3.1 Verify Credential', function() {
  setupMatrix.call(this, new Map(paired), 'Verifier');
  for(const [name, implementation] of paired) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      let issuedVc;
      beforeEach(addPerTestMetadata);
      before(async function() {
        issuedVc = await endpoints.issue();
      });
      it('MUST verify an issued credential (HTTP 200, verified: true).',
        async function() {
          this.test.link =
            'https://www.w3.org/TR/vcalm-1.0/#verify-credential';
          should.exist(issuedVc, `Expected ${name} to issue a VC first.`);
          const {data, result} = await endpoints.verifyCredential(issuedVc);
          shouldVerifyCredential({data, result});
        });
    });
  }
});
