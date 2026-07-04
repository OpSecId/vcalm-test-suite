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
  shouldGetWorkflowConfiguration,
  shouldReturnHttpResult,
  skipIfNotImplemented
} from '../assertions.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {createWorkflowRequest} from '../mock.data.js';
import {NORMATIVE} from '../normative-statements.js';
import {TestEndpoints} from '../TestEndpoints.js';

const should = chai.should();
const tag = VCALM_TAG;
const {match} = filterByTag({property: 'workflows', tags: [tag]});

describe('Get Workflow Configuration', function() {
  setupMatrix.call(this, match, 'Workflow');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      let workflowId;
      let sentWorkflow;
      beforeEach(addPerTestMetadata);
      before(async function() {
        sentWorkflow = createWorkflowRequest();
        const created = await endpoints.createWorkflow(sentWorkflow);
        skipIfNotImplemented(this, {
          result: created.result,
          label: 'POST /workflows'
        });
        shouldCreateWorkflow(created);
        workflowId = created.workflowId;
        should.exist(workflowId, `Expected ${name} to return a workflow id.`);
      });
      it(NORMATIVE.workflows.getConfiguration, async function() {
        this.test.link =
          'https://www.w3.org/TR/vcalm-1.0/#get-workflow-configuration';
        const {configuration, result, error} =
          await endpoints.getWorkflowConfiguration(workflowId);
        skipIfNotImplemented(this, {
          result,
          label: 'GET /workflows/{localWorkflowId}'
        });
        shouldReturnHttpResult({result, error});
        shouldGetWorkflowConfiguration({
          data: configuration,
          result,
          error,
          sent: sentWorkflow
        });
      });
    });
  }
});
