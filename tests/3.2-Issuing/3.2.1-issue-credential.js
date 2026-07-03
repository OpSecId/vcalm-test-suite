/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {addPerTestMetadata, setupMatrix, VCALM_TAG} from '../helpers.js';
import {
  shouldBeIssuedVc,
  shouldReturnHttpResult
} from '../assertions.js';
import {filterByTag} from 'vc-test-suite-implementations';
import {TestEndpoints} from '../TestEndpoints.js';

const tag = VCALM_TAG;
const {match} = filterByTag({property: 'issuers', tags: [tag]});

describe('VCALM §3.2.1 Issue Credential', function() {
  setupMatrix.call(this, match, 'Issuer');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      it('MUST successfully issue a credential (HTTP 201).', async function() {
        this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#issue-credential';
        const {issuedVc, result, error} = await endpoints.issueCredential();
        shouldReturnHttpResult({result, error});
        result.status.should.equal(201, 'Expected status code 201.');
        shouldBeIssuedVc({issuedVc});
      });
    });
  }
});
