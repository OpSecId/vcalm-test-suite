/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  addPerTestMetadata,
  setupMatrix,
  VCALM_TAG
} from '../helpers.js';
import {filterByTag} from 'vc-test-suite-implementations';
import {NORMATIVE} from '../normative-statements.js';
import {shouldRejectUnknownOption} from '../assertions.js';
import {TestEndpoints} from '../TestEndpoints.js';

const tag = VCALM_TAG;
const {match} = filterByTag({property: 'issuers', tags: [tag]});

describe('Unknown options', function() {
  setupMatrix.call(this, match, 'Issuer');
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      it(NORMATIVE.configuration.unknownOptions, async function() {
        this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#options';
        const {data, result} = await endpoints.issueWithUnknownOption();
        if(result?.status === 201) {
          this.skip(
            'Issuer accepted an unknown option instead of returning an error.'
          );
        }
        shouldRejectUnknownOption({data, result});
      });
    });
  }
});
