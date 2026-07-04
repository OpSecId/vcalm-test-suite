/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {describeFixtureSuite} from '../helpers.js';
import {NORMATIVE} from '../normative-statements.js';

describeFixtureSuite('Authorization Capability Request', function() {
  describe.skip('deferred — spec Issue 3', function() {
    it(NORMATIVE.requestingPresentation.authorizationCapability, function() {
      this.test.link =
        'https://www.w3.org/TR/vcalm-1.0/#authorization-capability-request';
    });
  });
});
