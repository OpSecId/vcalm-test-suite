/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {createGroupedQueryPresentationRequest} from '../mock.data.js';
import {describeFixtureSuite} from '../helpers.js';
import {NORMATIVE} from '../normative-statements.js';
import {shouldDescribeLogicalQueryGroups} from '../assertions.js';

describeFixtureSuite('Logical Operations in Queries', function() {
  it(NORMATIVE.requestingPresentation.logicalOperations, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#logical-operations-in-queries';
    const vpr = createGroupedQueryPresentationRequest();
    shouldDescribeLogicalQueryGroups(vpr);
  });
});
