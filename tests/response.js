/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

/**
 * Normalize a VC issue HTTP response body to the issued credential object.
 *
 * @param {object} data - Parsed JSON from POST /credentials/issue.
 * @returns {object} The issued verifiable credential.
 */
export function extractIssuedCredential(data) {
  if(data == null || typeof data !== 'object') {
    return data;
  }
  if(data.verifiableCredential !== undefined) {
    return data.verifiableCredential;
  }
  if(data.credential !== undefined) {
    return data.credential;
  }
  return data;
}

/**
 * Normalize a create-presentation HTTP response body to the signed VP.
 *
 * @param {object} data - Parsed JSON from POST /presentations.
 * @returns {object} The verifiable presentation.
 */
export function extractCreatedPresentation(data) {
  if(data == null || typeof data !== 'object') {
    return data;
  }
  if(data.verifiablePresentation !== undefined) {
    return data.verifiablePresentation;
  }
  if(data.presentation !== undefined) {
    return data.presentation;
  }
  return data;
}

/**
 * Read the last path segment from a `Location` response header.
 *
 * @param {object} result - Sanitized HTTP response.
 * @returns {string|undefined} Resource id from the header.
 */
export function extractLocationResourceId(result) {
  const location = result?.headers?.get?.('location') ??
    result?.headers?.get?.('Location');
  if(!location) {
    return undefined;
  }
  const pathname = location.startsWith('http') ?
    new URL(location).pathname :
    location;
  const segments = pathname.split('/').filter(Boolean);
  return segments[segments.length - 1];
}
