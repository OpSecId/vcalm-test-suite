/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  implementationsWithIssuerAndHolder,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {shouldBeCreatedPresentation} from '../assertions.js';

import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {TestEndpoints} from '../TestEndpoints.js';

const should = chai.should();
const tag = VCALM_TAG;
const {match} = filterByTag({tags: [tag]});
const paired = implementationsWithIssuerAndHolder(match, tag);

describe('VCALM §3.5.2 Create Presentation', function() {
  setupMatrix.call(this, new Map(paired), 'Holder');
  for(const [name, implementation] of paired) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      let issuedVc;
      beforeEach(addPerTestMetadata);
      before(async function() {
        issuedVc = await endpoints.issue();
      });
      it('MUST create a signed presentation (HTTP 201).', async function() {
        this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#create-presentation';
        should.exist(issuedVc, `Expected ${name} to issue a VC first.`);
        const created = await endpoints.createPresentation({issuedVc});
        shouldBeCreatedPresentation({
          vp: created.verifiablePresentation,
          result: created.result,
          error: created.error
        });
      });
    });
  }
});
