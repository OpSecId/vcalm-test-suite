/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {createInteractionUrl} from '../mock.data.js';
import {shouldConformToInteractionScheme} from '../assertions.js';
import {toInteractionSchemeUrl} from '../helpers.js';

describe('VCALM §3.7.3 Interaction Scheme Format', function() {
  it('MUST use interaction: scheme with valid URL syntax.', function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#interaction-scheme-format';
    const interactionUrl = createInteractionUrl();
    const schemeUrl = toInteractionSchemeUrl(interactionUrl);
    shouldConformToInteractionScheme(schemeUrl, interactionUrl);
  });
});
