/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {createInteractionUrl} from '../mock.data.js';
import {NORMATIVE} from '../normative-statements.js';
import {
  shouldConformToInteractionScheme
} from '../assertions.js';
import {toInteractionSchemeUrl} from '../helpers.js';

describe('Interaction Scheme Format', function() {
  it(NORMATIVE.interactions.scheme, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#interaction-scheme-format';
    const interactionUrl = createInteractionUrl();
    const schemeUrl = toInteractionSchemeUrl(interactionUrl);
    shouldConformToInteractionScheme(schemeUrl, interactionUrl);
  });
});
