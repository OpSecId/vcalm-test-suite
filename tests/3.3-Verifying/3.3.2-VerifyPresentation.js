/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {shouldVerifyPresentation} from '../assertions.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {
  createLocalDidKeyPresentedVc,
  LOCAL_HOLDER_CHALLENGE,
  LOCAL_HOLDER_DOMAIN
} from '../local-holder.js';
import {NORMATIVE} from '../normative-statements.js';
import {TestEndpoints} from '../TestEndpoints.js';

const should = chai.should();
const tag = VCALM_TAG;
const {match} = filterByTag({property: 'verifiers', tags: [tag]});

describe('Verify Presentation', function() {
  setupMatrix.call(this, match, 'Verifier');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      let verifiablePresentation;
      beforeEach(addPerTestMetadata);
      before(async function() {
        ({verifiablePresentation} = await createLocalDidKeyPresentedVc());
      });
      it(NORMATIVE.verifying.verifyPresentation,
        async function() {
          this.test.link =
            'https://www.w3.org/TR/vcalm-1.0/#verify-presentation';
          should.exist(
            verifiablePresentation,
            'Expected a suite-local did:key VP.'
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
