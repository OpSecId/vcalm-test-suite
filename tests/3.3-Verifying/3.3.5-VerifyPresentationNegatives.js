/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  implementationsWithPresentationFlow,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {VERIFY_PRESENTATION_NEGATIVE_CASES} from '../negative-fixtures.js';
import {
  shouldReflectVerificationErrorsVsWarnings,
  shouldReportVerificationFailure,
  skipIfNotImplemented,
  skipIfVerificationClientError
} from '../assertions.js';
import {filterByTag} from 'vc-test-suite-implementations';
import {TestEndpoints} from '../TestEndpoints.js';

const tag = VCALM_TAG;
const {match} = filterByTag({tags: [tag]});
const paired = implementationsWithPresentationFlow(match, tag);

describe('Verify Presentation — negative inputs', function() {
  setupMatrix.call(this, new Map(paired), 'Verifier');
  for(const [name, implementation] of paired) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      for(const testCase of VERIFY_PRESENTATION_NEGATIVE_CASES) {
        it(testCase.title, async function() {
          this.test.link = testCase.link;
          const presentation = testCase.presentation();
          const {data, result} = await endpoints.verifyPresentation(
            presentation,
            testCase.options
          );
          skipIfNotImplemented(this, {
            result,
            label: 'POST /presentations/verify (negative input)'
          });
          skipIfVerificationClientError(this, {
            result,
            label: 'POST /presentations/verify (negative input)'
          });
          shouldReportVerificationFailure({
            data,
            result,
            operation: 'verifyPresentation'
          });
          shouldReflectVerificationErrorsVsWarnings(data);
        });
      }
    });
  }
});
