/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  implementationsWithIssuerAndVerifier,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {shouldVerifyPresentation} from '../assertions.js';
import {
  createLocalDidKeyVp,
  LOCAL_HOLDER_CHALLENGE,
  LOCAL_HOLDER_DOMAIN
} from '../local-holder.js';
import {NORMATIVE} from '../normative-statements.js';
import {TestEndpoints} from '../TestEndpoints.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';

const should = chai.should();
const tag = VCALM_TAG;
const {match} = filterByTag({tags: [tag]});
const paired = implementationsWithIssuerAndVerifier(match, tag);

describe('Verify Presentation', function() {
  setupMatrix.call(this, new Map(paired), 'Verifier');
  for(const [name, implementation] of paired) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      let verifiablePresentation;
      beforeEach(addPerTestMetadata);
      before(async function() {
        const issuedVc = await endpoints.issue();
        should.exist(issuedVc, `Expected ${name} to issue a VC first.`);
        verifiablePresentation = await createLocalDidKeyVp({
          verifiableCredential: issuedVc
        });
      });
      it(NORMATIVE.verifying.verifyPresentation,
        async function() {
          this.test.link =
            'https://www.w3.org/TR/vcalm-1.0/#verify-presentation';
          should.exist(
            verifiablePresentation,
            `Expected ${name} to obtain a local did:key VP.`
          );
          const {data, result} = await endpoints.verifyPresentation(
            verifiablePresentation,
            {
              challenge: LOCAL_HOLDER_CHALLENGE,
              domain: LOCAL_HOLDER_DOMAIN
            }
          );
          shouldVerifyPresentation({data, result});
        });
    });
  }
});
