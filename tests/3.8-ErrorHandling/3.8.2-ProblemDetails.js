/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  problemDetailFixture,
  unknownOptionProblemDetailFixture
} from '../mock.data.js';
import {
  shouldBeProblemDetails,
  shouldHaveReadableProblemDetails
} from '../assertions.js';
import chai from 'chai';
import {NORMATIVE} from '../normative-statements.js';

chai.should();

describe('ProblemDetails', function() {
  it(NORMATIVE.errorHandling.problemDetailsType, function() {
    this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#problemdetails';
    shouldBeProblemDetails(problemDetailFixture);
    shouldBeProblemDetails(unknownOptionProblemDetailFixture);
  });

  it(NORMATIVE.errorHandling.problemDetailsReadable, function() {
    this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#problemdetails';
    shouldHaveReadableProblemDetails(problemDetailFixture);
    shouldHaveReadableProblemDetails(unknownOptionProblemDetailFixture);
  });

  it(NORMATIVE.errorHandling.unknownOptionType, function() {
    this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#problemdetails';
    unknownOptionProblemDetailFixture.type.should.equal(
      'https://www.w3.org/TR/vcalm#UNKNOWN_OPTION_PROVIDED'
    );
  });
});
