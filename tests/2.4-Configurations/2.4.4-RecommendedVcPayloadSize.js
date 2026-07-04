/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  listImplementationEndpoints,
  RECOMMENDED_VC_PAYLOAD_BYTES,
  VCALM_TAG
} from '../helpers.js';
import {
  shouldDeclareVcPayloadLimit,
  shouldRecommendVcPayloadBaseline
} from '../assertions.js';
import {filterByTag} from 'vc-test-suite-implementations';
import {NORMATIVE} from '../normative-statements.js';

const tag = VCALM_TAG;
const {match} = filterByTag({tags: [tag]});

describe('Recommended VC payload baseline', function() {
  it(NORMATIVE.configuration.vcPayloadBaseline, function() {
    this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#payload-sizes';
    shouldRecommendVcPayloadBaseline(RECOMMENDED_VC_PAYLOAD_BYTES);
  });

  it(
    `${NORMATIVE.configuration.vcPayloadBaseline} (declared limit)`,
    function() {
      this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#payload-sizes';
      const endpoints = [...match.values()]
        .flatMap(listImplementationEndpoints);
      const declared = endpoints
        .map(endpoint => endpoint.settings)
        .filter(settings => settings?.vcPayloadLimitBytes !== undefined);
      if(declared.length === 0) {
        this.skip(
          'Optional: set settings.vcPayloadLimitBytes on endpoints to audit.'
        );
      }
      for(const settings of declared) {
        shouldDeclareVcPayloadLimit(settings);
      }
    }
  );
});
