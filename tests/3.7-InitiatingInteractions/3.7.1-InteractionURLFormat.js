/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {createInteractionUrl} from '../mock.data.js';
import {shouldSatisfyInteractionUrlFormat} from '../assertions.js';

describe('VCALM §3.7.1 Interaction URL Format', function() {
  it('MUST include iuv=1 on interaction URLs.', function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#interaction-url-format';
    const interactionUrl = createInteractionUrl();
    shouldSatisfyInteractionUrlFormat(interactionUrl);
  });
});
