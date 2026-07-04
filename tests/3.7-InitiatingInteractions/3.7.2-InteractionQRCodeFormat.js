/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  shouldFitInteractionQrCodeLimits,
  shouldSatisfyInteractionUrlFormat
} from '../assertions.js';
import {createInteractionUrl} from '../mock.data.js';
import {NORMATIVE} from '../normative-statements.js';

describe('Interaction QR Code Format', function() {
  it(NORMATIVE.interactions.qrCode, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#interaction-qr-code-format';
    const interactionUrl = createInteractionUrl();
    shouldSatisfyInteractionUrlFormat(interactionUrl);
  });

  it(NORMATIVE.interactions.qrCodeMaxLength, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#interaction-qr-code-format';
    const interactionUrl = createInteractionUrl();
    shouldFitInteractionQrCodeLimits(interactionUrl);
  });
});
