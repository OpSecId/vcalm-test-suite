/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

/**
 * Read the issued credential from a VCALM response body.
 *
 * @param {object} data - Parsed JSON response body.
 * @returns {object|undefined} The `verifiableCredential` value when present.
 */
export function extractIssuedCredential(data) {
  if(data == null || typeof data !== 'object') {
    return undefined;
  }
  return data.verifiableCredential;
}

/**
 * Read the created presentation from a VCALM response body.
 *
 * @param {object} data - Parsed JSON response body.
 * @returns {object|undefined} The `verifiablePresentation` value when present.
 */
export function extractCreatedPresentation(data) {
  if(data == null || typeof data !== 'object') {
    return undefined;
  }
  return data.verifiablePresentation;
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
