/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {
  shouldAdvertiseInteractionProtocols,
  shouldReturnHttpResult,
  shouldReturnInteractionHtml,
  skipIfNotImplemented
} from '../assertions.js';
import chai from 'chai';
import {createInteractionProtocolsFixture} from '../mock.data.js';
import {filterByTag} from 'vc-test-suite-implementations';
import {NORMATIVE} from '../normative-statements.js';
import {TestEndpoints} from '../TestEndpoints.js';

const {expect} = chai;

const tag = VCALM_TAG;
const {match} = filterByTag({property: 'interactions', tags: [tag]});

describe('Interaction Protocols Response', function() {
  it(NORMATIVE.interactions.protocolsJson, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#interaction-protocols-response';
    shouldAdvertiseInteractionProtocols(createInteractionProtocolsFixture());
  });

  setupMatrix.call(this, match, 'Interaction');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      it(NORMATIVE.interactions.protocolsJson, async function() {
        this.test.link =
          'https://www.w3.org/TR/vcalm-1.0/#interaction-protocols-response';
        const {protocols, result, error} = await endpoints.startInteraction();
        skipIfNotImplemented(this, {
          result,
          label: 'GET /interactions/{interactionId}?iuv=1'
        });
        shouldReturnHttpResult({result, error});
        expect(result.status).to.equal(200);
        shouldAdvertiseInteractionProtocols(protocols);
      });

      it(NORMATIVE.interactions.protocolsHtml, async function() {
        this.test.link =
          'https://www.w3.org/TR/vcalm-1.0/#interaction-protocols-response';
        const {result, error} = await endpoints.startInteraction({
          accept: 'text/plain'
        });
        skipIfNotImplemented(this, {
          result,
          label: 'GET /interactions/{interactionId}?iuv=1 (text/html)'
        });
        shouldReturnHttpResult({result, error});
        shouldReturnInteractionHtml({result});
      });
    });
  }
});
