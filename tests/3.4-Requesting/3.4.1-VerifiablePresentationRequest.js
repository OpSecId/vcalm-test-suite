/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import chai from 'chai';
import {createVerifiablePresentationRequest} from '../mock.data.js';
import {describeFixtureSuite} from '../helpers.js';
import {NORMATIVE} from '../normative-statements.js';
import {shouldSatisfyVprQueryRequirements} from '../assertions.js';

const should = chai.should();

describeFixtureSuite('Verifiable Presentation Request', function() {
  it(NORMATIVE.requestingPresentation.queryRequired, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#verifiable-presentation-request';
    const vpr = createVerifiablePresentationRequest();
    should.exist(vpr.query, 'Expected query property.');
  });

  it(NORMATIVE.requestingPresentation.queryType, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#verifiable-presentation-request';
    const vpr = createVerifiablePresentationRequest();
    shouldSatisfyVprQueryRequirements(vpr);
  });
});
