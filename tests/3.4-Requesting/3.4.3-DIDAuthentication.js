/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  createDidAuthenticationPresentation,
  createDidAuthenticationQuery
} from '../mock.data.js';
import {
  shouldBeDidAuthenticationPresentation,
  shouldBeDidAuthenticationQuery
} from '../assertions.js';
import {describeFixtureSuite} from '../helpers.js';
import {NORMATIVE} from '../normative-statements.js';

describeFixtureSuite('DID Authentication', function() {
  const challenge = 'urn:uuid:did-auth-challenge';
  const domain = 'vcalm.test';
  const holderDid = 'did:web:holder.example';

  it(NORMATIVE.requestingPresentation.didAuthenticationQueryType, function() {
    this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#did-authentication';
    const query = createDidAuthenticationQuery({challenge, domain});
    shouldBeDidAuthenticationQuery(query);
  });

  it(NORMATIVE.requestingPresentation.didAuthentication, function() {
    this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#did-authentication';
    const presentation = createDidAuthenticationPresentation({
      holderDid,
      challenge,
      domain
    });
    shouldBeDidAuthenticationPresentation({
      presentation,
      challenge,
      domain,
      holderDid
    });
  });
});
