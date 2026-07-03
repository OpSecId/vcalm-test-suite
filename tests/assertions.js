/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import chai from 'chai';

import {parseInteractionSchemeUrl} from './helpers.js';

const should = chai.should();

export function shouldReturnHttpResult({result, error}) {
  should.not.exist(error, `Expected no error, got ${error?.message}`);
  should.exist(result, 'Expected an HTTP result.');
  should.exist(result.status, 'Expected an HTTP status code.');
}

export function shouldBeIssuedVc({issuedVc}) {
  issuedVc.should.be.an(
    'object',
    'Expected the issued verifiable credential to be an object.'
  );
  issuedVc.should.have.property('@context');
  issuedVc.should.have.property('type');
  issuedVc.type.should.include(
    'VerifiableCredential',
    'Expected `type` to include "VerifiableCredential".'
  );
  issuedVc.should.have.property('proof');
  issuedVc.proof.should.be.an('object', 'Expected `proof` to be an object.');
}

export function skipIfNotImplemented(test, {result, label}) {
  if(result?.status === 404 || result?.status === 501) {
    test.skip(`${label} not implemented (HTTP ${result.status}).`);
  }
}

export function shouldVerifyCredential({data, result}) {
  shouldReturnHttpResult({result});
  result.status.should.equal(200, 'Expected status code 200.');
  data.should.be.an('object', 'Expected a verification result object.');
  shouldReflectVerificationErrorsVsWarnings(data);
}

export function verificationErrorsIn(data) {
  if(Array.isArray(data?.errors)) {
    return data.errors;
  }
  return [];
}

export function verificationWarningsIn(data) {
  if(Array.isArray(data?.warnings)) {
    return data.warnings;
  }
  return [];
}

export function shouldReflectVerificationErrorsVsWarnings(data) {
  data.should.have.property('verified');
  const errors = verificationErrorsIn(data);
  if(errors.length > 0) {
    data.verified.should.equal(
      false,
      'Expected verified to be false when errors are included.'
    );
  } else {
    data.verified.should.equal(
      true,
      'Expected verified to be true when no errors are included.'
    );
  }
}

export function shouldReportVerificationFailure({data, result}) {
  shouldReturnHttpResult({result});
  result.status.should.equal(200, 'Expected status code 200.');
  data.should.be.an('object', 'Expected a verification result object.');
  data.verified.should.equal(false, 'Expected verified to be false.');
  const errors = verificationErrorsIn(data);
  const problemDetails = Array.isArray(data.problemDetails) ?
    data.problemDetails : [];
  (errors.length > 0 || problemDetails.length > 0).should.equal(
    true,
    'Expected verification errors or problemDetails in the response.'
  );
}

export function shouldVerifyPresentation({data, result}) {
  shouldVerifyCredential({data, result});
}

export function shouldCreateChallenge({data, result}) {
  shouldReturnHttpResult({result});
  result.status.should.equal(200, 'Expected status code 200.');
  data.should.be.an('object', 'Expected a challenge result object.');
  data.should.have.property('challenge');
  data.challenge.should.be.a('string').and.not.be.empty;
}

export function shouldSatisfyVprQueryRequirements(vpr) {
  vpr.should.have.property('query');
  vpr.query.should.be.an('array').that.is.not.empty;
  for(const entry of vpr.query) {
    entry.should.have.property('type');
    entry.type.should.be.a('string').and.not.be.empty;
  }
}

export function shouldCreateWorkflow({result, error}) {
  shouldReturnHttpResult({result, error});
  [201, 204].should.include(
    result.status,
    'Expected status code 201 or 204.'
  );
  const location = result.headers?.get?.('location') ??
    result.headers?.get?.('Location');
  should.exist(location, 'Expected Location header.');
}

export function shouldGetWorkflowConfiguration({data, result, error}) {
  shouldReturnHttpResult({result, error});
  result.status.should.equal(200, 'Expected status code 200.');
  data.should.be.an('object');
  data.should.have.property('steps');
}

export function shouldGetExchangeState({data, result, error}) {
  shouldReturnHttpResult({result, error});
  result.status.should.equal(200, 'Expected status code 200.');
  data.should.be.an('object');
}

export function shouldGetExchangeProtocols({data, result, error}) {
  shouldGetExchangeState({data, result, error});
}

export function shouldParticipateInExchange({data, result, error}) {
  shouldReturnHttpResult({result, error});
  result.status.should.equal(200, 'Expected status code 200.');
  data.should.be.an('object');
}

export function shouldSatisfyInteractionUrlFormat(interactionUrl) {
  const url = new URL(interactionUrl);
  url.searchParams.get('iuv').should.equal('1', 'Expected iuv=1.');
}

export function shouldFitInteractionQrCodeLimits(interactionUrl) {
  interactionUrl.length.should.be.at.most(
    4296,
    'Interaction URL MUST NOT exceed 4,296 characters.'
  );
}

export function shouldConformToInteractionScheme(schemeUrl, interactionUrl) {
  const parsed = parseInteractionSchemeUrl(schemeUrl);
  parsed.href.should.equal(new URL(interactionUrl).href);
}

export function shouldAdvertiseInteractionProtocols(protocols) {
  protocols.should.be.an('object');
  const hasInvite = typeof protocols.inviteRequest === 'string';
  const hasVcapi = typeof protocols.vcapi === 'string';
  (hasInvite || hasVcapi).should.equal(
    true,
    'Expected inviteRequest and/or vcapi protocol URL.'
  );
}

export function shouldBeCreatedPresentation({vp, result, error}) {
  should.not.exist(
    error,
    `Expected no error creating presentation: ${error?.message}`
  );
  shouldReturnHttpResult({result});
  result.status.should.equal(201, 'Expected status code 201.');
  should.exist(vp, 'Expected a verifiablePresentation.');
  vp.should.have.property('type');
  vp.type.should.include('VerifiablePresentation');
  vp.should.have.property('proof');
}

export function shouldExposeServiceEndpoint({result, error, label}) {
  should.not.exist(
    error,
    `Expected HTTP response for ${label}, got error: ${error?.message}`
  );
  should.exist(result, `Expected HTTP result for ${label}.`);
  result.status.should.not.equal(
    404,
    `Expected ${label} to be exposed (got 404 Not Found).`
  );
  result.status.should.not.equal(
    501,
    `Expected ${label} to be implemented (got 501 Not Implemented).`
  );
}
