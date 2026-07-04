/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  shouldPreferHttpsInteractionUrl,
  shouldSatisfyInteractionUrlFormat,
  shouldUseOnlyIuvQueryParameter
} from '../assertions.js';
import {createInteractionUrl} from '../mock.data.js';
import {NORMATIVE} from '../normative-statements.js';

describe('Interaction URL Format', function() {
  it(NORMATIVE.interactions.interactionUrl, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#interaction-url-format';
    const interactionUrl = createInteractionUrl();
    shouldSatisfyInteractionUrlFormat(interactionUrl);
  });

  it(NORMATIVE.interactions.interactionHttps, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#interaction-url-format';
    shouldPreferHttpsInteractionUrl(createInteractionUrl());
  });

  it(NORMATIVE.interactions.interactionOpaque, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#interaction-url-format';
    const interactionUrl = createInteractionUrl({
      interactionId: 'z8n38Dp7a'
    });
    shouldUseOnlyIuvQueryParameter(interactionUrl);
    shouldSatisfyInteractionUrlFormat(interactionUrl);
  });

  it(NORMATIVE.interactions.interactionNoExtraQuery, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#interaction-url-format';
    shouldUseOnlyIuvQueryParameter(createInteractionUrl());
  });
});
