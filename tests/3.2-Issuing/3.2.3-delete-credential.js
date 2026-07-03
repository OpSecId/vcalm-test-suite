/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {addPerTestMetadata, setupMatrix, VCALM_TAG} from '../helpers.js';
import {
  shouldReturnHttpResult,
  skipIfNotImplemented
} from '../assertions.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {TestEndpoints} from '../TestEndpoints.js';

const should = chai.should();
const tag = VCALM_TAG;
const {match} = filterByTag({property: 'issuers', tags: [tag]});

describe('VCALM §3.2.3 Delete Credential', function() {
  setupMatrix.call(this, match, 'Issuer');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      let issuedVc;
      beforeEach(addPerTestMetadata);
      before(async function() {
        issuedVc = await endpoints.issue();
      });
      it('MUST delete a stored credential by id (HTTP 202).', async function() {
        this.test.link =
          'https://www.w3.org/TR/vcalm-1.0/#delete-a-specific-credential';
        should.exist(
          issuedVc?.id,
          `Expected ${name} to issue a VC with an id.`
        );
        const {result, error} = await endpoints.deleteCredential(issuedVc.id);
        skipIfNotImplemented(this, {
          result,
          label: 'DELETE /credentials/{id}'
        });
        shouldReturnHttpResult({result, error});
        result.status.should.equal(202, 'Expected status code 202.');
      });
    });
  }
});
