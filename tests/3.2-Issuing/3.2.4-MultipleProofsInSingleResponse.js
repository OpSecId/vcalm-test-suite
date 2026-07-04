/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {
  shouldAttachMultipleProofsInSingleResponse,
  shouldReturnHttpResult,
  skipIfNotImplemented
} from '../assertions.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {NORMATIVE} from '../normative-statements.js';
import {TestEndpoints} from '../TestEndpoints.js';

const {expect} = chai;

const tag = VCALM_TAG;
const {match} = filterByTag({property: 'issuers', tags: [tag]});

describe('Multiple proofs in a single response', function() {
  setupMatrix.call(this, match, 'Issuer');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    const probeBody = endpoints.issuer?.settings?.probes?.multiProofIssueBody;
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      it(NORMATIVE.issuing.multipleProofs, async function() {
        this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#issue-credential';
        if(!probeBody) {
          this.skip(
            'Configure issuers[].settings.probes.multiProofIssueBody to run.'
          );
        }
        const {issuedVc, result, error} =
          await endpoints.issueCredentialWithBody(probeBody);
        skipIfNotImplemented(this, {
          result,
          label: 'POST /credentials/issue (multi-proof probe)'
        });
        shouldReturnHttpResult({result, error});
        expect(result.status).to.equal(201);
        shouldAttachMultipleProofsInSingleResponse(issuedVc);
      });
    });
  }
});
