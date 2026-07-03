/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  implementationsWithIssuerAndHolder,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {
  shouldBeCreatedPresentation,
  shouldReturnHttpResult,
  skipIfNotImplemented
} from '../assertions.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {TestEndpoints} from '../TestEndpoints.js';

const should = chai.should();
const tag = VCALM_TAG;
const {match} = filterByTag({tags: [tag]});
const paired = implementationsWithIssuerAndHolder(match, tag);

describe('VCALM §3.5.5 Delete a Specific Presentation', function() {
  setupMatrix.call(this, new Map(paired), 'Holder');
  for(const [name, implementation] of paired) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      let presentationId;
      beforeEach(addPerTestMetadata);
      before(async function() {
        const issuedVc = await endpoints.issue();
        should.exist(issuedVc, `Expected ${name} to issue a VC first.`);
        const created = await endpoints.createPresentation({issuedVc});
        shouldBeCreatedPresentation({
          vp: created.verifiablePresentation,
          result: created.result,
          error: created.error
        });
        presentationId = created.verifiablePresentation?.id;
      });
      it('MUST delete a stored presentation by id (HTTP 202).',
        async function() {
          this.test.link =
          'https://www.w3.org/TR/vcalm-1.0/#delete-a-specific-presentation';
          if(!presentationId) {
            this.skip('Created presentation has no id for storage lookup.');
          }
          const {result, error} = await endpoints.deletePresentation(
            presentationId
          );
          skipIfNotImplemented(this, {
            result,
            label: 'DELETE /presentations/{id}'
          });
          shouldReturnHttpResult({result, error});
          result.status.should.equal(202, 'Expected status code 202.');
        });
    });
  }
});
