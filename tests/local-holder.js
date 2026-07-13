/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

/**
 * Suite-local did:key issuer + holder for verify-path fixtures.
 * Two fixed Ed25519 keys (eddsa-rdfc-2022). Remote verifiers only need
 * to check the produced VC / VP; §3.2.1 still uses remote issuers.
 */

import * as ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import * as vc from '@digitalbazaar/vc';
import {CONTEXT, CONTEXT_URL} from '@digitalbazaar/data-integrity-context';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {
  cryptosuite as eddsaRdfc2022Cryptosuite
} from '@digitalbazaar/eddsa-rdfc-2022-cryptosuite';
import {createRequire} from 'node:module';
import {klona} from 'klona';
import {randomFillSync} from 'node:crypto';

const require = createRequire(import.meta.url);
const validVc = require('./validVc.json');

const buf = Buffer.alloc(16);
export const LOCAL_HOLDER_CHALLENGE =
  'u' + randomFillSync(buf).toString('base64url');
export const LOCAL_HOLDER_DOMAIN = 'github.com/w3c/vcalm-test-suite';

/** Deterministic seed-fill(1) Ed25519 did:key — issues VCs. */
export const LOCAL_ISSUER_DID =
  'did:key:z6Mkon3Necd6NkkyfoGoHxid2znGc59LU3K7mubaRcFbLfLX';

/** Deterministic seed-fill(2) Ed25519 did:key — signs VPs. */
export const LOCAL_HOLDER_DID =
  'did:key:z6Mko9hTggMwjSTEaJaPUfE6tqcy2xvU6BnNq3e3o8qVBiyH';

const LOCAL_ISSUER_KEYS = {
  publicKeyMultibase: 'z6Mkon3Necd6NkkyfoGoHxid2znGc59LU3K7mubaRcFbLfLX',
  secretKeyMultibase:
    'zruzf4Y29hDp7vLoV3NWzuymGMTtJcQfttAWzESod4wV2fbPvEp4XtzGp2VWwQSQA' +
    'XMxDyqrnVurYg2sBiqiu1FHDDM'
};

const LOCAL_HOLDER_KEYS = {
  publicKeyMultibase: 'z6Mko9hTggMwjSTEaJaPUfE6tqcy2xvU6BnNq3e3o8qVBiyH',
  secretKeyMultibase:
    'zruzgE4EREf3BaNgUAGSMGyjZGwYvQiSrnoScvdRPnQvpmK8Ae9ixjNuWrUt9rsYF' +
    'kLawXUZwZUh4yitGoJncbxyzuR'
};

const documentLoader = url => {
  if(url === CONTEXT_URL) {
    return {
      contextUrl: null,
      documentUrl: url,
      document: CONTEXT
    };
  }
  return vc.defaultDocumentLoader(url);
};

async function loadDidKeySigner({publicKeyMultibase, secretKeyMultibase}) {
  const did = `did:key:${publicKeyMultibase}`;
  const verificationKeyPair = await ed25519Multikey.from({
    id: did,
    controller: did,
    publicKeyMultibase,
    secretKeyMultibase
  });
  const signer = verificationKeyPair.signer();
  signer.id = `${did}#${publicKeyMultibase}`;
  return {signer, did};
}

function suiteFor(signer) {
  return new DataIntegrityProof({
    signer,
    cryptosuite: eddsaRdfc2022Cryptosuite
  });
}

/**
 * Issue a VC with the suite-local issuer did:key.
 *
 * @param {object} [options] - Options.
 * @param {object} [options.credential] - Unsigned credential template.
 * @returns {Promise<object>} Secured verifiable credential.
 */
export async function createLocalDidKeyVc({credential = validVc} = {}) {
  const {signer, did} = await loadDidKeySigner(LOCAL_ISSUER_KEYS);
  const unsigned = klona(credential);
  unsigned.issuer = did;
  return vc.issue({
    credential: unsigned,
    suite: suiteFor(signer),
    documentLoader
  });
}

/**
 * Wrap already-issued VC(s) in a did:key authentication VP (local holder).
 *
 * @param {object} options - Options.
 * @param {object|object[]} options.verifiableCredential - Issued VC(s).
 * @param {string} [options.challenge] - Authn challenge.
 * @param {string} [options.domain] - Authn domain.
 * @returns {Promise<object>} Secured verifiable presentation.
 */
export async function createLocalDidKeyVp({
  verifiableCredential,
  challenge = LOCAL_HOLDER_CHALLENGE,
  domain = LOCAL_HOLDER_DOMAIN
} = {}) {
  const {signer, did} = await loadDidKeySigner(LOCAL_HOLDER_KEYS);
  const credentials = Array.isArray(verifiableCredential) ?
    verifiableCredential :
    [verifiableCredential];
  for(const credential of credentials) {
    if(!credential?.proof) {
      throw new Error(
        'createLocalDidKeyVp expects issued credentials with proofs.'
      );
    }
  }
  const presentation = {
    '@context': ['https://www.w3.org/ns/credentials/v2'],
    type: ['VerifiablePresentation'],
    holder: did,
    verifiableCredential: credentials.map(vcDoc => klona(vcDoc))
  };
  return vc.signPresentation({
    presentation,
    suite: suiteFor(signer),
    documentLoader,
    challenge,
    domain
  });
}

/**
 * Issue a local VC then wrap it in a local VP (issuer + holder did:keys).
 *
 * @param {object} [options] - Options forwarded to issue / present.
 * @returns {Promise<{verifiableCredential: object,
 *   verifiablePresentation: object}>} Local fixtures.
 */
export async function createLocalDidKeyPresentedVc(options = {}) {
  const verifiableCredential = await createLocalDidKeyVc(options);
  const verifiablePresentation = await createLocalDidKeyVp({
    verifiableCredential,
    challenge: options.challenge,
    domain: options.domain
  });
  return {verifiableCredential, verifiablePresentation};
}
