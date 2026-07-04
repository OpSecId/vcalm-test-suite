/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  PROOF_HANDLING_MODES,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {
  shouldDocumentProofHandlingModes,
  shouldHandlePreProofedCredentialIssue,
  shouldReturnHttpResult,
  skipIfNotImplemented
} from '../assertions.js';
import {filterByTag} from 'vc-test-suite-implementations';
import {NORMATIVE} from '../normative-statements.js';
import {TestEndpoints} from '../TestEndpoints.js';

const tag = VCALM_TAG;
const {match} = filterByTag({property: 'issuers', tags: [tag]});

describe('Proof sets and chains configuration', function() {
  it(NORMATIVE.issuing.proofHandling, function() {
    this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#issue-credential';
    shouldDocumentProofHandlingModes(PROOF_HANDLING_MODES);
  });

  setupMatrix.call(this, match, 'Issuer');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    const expectedMode = endpoints.issuer?.settings?.probes?.proofHandlingMode;
    describe(`${name} (HTTP)`, function() {
      beforeEach(addPerTestMetadata);
      it(NORMATIVE.issuing.proofHandling, async function() {
        this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#issue-credential';
        if(!expectedMode) {
          this.skip(
            'Configure issuers[].settings.probes.proofHandlingMode to run.'
          );
        }
        const {issuedVc, result, error} =
          await endpoints.issueCredentialWithExistingProof();
        skipIfNotImplemented(this, {
          result,
          label: 'POST /credentials/issue (credential with existing proof)'
        });
        shouldReturnHttpResult({result, error});
        shouldHandlePreProofedCredentialIssue({
          expectedMode,
          issuedVc,
          result
        });
      });
    });
  }
});
