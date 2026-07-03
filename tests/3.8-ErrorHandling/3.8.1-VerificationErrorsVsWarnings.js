/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  implementationsWithIssuerAndVerifier,
  implementationsWithPresentationFlow,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {
  createTamperedVerifiableCredential,
  createVerificationResultFixture,
  problemDetailFixture,
  warningFixture
} from '../mock.data.js';
import {
  shouldBeCreatedPresentation,
  shouldReflectVerificationErrorsVsWarnings,
  shouldReportVerificationFailure,
  shouldVerifyCredential,
  shouldVerifyPresentation,
  skipIfNotImplemented
} from '../assertions.js';
import chai from 'chai';
import {filterByTag} from 'vc-test-suite-implementations';
import {TestEndpoints} from '../TestEndpoints.js';

const should = chai.should();
const tag = VCALM_TAG;
const verifyOptions = {returnProblemDetails: true};
const {match} = filterByTag({tags: [tag]});
const vcPaired = implementationsWithIssuerAndVerifier(match, tag);
const vpPaired = implementationsWithPresentationFlow(match, tag);

describe('VCALM §3.8.1 Verification Errors vs. Warnings', function() {
  it('MUST set verified to false when errors are included.', function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#verification-errors-vs-warnings';
    shouldReflectVerificationErrorsVsWarnings(createVerificationResultFixture({
      verified: false,
      errors: [problemDetailFixture],
      warnings: [warningFixture]
    }));
  });

  it('MUST set verified to true when only warnings are included.', function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#verification-errors-vs-warnings';
    shouldReflectVerificationErrorsVsWarnings(createVerificationResultFixture({
      verified: true,
      errors: [],
      warnings: [warningFixture]
    }));
  });

  it('MUST set verified to true when no errors are included.', function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#verification-errors-vs-warnings';
    shouldReflectVerificationErrorsVsWarnings(createVerificationResultFixture({
      verified: true,
      errors: [],
      warnings: []
    }));
  });

  describe('Verify credential', function() {
    setupMatrix.call(this, new Map(vcPaired), 'Verifier');
    for(const [name, implementation] of vcPaired) {
      const endpoints = new TestEndpoints({implementation, tag});
      describe(name, function() {
        let issuedVc;
        beforeEach(addPerTestMetadata);
        before(async function() {
          issuedVc = await endpoints.issue();
        });
        it('MUST set verified true for a valid issued credential (HTTP 200).',
          async function() {
            this.test.link =
              'https://www.w3.org/TR/vcalm-1.0/#verification-errors-vs-warnings';
            should.exist(issuedVc, `Expected ${name} to issue a VC first.`);
            const {data, result} = await endpoints.verifyCredential(
              issuedVc,
              verifyOptions
            );
            shouldVerifyCredential({data, result});
          });
        it('MUST set verified false when verification errors are reported.',
          async function() {
            this.test.link =
              'https://www.w3.org/TR/vcalm-1.0/#verification-errors-vs-warnings';
            should.exist(issuedVc, `Expected ${name} to issue a VC first.`);
            const tampered = createTamperedVerifiableCredential(issuedVc);
            const {data, result} = await endpoints.verifyCredential(
              tampered,
              verifyOptions
            );
            skipIfNotImplemented(this, {
              result,
              label: 'POST /credentials/verify (tampered credential)'
            });
            if(result.status >= 400 && result.status < 500) {
              this.skip(
                `Verifier returned HTTP ${result.status} instead of 200 ` +
                'with verified: false.'
              );
            }
            shouldReportVerificationFailure({data, result});
            shouldReflectVerificationErrorsVsWarnings(data);
          });
      });
    }
  });

  describe('Verify presentation', function() {
    setupMatrix.call(this, new Map(vpPaired), 'Verifier');
    for(const [name, implementation] of vpPaired) {
      const endpoints = new TestEndpoints({implementation, tag});
      describe(name, function() {
        let verifiablePresentation;
        beforeEach(addPerTestMetadata);
        before(async function() {
          const issuedVc = await endpoints.issue();
          should.exist(issuedVc, `Expected ${name} to issue a VC first.`);
          const created = await endpoints.createPresentation({issuedVc});
          shouldBeCreatedPresentation({
            vp: created.verifiablePresentation,
            result: created.result,
            error: created.error
          });
          verifiablePresentation = created.verifiablePresentation;
        });
        it('MUST set verified true for a valid presentation (HTTP 200).',
          async function() {
            this.test.link =
              'https://www.w3.org/TR/vcalm-1.0/#verification-errors-vs-warnings';
            should.exist(
              verifiablePresentation,
              `Expected ${name} to create a VP first.`
            );
            const {data, result} = await endpoints.verifyPresentation(
              verifiablePresentation,
              verifyOptions
            );
            shouldVerifyPresentation({data, result});
          });
        it('MUST set verified false when presentation verification fails.',
          async function() {
            this.test.link =
              'https://www.w3.org/TR/vcalm-1.0/#verification-errors-vs-warnings';
            should.exist(
              verifiablePresentation,
              `Expected ${name} to create a VP first.`
            );
            const tampered = createTamperedVerifiableCredential(
              verifiablePresentation
            );
            const {data, result} = await endpoints.verifyPresentation(
              tampered,
              verifyOptions
            );
            skipIfNotImplemented(this, {
              result,
              label: 'POST /presentations/verify (tampered presentation)'
            });
            if(result.status >= 400 && result.status < 500) {
              this.skip(
                `Verifier returned HTTP ${result.status} instead of 200 ` +
                'with verified: false.'
              );
            }
            shouldReportVerificationFailure({data, result});
            shouldReflectVerificationErrorsVsWarnings(data);
          });
      });
    }
  });
});
