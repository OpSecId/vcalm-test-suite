/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {createRequestBody, isProofSetCryptosuite} from '../mock.data.js';
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
    const cryptosuite = endpoints.issuer?.settings?.options?.cryptosuite;
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      it(NORMATIVE.issuing.multipleProofs, async function() {
        this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#issue-credential';
        if(!isProofSetCryptosuite(cryptosuite)) {
          this.skip(
            'Configure issuers[].options.cryptosuite as a string array to run.'
          );
        }
        const issueBody = createRequestBody({issuer: endpoints.issuer});
        const {issuedVc, data, result, error} =
          await endpoints.issueCredentialWithBody(issueBody);
        skipIfNotImplemented(this, {
          result,
          label: 'POST /credentials/issue (multi-proof probe)'
        });
        shouldReturnHttpResult({result, error});
        expect(result.status).to.equal(201);
        data.should.have.property('verifiableCredential');
        shouldAttachMultipleProofsInSingleResponse(issuedVc);
      });
    });
  }
});
