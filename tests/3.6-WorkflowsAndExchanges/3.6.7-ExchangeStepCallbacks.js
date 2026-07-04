/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {
  shouldReturnHttpResult,
  skipIfNotImplemented
} from '../assertions.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {NORMATIVE} from '../normative-statements.js';
import {TestEndpoints} from '../TestEndpoints.js';
import {v4 as uuidv4} from 'uuid';

const should = chai.should();
const tag = VCALM_TAG;
const {match} = filterByTag({property: 'workflows', tags: [tag]});

describe('Exchange Step Callbacks', function() {
  setupMatrix.call(this, match, 'Workflow');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      it(NORMATIVE.workflows.callbacks, async function() {
        this.test.link =
          'https://www.w3.org/TR/vcalm-1.0/#exchange-step-callbacks';
        const callbackId = `urn:uuid:${uuidv4()}`;
        const {result, error} = await endpoints.exchangeStepCallback(
          callbackId
        );
        skipIfNotImplemented(this, {
          result,
          label: 'POST /callbacks/{localCallbackId}'
        });
        shouldReturnHttpResult({result, error});
        should.exist(result.status, 'Expected callback HTTP status.');
      });
    });
  }
});
