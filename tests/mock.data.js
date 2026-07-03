/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {createRequire} from 'node:module';
import {klona} from 'klona';
import {resolveInteractionStartUrl} from './helpers.js';
import {v4 as uuidv4} from 'uuid';
const require = createRequire(import.meta.url);
const validVc = require('./validVc.json');

export function createRequestBody({issuer, vc = validVc}) {
  const {settings: {id, options} = {}} = issuer;
  const credential = klona(vc);
  credential.id = credential.id || `urn:uuid:${uuidv4()}`;
  if(credential.issuer !== null && typeof credential.issuer === 'object') {
    if(!('id' in credential.issuer && credential.issuer.id === null)) {
      credential.issuer.id = credential.issuer?.id || id;
    }
  } else if(!('issuer' in credential && credential.issuer === null)) {
    credential.issuer = credential?.issuer || id;
  }
  return {credential, options};
}

export function createVerifyRequestBody({verifier, vc, options = {}}) {
  const {settings: {options: instanceOptions} = {}} = verifier;
  return {
    verifiableCredential: vc,
    options: {...instanceOptions, ...options}
  };
}

export function createPresentationRequestBody({
  holder, vcs, presentation, options = {}
}) {
  const {settings: {options: instanceOptions} = {}} = holder;
  const unsignedPresentation = presentation ?? {
    '@context': ['https://www.w3.org/ns/credentials/v2'],
    type: ['VerifiablePresentation'],
    verifiableCredential: vcs
  };
  return {
    presentation: unsignedPresentation,
    options: {...instanceOptions, ...options}
  };
}

/**
 * §3.5.1 derive credential request body.
 *
 * @param {object} options - Options.
 * @param {object} options.holder - Holder endpoint.
 * @param {object} options.vc - Source verifiable credential.
 * @param {object} [options.options] - Derive options.
 * @returns {object} Derive credential request.
 */
export function createDeriveRequestBody({holder, vc, options = {}}) {
  const {settings: {options: instanceOptions} = {}} = holder;
  return {
    verifiableCredential: vc,
    options: {...instanceOptions, ...options}
  };
}

export function createVerifyVpRequestBody({vpVerifier, vp, options = {}}) {
  const {settings: {options: instanceOptions} = {}} = vpVerifier;
  return {
    verifiablePresentation: vp,
    options: {...instanceOptions, ...options}
  };
}

/**
 * §3.4.2 QueryByExample entry for a Verifiable Presentation Request.
 *
 * @returns {object} Query map for a VPR.
 */
export function createQueryByExampleEntry() {
  return {
    type: 'QueryByExample',
    credentialQuery: {
      reason: 'Interop test credential request.',
      example: {
        '@context': ['https://www.w3.org/ns/credentials/v2'],
        type: 'VerifiableCredential'
      },
      acceptedCryptosuites: [
        {cryptosuite: 'bbs-2023'},
        {cryptosuite: 'ecdsa-sd-2023'},
        {cryptosuite: 'eddsa-rdfc-2022'}
      ]
    }
  };
}

/**
 * §3.4.1 Verifiable Presentation Request fixture.
 *
 * @param {object} [options] - Options.
 * @param {object[]} [options.queries] - Query entries.
 * @returns {object} Verifiable Presentation Request object.
 */
export function createVerifiablePresentationRequest({queries} = {}) {
  return {
    query: queries ?? [createQueryByExampleEntry()],
    challenge: `urn:uuid:${uuidv4()}`,
    domain: 'vcalm.test'
  };
}

/**
 * §3.6.1 minimal create-workflow request fixture.
 *
 * @param {object} [options] - Options.
 * @param {string} [options.id] - Workflow id.
 * @param {string} [options.initialStep] - Initial step name.
 * @returns {object} Create workflow request body.
 */
export function createWorkflowRequest({id, initialStep = 'start'} = {}) {
  return {
    id: id ?? `urn:uuid:${uuidv4()}`,
    initialStep,
    steps: {
      start: {
        verifiablePresentationRequest: createVerifiablePresentationRequest()
      }
    }
  };
}

/**
 * §3.6.3 minimal create-exchange request fixture.
 *
 * @returns {object} Create exchange request body.
 */
export function createExchangeRequest() {
  return {variables: {}};
}

/**
 * §3.7.1 interaction URL fixture.
 *
 * @param {object} [options] - Options.
 * @param {string} [options.baseUrl] - Instance root URL.
 * @param {string} [options.interactionId] - Interaction id.
 * @returns {string} Interaction start URL.
 */
export function createInteractionUrl({
  baseUrl = 'https://vcalm.example',
  interactionId = 'urn:uuid:interaction-fixture'
} = {}) {
  return resolveInteractionStartUrl(baseUrl, interactionId);
}

/**
 * §3.7.4 protocols object fixture (`inviteRequest` and/or `vcapi`).
 *
 * @returns {object} Protocols response body.
 */
export function createInteractionProtocolsFixture() {
  return {
    inviteRequest:
      'https://website.example/invitation/87654321/invite-request/response',
    vcapi:
      'https://vcapi.example/workflows/z1A1FjMfnG/exchanges/z19mxakBFecZ'
  };
}

/**
 * §3.7.5 inviteResponse fixture.
 *
 * @returns {object} Invite response request body.
 */
export function createInviteResponseFixture() {
  return {
    url: 'https://website.example/checkout/8372974',
    purpose: 'VCALM interop test interaction',
    referenceId: `urn:uuid:${uuidv4()}`
  };
}

const problemDetailFixture = {
  type: 'https://www.w3.org/TR/vc-data-model-2.0/#CRYPTOGRAPHIC_SECURITY_ERROR',
  title: 'CRYPTOGRAPHIC_SECURITY_ERROR',
  detail: 'Proof verification failed.'
};

const warningFixture = {
  type: 'https://www.w3.org/TR/vc-data-model-2.0/#VALID_UNTIL_WARNING',
  title: 'VALID_UNTIL_WARNING',
  detail: 'Credential is past validUntil.'
};

/**
 * §3.8.1 verification result fixture.
 *
 * @param {object} [options] - Options.
 * @param {boolean} [options.verified] - Overall verification assertion.
 * @param {object[]} [options.errors] - Verification errors.
 * @param {object[]} [options.warnings] - Verification warnings.
 * @returns {object} Verification result object.
 */
export function createVerificationResultFixture({
  verified = true,
  errors = [],
  warnings = []
} = {}) {
  return {verified, errors, warnings};
}

export {problemDetailFixture, warningFixture};

/**
 * Tamper an issued credential so verification should fail.
 *
 * @param {object} issuedVc - Issued verifiable credential.
 * @returns {object} Tampered verifiable credential.
 */
export function createTamperedVerifiableCredential(issuedVc) {
  const tampered = klona(issuedVc);
  if(tampered.proof?.proofValue) {
    tampered.proof.proofValue = `${tampered.proof.proofValue}x`;
  } else if(tampered.proof) {
    delete tampered.proof.proofValue;
  }
  return tampered;
}
