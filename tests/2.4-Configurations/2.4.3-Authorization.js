/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {listImplementationEndpoints, VCALM_TAG} from '../helpers.js';
import {filterByTag} from 'vc-test-suite-implementations';
import {NORMATIVE} from '../normative-statements.js';
import {shouldNotUseLongLivedStaticCredentials} from '../assertions.js';

const tag = VCALM_TAG;
const {match} = filterByTag({tags: [tag]});

describe('Authorization', function() {
  it(NORMATIVE.configuration.mustNotStaticCredentials, function() {
    this.test.link = 'https://www.w3.org/TR/vcalm-1.0/#authorization';
    const endpoints = [...match.values()].flatMap(listImplementationEndpoints);
    shouldNotUseLongLivedStaticCredentials(endpoints);
  });
});
