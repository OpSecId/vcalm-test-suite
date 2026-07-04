/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  createWorkflowWithIssueRequestResult,
  createWorkflowWithIssueRequestVariables,
  extractIssueRequest
} from '../mock.data.js';
import {
  shouldAllowIssueRequestVariables,
  shouldSatisfyIssueRequestResult
} from '../assertions.js';
import {describeFixtureSuite} from '../helpers.js';
import {NORMATIVE} from '../normative-statements.js';

describeFixtureSuite('Issue request variables and result', function() {
  it(NORMATIVE.workflows.issueRequestVariables, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#workflow-configuration';
    const workflow = createWorkflowWithIssueRequestVariables();
    shouldAllowIssueRequestVariables(extractIssueRequest(workflow));
  });

  it(NORMATIVE.workflows.issueRequestResult, function() {
    this.test.link =
      'https://www.w3.org/TR/vcalm-1.0/#workflow-configuration';
    const workflow = createWorkflowWithIssueRequestResult();
    shouldSatisfyIssueRequestResult(extractIssueRequest(workflow));
    shouldSatisfyIssueRequestResult({result: 'issuedCredential'});
  });
});
