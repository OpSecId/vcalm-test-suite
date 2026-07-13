/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

/**
 * Suite-local holder for VP fixtures. Signs with did:key + eddsa-rdfc-2022
 * only (no remote POST /presentations). Pattern mirrors
 * vc-data-model-2.0-test-suite createLocalVp.
 */

import * as ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import * as vc from '@digitalbazaar/vc';
import {CONTEXT, CONTEXT_URL} from '@digitalbazaar/data-integrity-context';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {
  cryptosuite as eddsaRdfc2022Cryptosuite
} from '@digitalbazaar/eddsa-rdfc-2022-cryptosuite';
import {klona} from 'klona';
import {randomFillSync} from 'node:crypto';

const buf = Buffer.alloc(16);
export const LOCAL_HOLDER_CHALLENGE =
  'u' + randomFillSync(buf).toString('base64url');
export const LOCAL_HOLDER_DOMAIN = 'github.com/w3c/vcalm-test-suite';

/** Fixed Ed25519 did:key (same vector as VCDM 2.0 local holder). */
export const LOCAL_HOLDER_DID =
  'did:key:z6MkpJySvETLnxhQG9DzEdmKJtysBDjuuTeDfUj1uNNCUqcj';

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

async function getDidKeySigner() {
  const publicKeyMultibase =
    'z6MkpJySvETLnxhQG9DzEdmKJtysBDjuuTeDfUj1uNNCUqcj';
  const did = `did:key:${publicKeyMultibase}`;
  const verificationKeyPair = await ed25519Multikey.from({
    id: did,
    controller: did,
    publicKeyMultibase,
    secretKeyMultibase:
      'zrv1a6V2qqSGkBz7QPw4yJedKc8X9dEdug7c3MEzNUDVEmkyV' +
      'cXtTWNLQLArgKXzN7LbGMTVjqE2CbdrqpnxqtxmY1M'
  });
  const signer = verificationKeyPair.signer();
  signer.id = `${did}#${publicKeyMultibase}`;
  return {signer, did};
}

/**
 * Wrap one or more already-issued VCs in a did:key authentication VP.
 * Embedded credentials that already have proofs are left unchanged.
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
  const {signer, did} = await getDidKeySigner();
  const credentials = Array.isArray(verifiableCredential) ?
    verifiableCredential :
    [verifiableCredential];
  for(const credential of credentials) {
    if(!credential?.proof) {
      throw new Error(
        'createLocalDidKeyVp expects issued credentials with proofs; ' +
        'did not re-issue with the holder key.'
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
    suite: new DataIntegrityProof({
      signer,
      cryptosuite: eddsaRdfc2022Cryptosuite
    }),
    documentLoader,
    challenge,
    domain
  });
}
