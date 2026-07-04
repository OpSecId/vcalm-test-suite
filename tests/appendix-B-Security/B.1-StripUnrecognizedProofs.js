/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {createCredentialWithMixedProofTypes} from '../mock.data.js';
import {NORMATIVE} from '../normative-statements.js';
import {shouldStripUnrecognizedProofs} from '../assertions.js';
import {stripUnrecognizedProofs} from '../helpers.js';

describe('Strip unrecognized proofs', function() {
  it(NORMATIVE.security.stripUnrecognizedProofs, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#proof-type-allow-lists';
    const credential = createCredentialWithMixedProofTypes();
    const acceptedProofTypes = ['DataIntegrityProof'];
    const sanitized = stripUnrecognizedProofs(credential, acceptedProofTypes);
    shouldStripUnrecognizedProofs({
      credential: sanitized,
      acceptedProofTypes
    });
  });
});
