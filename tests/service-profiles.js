/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

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
      body: {}
    }]
  },
  verifier: {
    label: 'Verifier service',
    property: 'verifiers',
    required: [{
      id: 'verifyCredential',
      title: 'Verify Credential',
      section: '§3.3.1',
      link: 'https://www.w3.org/TR/vcalm-1.0/#verify-credential',
      method: 'post',
      body: {}
    }]
  },
  vpVerifier: {
    label: 'Verifier service (presentation)',
    property: 'vpVerifiers',
    required: [{
      id: 'verifyPresentation',
      title: 'Verify Presentation',
      section: '§3.3.2',
      link: 'https://www.w3.org/TR/vcalm-1.0/#verify-presentation',
      method: 'post',
      body: {}
    }]
  }
};

/**
 * Holder / workflow / status roles need stateful paths.
 * Optional `probes` on a workflow endpoint setting in localConfig.
 */
export const OPTIONAL_SERVICE_ROLES = {
  holder: {
    label: 'Holder service',
    property: 'workflows',
    probeKey: 'holder',
    required: [{
      id: 'exchangeProtocols',
      title: 'Get Exchange Protocols',
      section: '§3.6.4',
      link: 'https://www.w3.org/TR/vcalm-1.0/#get-exchange-protocols',
      method: 'get',
      probeField: 'exchangeProtocols'
    }, {
      id: 'participateExchange',
      title: 'Participate in an Exchange',
      section: '§3.6.5',
      link: 'https://www.w3.org/TR/vcalm-1.0/#participate-in-an-exchange',
      method: 'post',
      body: {},
      probeField: 'participateExchange'
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
