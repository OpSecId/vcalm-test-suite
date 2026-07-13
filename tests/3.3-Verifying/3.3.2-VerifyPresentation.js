/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  implementationsWithPresentationFlow,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {
  shouldBeCreatedPresentation,
  shouldVerifyPresentation
} from '../assertions.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {NORMATIVE} from '../normative-statements.js';
import {TestEndpoints} from '../TestEndpoints.js';

const should = chai.should();
const tag = VCALM_TAG;
const {match} = filterByTag({tags: [tag]});
const paired = implementationsWithPresentationFlow(match, tag);

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
        const created = await endpoints.createPresentation({issuedVc});
        shouldBeCreatedPresentation({
          data: created.data,
          result: created.result,
          error: created.error
        });
        verifiablePresentation = created.verifiablePresentation;
      });
      it(NORMATIVE.verifying.verifyPresentation,
        async function() {
          this.test.link =
            'https://www.w3.org/TR/vcalm-1.0/#verify-presentation';
          should.exist(
            verifiablePresentation,
            `Expected ${name} to create a VP first.`
          );
          const {data, result} = await endpoints.verifyPresentation(
            verifiablePresentation
          );
          shouldVerifyPresentation({data, result});
        });
    });
  }
});
