/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {
  shouldCreateWorkflow,
  shouldReturnHttpResult,
  skipIfNotImplemented
} from '../assertions.js';
import {filterByTag} from 'vc-test-suite-implementations';
import {TestEndpoints} from '../TestEndpoints.js';

const tag = VCALM_TAG;
const {match} = filterByTag({property: 'workflows', tags: [tag]});

describe('VCALM §3.6.1 Create Workflow', function() {
  setupMatrix.call(this, match, 'Workflow');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      it('MUST create a workflow (HTTP 201 or 204 + Location).',
        async function() {
          this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#create-workflow';
          const {result, error} = await endpoints.createWorkflow();
          skipIfNotImplemented(this, {
            result,
            label: 'POST /workflows'
          });
          shouldReturnHttpResult({result, error});
          shouldCreateWorkflow({result, error});
        });
    });
  }
});
