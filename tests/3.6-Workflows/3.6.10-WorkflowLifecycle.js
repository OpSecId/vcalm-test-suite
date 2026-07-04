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
  shouldGetExchangeProtocols,
  shouldGetWorkflowConfiguration,
  shouldParticipateInExchange,
  shouldReturnExchangeState,
  shouldReturnHttpResult,
  skipIfNotImplemented
} from '../assertions.js';
import {createWorkflowRequest} from '../mock.data.js';
import {filterByTag} from 'vc-test-suite-implementations';
import {NORMATIVE} from '../normative-statements.js';
import {TestEndpoints} from '../TestEndpoints.js';

const tag = VCALM_TAG;
const {match} = filterByTag({property: 'workflows', tags: [tag]});

describe('Workflow lifecycle (stateful)', function() {
  setupMatrix.call(this, match, 'Workflow');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      it('GET workflow configuration round-trips POST body', async function() {
        this.test.link =
          'https://www.w3.org/TR/vcalm-1.0/#get-workflow-configuration';
        const sent = createWorkflowRequest();
        const created = await endpoints.createWorkflow(sent);
        skipIfNotImplemented(this, {
          result: created.result,
          label: 'POST /workflows'
        });
        shouldCreateWorkflow(created);
        const {configuration, result, error} =
          await endpoints.getWorkflowConfiguration(created.workflowId);
        skipIfNotImplemented(this, {
          result,
          label: 'GET /workflows/{localWorkflowId}'
        });
        shouldGetWorkflowConfiguration({
          data: configuration,
          result,
          error,
          sent
        });
      });

      it('exchange create → participate → GET state', async function() {
        this.test.link =
          'https://www.w3.org/TR/vcalm-1.0/#participate-in-an-exchange';
        const created = await endpoints.createWorkflow();
        skipIfNotImplemented(this, {
          result: created.result,
          label: 'POST /workflows'
        });
        shouldCreateWorkflow(created);
        const exchange = await endpoints.createExchange(created.workflowId);
        skipIfNotImplemented(this, {
          result: exchange.result,
          label: 'POST /workflows/{localWorkflowId}/exchanges'
        });
        shouldReturnHttpResult({
          result: exchange.result,
          error: exchange.error
        });
        const {state: beforeParticipate, result: stateBefore, error: stateErr} =
          await endpoints.getExchangeState(
            created.workflowId,
            exchange.exchangeId
          );
        skipIfNotImplemented(this, {
          result: stateBefore,
          label: 'GET /workflows/{localWorkflowId}/exchanges/{localExchangeId}'
        });
        shouldReturnExchangeState({
          data: beforeParticipate,
          result: stateBefore,
          error: stateErr,
          exchangeId: exchange.exchangeId
        });
        const {message, result, error} = await endpoints.participateInExchange(
          created.workflowId,
          exchange.exchangeId
        );
        skipIfNotImplemented(this, {
          result,
          label: 'POST /workflows/.../exchanges/{localExchangeId}'
        });
        shouldParticipateInExchange({data: message, result, error});
        const after = await endpoints.getExchangeState(
          created.workflowId,
          exchange.exchangeId
        );
        shouldReturnExchangeState({
          data: after.state,
          result: after.result,
          error: after.error,
          exchangeId: exchange.exchangeId
        });
      });

      it(NORMATIVE.workflows.referenceIdEcho, async function() {
        this.test.link =
          'https://www.w3.org/TR/vcalm-1.0/#participate-in-an-exchange';
        const referenceId = 'urn:uuid:417bcaf2-14d9-11f0-99d7-9f094678517b';
        const created = await endpoints.createWorkflow();
        skipIfNotImplemented(this, {
          result: created.result,
          label: 'POST /workflows'
        });
        shouldCreateWorkflow(created);
        const exchange = await endpoints.createExchange(created.workflowId);
        skipIfNotImplemented(this, {
          result: exchange.result,
          label: 'POST /workflows/{localWorkflowId}/exchanges'
        });
        const {message, result, error} = await endpoints.participateInExchange(
          created.workflowId,
          exchange.exchangeId,
          {referenceId}
        );
        skipIfNotImplemented(this, {
          result,
          label: 'POST /workflows/.../exchanges/{localExchangeId}'
        });
        shouldParticipateInExchange({
          data: message,
          result,
          error,
          referenceId
        });
      });

      it(NORMATIVE.workflows.getProtocols, async function() {
        this.test.link =
          'https://www.w3.org/TR/vcalm-1.0/#get-exchange-protocols';
        const created = await endpoints.createWorkflow();
        skipIfNotImplemented(this, {
          result: created.result,
          label: 'POST /workflows'
        });
        shouldCreateWorkflow(created);
        const exchange = await endpoints.createExchange(created.workflowId);
        skipIfNotImplemented(this, {
          result: exchange.result,
          label: 'POST /workflows/{localWorkflowId}/exchanges'
        });
        const {protocols, result, error} = await endpoints.getExchangeProtocols(
          created.workflowId,
          exchange.exchangeId
        );
        skipIfNotImplemented(this, {
          result,
          label: 'GET /workflows/.../exchanges/{localExchangeId}/protocols'
        });
        shouldGetExchangeProtocols({data: protocols, result, error});
      });
    });
  }
});
