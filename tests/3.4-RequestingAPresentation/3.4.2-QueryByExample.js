/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import chai from 'chai';
import {createQueryByExampleEntry} from '../mock.data.js';

chai.should();

describe('VCALM §3.4.2 Query By Example', function() {
  it('SHOULD signal selective-disclosure cryptosuites in acceptedCryptosuites.',
    function() {
      this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#query-by-example';
      const entry = createQueryByExampleEntry();
      const suites = entry.credentialQuery.acceptedCryptosuites.map(
        item => typeof item === 'string' ? item : item.cryptosuite
      );
      suites.should.include('bbs-2023');
      suites.should.include('ecdsa-sd-2023');
    });
});
