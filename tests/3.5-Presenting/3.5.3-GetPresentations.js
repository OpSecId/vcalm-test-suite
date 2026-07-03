/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {addPerTestMetadata, setupMatrix, VCALM_TAG} from '../helpers.js';
import {
  shouldReturnHttpResult,
  skipIfNotImplemented
} from '../assertions.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {TestEndpoints} from '../TestEndpoints.js';

chai.should();
const tag = VCALM_TAG;
const {match} = filterByTag({property: 'holders', tags: [tag]});

describe('VCALM §3.5.3 Get Presentations', function() {
  setupMatrix.call(this, match, 'Holder');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      it('MUST return a presentation list (HTTP 200).', async function() {
        this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#get-presentations';
        const {presentations, result, error} =
          await endpoints.getPresentations();
        skipIfNotImplemented(this, {
          result,
          label: 'GET /presentations'
        });
        shouldReturnHttpResult({result, error});
        result.status.should.equal(200, 'Expected status code 200.');
        presentations.should.be.an('array');
      });
    });
  }
});
