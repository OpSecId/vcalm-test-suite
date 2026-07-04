/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {
  shouldRejectMalformedWorkflowRequest,
  skipIfNotImplemented
} from '../assertions.js';
import {
  WORKFLOW_EXCHANGE_NEGATIVE_CASES,
  WORKFLOW_NEGATIVE_CASES
} from '../negative-fixtures.js';
import {filterByTag} from 'vc-test-suite-implementations';
import {TestEndpoints} from '../TestEndpoints.js';

const tag = VCALM_TAG;
const {match} = filterByTag({property: 'workflows', tags: [tag]});

describe('Workflow — negative requests', function() {
  setupMatrix.call(this, match, 'Workflow');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      for(const testCase of WORKFLOW_NEGATIVE_CASES) {
        it(testCase.title, async function() {
          this.test.link = testCase.link;
          const {result, error} = await endpoints.createWorkflowWithBody(
            testCase.body
          );
          skipIfNotImplemented(this, {
            result,
            label: 'POST /workflows (malformed request)'
          });
          shouldRejectMalformedWorkflowRequest({
            result: result ?? error?.response
          });
        });
      }
      for(const testCase of WORKFLOW_EXCHANGE_NEGATIVE_CASES) {
        it(testCase.title, async function() {
          this.test.link = testCase.link;
          const {result, error} = await endpoints.createExchange(
            testCase.workflowId
          );
          skipIfNotImplemented(this, {
            result,
            label:
              'POST /workflows/{localWorkflowId}/exchanges (unknown workflow)'
          });
          shouldRejectMalformedWorkflowRequest({
            result: result ?? error?.response
          });
        });
      }
    });
  }
});
