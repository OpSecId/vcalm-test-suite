/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  createConformanceProbeIssueBody,
  createConformanceProbeVerifyCredentialBody,
  createConformanceProbeVerifyPresentationBody
} from './negative-fixtures.js';

/**
 * §1.3 service roles and their minimum required HTTP interfaces.
 * Endpoint URLs come from localConfig / vc-test-suite-implementations.
 */
export const SERVICE_ROLES = {
  issuer: {
    label: 'Issuer service',
    property: 'issuers',
    required: [{
      id: 'issueCredential',
      title: 'Issue Credential',
      section: '§3.2.1',
      link: 'https://www.w3.org/TR/vcalm-1.0/#issue-credential',
      method: 'post',
      body: createConformanceProbeIssueBody(),
      probeKind: 'issueMalformed'
    }]
  },
  verifier: {
    label: 'Verifier service',
    property: 'verifiers',
    groupConformance: true,
    required: [{
      id: 'verifyCredential',
      title: 'Verify Credential',
      section: '§3.3.1',
      link: 'https://www.w3.org/TR/vcalm-1.0/#verify-credential',
      method: 'post',
      verifyOperation: 'credential',
      body: createConformanceProbeVerifyCredentialBody(),
      probeKind: 'verifyMalformed'
    }, {
      id: 'verifyPresentation',
      title: 'Verify Presentation',
      section: '§3.3.2',
      link: 'https://www.w3.org/TR/vcalm-1.0/#verify-presentation',
      method: 'post',
      verifyOperation: 'presentation',
      body: createConformanceProbeVerifyPresentationBody(),
      probeKind: 'verifyMalformed'
    }]
  }
};

/**
 * Holder / workflow / status roles need stateful paths.
 * Holder §1.3 checks use suite fixture workflow/exchange ids (see helpers.js).
 */
export const OPTIONAL_SERVICE_ROLES = {
  holder: {
    label: 'Holder service',
    property: 'workflows',
    required: [{
      id: 'exchangeProtocols',
      title: 'Get Exchange Protocols',
      section: '§3.6.4',
      link: 'https://www.w3.org/TR/vcalm-1.0/#get-exchange-protocols',
      method: 'get'
    }, {
      id: 'participateExchange',
      title: 'Participate in an Exchange',
      section: '§3.6.5',
      link: 'https://www.w3.org/TR/vcalm-1.0/#participate-in-an-exchange',
      method: 'post',
      body: {}
    }]
  },
  status: {
    label: 'Status service',
    property: 'issuers',
    tag: 'VCALM:status',
    required: [{
      id: 'updateCredentialStatus',
      title: 'Update Status',
      section: 'Appendix C.3',
      link: 'https://www.w3.org/TR/vcalm-1.0/#update-status',
      method: 'post',
      body: {},
      pathSuffix: '/credentials/status'
    }]
  }
};
