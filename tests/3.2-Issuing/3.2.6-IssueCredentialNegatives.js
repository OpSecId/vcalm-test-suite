/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {addPerTestMetadata, setupMatrix, VCALM_TAG} from '../helpers.js';
import {ISSUE_NEGATIVE_CASES} from '../negative-fixtures.js';
import {
  shouldRejectMalformedIssueRequest,
  skipIfNotImplemented
} from '../assertions.js';
import {filterByTag} from 'vc-test-suite-implementations';
import {TestEndpoints} from '../TestEndpoints.js';

const tag = VCALM_TAG;
const {match} = filterByTag({property: 'issuers', tags: [tag]});

describe('Issue Credential — negative requests', function() {
  setupMatrix.call(this, match, 'Issuer');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      for(const testCase of ISSUE_NEGATIVE_CASES) {
        it(testCase.title, async function() {
          this.test.link = testCase.link;
          const {result, error} = await endpoints.issueCredentialWithBody(
            testCase.body
          );
          skipIfNotImplemented(this, {
            result,
            label: 'POST /credentials/issue (malformed request)'
          });
          shouldRejectMalformedIssueRequest({result: result ?? error?.response});
        });
      }
    });
  }
});
