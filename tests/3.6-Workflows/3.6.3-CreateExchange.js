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
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {NORMATIVE} from '../normative-statements.js';
import {TestEndpoints} from '../TestEndpoints.js';

const should = chai.should();
const tag = VCALM_TAG;
const {match} = filterByTag({property: 'workflows', tags: [tag]});

describe('Create Exchange', function() {
  setupMatrix.call(this, match, 'Workflow');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      let workflowId;
      beforeEach(addPerTestMetadata);
      before(async function() {
        const created = await endpoints.createWorkflow();
        skipIfNotImplemented(this, {
          result: created.result,
          label: 'POST /workflows'
        });
        shouldCreateWorkflow(created);
        workflowId = created.workflowId;
        should.exist(workflowId, `Expected ${name} to return a workflow id.`);
      });
      it(NORMATIVE.workflows.createExchange,
        async function() {
          this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#create-exchange';
          const {exchangeId, result, error} =
            await endpoints.createExchange(workflowId);
          skipIfNotImplemented(this, {
            result,
            label: 'POST /workflows/{localWorkflowId}/exchanges'
          });
          shouldReturnHttpResult({result, error});
          [201, 204].should.include(result.status);
          const location = result.headers?.get?.('location') ??
            result.headers?.get?.('Location');
          should.exist(location, 'Expected Location header.');
          should.exist(exchangeId, 'Expected an exchange id from Location.');
        });
    });
  }
});
