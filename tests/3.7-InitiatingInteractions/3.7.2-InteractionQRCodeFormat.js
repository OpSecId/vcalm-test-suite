/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {createInteractionUrl} from '../mock.data.js';
import {shouldFitInteractionQrCodeLimits} from '../assertions.js';

describe('VCALM §3.7.2 Interaction QR Code Format', function() {
  it('MUST encode an interaction URL within QR code size limits.', function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#interaction-qr-code-format';
    const interactionUrl = createInteractionUrl();
    shouldFitInteractionQrCodeLimits(interactionUrl);
  });
});
