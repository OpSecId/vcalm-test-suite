/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {shouldVerifyCredential} from '../assertions.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {createLocalDidKeyVc} from '../local-holder.js';
import {NORMATIVE} from '../normative-statements.js';
import {TestEndpoints} from '../TestEndpoints.js';

const should = chai.should();
const tag = VCALM_TAG;
const {match} = filterByTag({property: 'verifiers', tags: [tag]});

describe('Verify Credential', function() {
  setupMatrix.call(this, match, 'Verifier');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      let issuedVc;
      beforeEach(addPerTestMetadata);
      before(async function() {
        issuedVc = await createLocalDidKeyVc();
      });
      it(NORMATIVE.verifying.verifyCredential,
        async function() {
          this.test.link =
            'https://www.w3.org/TR/vcalm-1.0/#verify-credential';
          should.exist(issuedVc, 'Expected a suite-local did:key VC.');
          const {data, result} = await endpoints.verifyCredential(issuedVc);
          shouldVerifyCredential({data, result});
        });
    });
  }
});
