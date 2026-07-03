/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {createVerifiablePresentationRequest} from '../mock.data.js';
import {shouldSatisfyVprQueryRequirements} from '../assertions.js';

describe('VCALM §3.4.1 Verifiable Presentation Request', function() {
  it('MUST include query entries each defining type (string).', function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#verifiable-presentation-request';
    const vpr = createVerifiablePresentationRequest();
    shouldSatisfyVprQueryRequirements(vpr);
  });
});
