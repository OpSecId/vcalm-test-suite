/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {listImplementationEndpoints, VCALM_TAG} from '../helpers.js';
import {filterByTag} from 'vc-test-suite-implementations';
import {NORMATIVE} from '../normative-statements.js';
import {shouldDeclareInstancePayloadLimit} from '../assertions.js';

const tag = VCALM_TAG;
const {match} = filterByTag({tags: [tag]});

describe('Instance payload limits', function() {
  it(NORMATIVE.security.instancePayloadLimits, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#instance-payload-limits';
    const endpoints = [...match.values()].flatMap(listImplementationEndpoints);
    const declared = endpoints
      .map(endpoint => endpoint.settings)
      .filter(settings => settings?.instancePayloadLimitBytes !== undefined);
    if(declared.length === 0) {
      this.skip(
        'Optional: set settings.instancePayloadLimitBytes to audit.'
      );
    }
    for(const settings of declared) {
      shouldDeclareInstancePayloadLimit(settings);
    }
  });
});
