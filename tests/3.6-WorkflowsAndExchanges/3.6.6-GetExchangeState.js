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
  shouldGetExchangeState,
  shouldReturnHttpResult,
  skipIfNotImplemented
} from '../assertions.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {TestEndpoints} from '../TestEndpoints.js';

const should = chai.should();
const tag = VCALM_TAG;
const {match} = filterByTag({property: 'workflows', tags: [tag]});

async function createWorkflowAndExchange(endpoints) {
  const workflow = await endpoints.createWorkflow();
  shouldCreateWorkflow(workflow);
  const exchange = await endpoints.createExchange(workflow.workflowId);
  shouldReturnHttpResult({result: exchange.result, error: exchange.error});
  return {workflowId: workflow.workflowId, exchangeId: exchange.exchangeId};
}

describe('VCALM §3.6.6 Get Exchange State', function() {
  setupMatrix.call(this, match, 'Workflow');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      let workflowId;
      let exchangeId;
      beforeEach(addPerTestMetadata);
      before(async function() {
        const created = await endpoints.createWorkflow();
        skipIfNotImplemented(this, {
          result: created.result,
          label: 'POST /workflows'
        });
        const ids = await createWorkflowAndExchange(endpoints);
        workflowId = ids.workflowId;
        exchangeId = ids.exchangeId;
        should.exist(workflowId, `Expected ${name} workflow id.`);
        should.exist(exchangeId, `Expected ${name} exchange id.`);
      });
      it('MUST return exchange state (HTTP 200).', async function() {
        this.test.link =
          'https://www.w3.org/TR/vcalm-1.0/#get-exchange-state';
        const {state, result, error} = await endpoints.getExchangeState(
          workflowId,
          exchangeId
        );
        skipIfNotImplemented(this, {
          result,
          label: 'GET .../exchanges/{localExchangeId}'
        });
        shouldReturnHttpResult({result, error});
        shouldGetExchangeState({data: state, result, error});
      });
    });
  }
});
