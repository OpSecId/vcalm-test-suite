/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import chai from 'chai';
import {NORMATIVE} from '../normative-statements.js';

const should = chai.should();

describe('VCALM §3.4 Requesting a Presentation', function() {
  it(NORMATIVE.requestingPresentation.queryRequired, function() {
    const vpr = {
      query: [{
        type: 'QueryByExample',
        credentialQuery: {reason: 'interop probe'}
      }]
    };
    should.exist(vpr.query, 'Expected query property.');
  });
});
