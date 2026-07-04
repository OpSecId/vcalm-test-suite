/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  shouldAllowServerReferenceId,
  shouldEchoReferenceId,
  shouldUseUrnUuidReferenceId
} from '../assertions.js';
import {createInviteResponseFixture} from '../mock.data.js';
import {NORMATIVE} from '../normative-statements.js';

describe('Exchange referenceId', function() {
  it(NORMATIVE.workflows.referenceIdServerMay, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#participate-in-an-exchange';
    const invite = createInviteResponseFixture();
    shouldAllowServerReferenceId(invite);
  });

  it(NORMATIVE.workflows.referenceIdUrnUuid, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#participate-in-an-exchange';
    const invite = createInviteResponseFixture();
    shouldUseUrnUuidReferenceId(invite.referenceId);
  });

  it(NORMATIVE.workflows.referenceIdEcho, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#participate-in-an-exchange';
    const serverMessage = {
      referenceId: 'urn:uuid:417bcaf2-14d9-11f0-99d7-9f094678517b'
    };
    const clientMessage = {
      referenceId: 'urn:uuid:417bcaf2-14d9-11f0-99d7-9f094678517b'
    };
    shouldEchoReferenceId({serverMessage, clientMessage});
  });
});
