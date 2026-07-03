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
  skipIfNotImplemented
} from '../assertions.js';
import {createInteractionProtocolsFixture} from '../mock.data.js';
import {filterByTag} from 'vc-test-suite-implementations';
import {TestEndpoints} from '../TestEndpoints.js';

const tag = VCALM_TAG;
const {match} = filterByTag({property: 'interactions', tags: [tag]});

describe('VCALM §3.7.4 Interaction Protocols Response', function() {
  it('MUST advertise inviteRequest and/or vcapi protocol URLs.', function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#interaction-protocols-response';
    shouldAdvertiseInteractionProtocols(createInteractionProtocolsFixture());
  });

  setupMatrix.call(this, match, 'Interaction');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      it('MUST return protocols over HTTP (HTTP 200).', async function() {
        this.test.link =
          'https://www.w3.org/TR/vcalm-1.0/#interaction-protocols-response';
        const {protocols, result, error} = await endpoints.startInteraction();
        skipIfNotImplemented(this, {
          result,
          label: 'GET /interactions/{interactionId}?iuv=1'
        });
        shouldReturnHttpResult({result, error});
        result.status.should.equal(200, 'Expected status code 200.');
        shouldAdvertiseInteractionProtocols(protocols);
      });
    });
  }
});
