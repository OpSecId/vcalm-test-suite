/*
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

/**
 * Normative VCALM statement text (RFC 2119) for future Mocha `it()` titles.
 *
 * Scope: RFC 2119 prose, conformance, and configuration from the VCALM TR.
 * OpenAPI property-table blurbs and suite-authored test titles are excluded.
 */

export const NORMATIVE = {
  conformance: {
    issuer:
      'A conforming issuer service implementation MUST provide the interface ' +
      'described in Section Issue Credential. Other interfaces described in ' +
      'Section Issuing MAY also be provided.',
    verifier:
      'A conforming verifier service implementation MUST provide the ' +
      'interface described in Section Verify Credential and Section ' +
      'Verify Presentation. Other interfaces described in Section ' +
      'Verifying MAY also be provided.',
    holder:
      'A conforming holder service implementation MUST provide the interface ' +
      'described in Section Get Exchange Protocols and Section ' +
      'Participate in an Exchange. Conformance to protocols, query ' +
      'languages, and data formats described in Section Initiating ' +
      'Interactions, Section Requesting a Presentation, Section Create ' +
      'Presentation, Section Presenting, and Section Workflows and ' +
      'Exchanges MAY also be provided.',
    status:
      'A conforming status service implementation MUST provide the interface ' +
      'described in Section Update Status.',
    workflow:
      'A conforming workflow service implementation MUST provide all ' +
      'interfaces Section Workflows and Exchanges.',
    serviceClient:
      'A conforming service client implementation MUST provide the means ' +
      'to communicate with all REQUIRED interfaces provided by the ' +
      'corresponding service implementation.',
    mayExtend:
      'All implementations MAY provide functionality beyond this specification.'
  },
  configuration: {
    jsonContentType:
      'All entity bodies in requests and responses sent to or received from ' +
      'the API endpoints defined by this specification MUST be serialized ' +
      'as JSON and include the Content-Type header with a media type value ' +
      'of `application/json`.',
    unknownOptions:
      'Implementations MUST throw an error if an endpoint receives data, ' +
      'options, or option values that it does not understand or know how to ' +
      'process.',
    mustNotStaticCredentials:
      'Requests MUST NOT use authorization protocols with long-lived static ' +
      'credentials (e.g. HTTP Basic Authentication with username/password).',
    vcPayloadBaseline:
      'A default maximum size of 10MB per verifiable credential is ' +
      'RECOMMENDED as an interoperability baseline, with the possibility of ' +
      'configuring a larger size if required.'
  },
  issuing: {
    multipleProofs:
      'If a use case requires an issuer instance to attach multiple proofs ' +
      'to the provided `credential`, the instance MUST attach all of these ' +
      'proofs in response to a single call to the `/credentials/issue` ' +
      'endpoint.',
    proofHandling:
      'An issuing instance SHOULD be configured to handle existing proofs in ' +
      'one of the following ways: Proof Sets, Proof Chains, or Error ' +
      'Handling.'
  },
  requestingPresentation: {
    query:
      'A REQUIRED property that specifies the information requested by the ' +
      'verifier. The value MUST be one or more maps where each map MUST ' +
      'define a `type` property with an associated string value.',
    queryByExample:
      'To signal that selective-disclosure cryptosuites are acceptable, ' +
      'verifiers SHOULD include cryptosuites such as `bbs-2023` or ' +
      '`ecdsa-sd-2023` in the `acceptedCryptosuites` array.',
    didAuthentication:
      'A DID Authentication response MUST be a verifiable presentation of ' +
      'the following form:'
  },
  workflows: {
    issueRequestVariables:
      'An issue request object MAY include a `variables` property to provide ' +
      'values to be used when evaluating the credential template.',
    issueRequestResult:
      'An issue request object MAY include an optional `result` property ' +
      'whose value MUST be either the name of a top-level variable in the ' +
      'exchange\'s `variables` object or a JSON pointer to any variable ' +
      'within the exchange\'s `variables` object.',
    referenceIdServerMay:
      'A server MAY include a `referenceId` property in an exchange message.',
    referenceIdEcho:
      'If the client receives a `referenceId`, it SHOULD include the same ' +
      '`referenceId` in its next message to the server.',
    referenceIdUrnUuid:
      'The value of `referenceId` SHOULD be a `urn:uuid:` value.'
  },
  interactions: {
    interactionUrl:
      'The format of the interaction URL MUST conform to the syntax for the ' +
      'URL and contain an `iuv` query parameter encoding the interaction URL ' +
      'version number, which MUST be `1` when using this version of this API.',
    interactionHttps:
      'The interaction URL SHOULD be an HTTPS URL that contains an ' +
      'interaction-specific identifier.',
    interactionOpaque:
      'The URL SHOULD be opaque and require no URL syntax processing before ' +
      'it is fetched by the receiving system.',
    interactionNoExtraQuery:
      'Information that belongs in the GET response body SHOULD NOT be put ' +
      'in query parameters.',
    qrCode:
      'An interaction QR Code MUST be an interaction URL expressed as a QR ' +
      'code according to ISO 18004.',
    qrCodeMaxLength:
      'To ensure broad interoperability, the length of the interaction URL ' +
      'SHOULD be as short as possible, SHOULD NOT exceed 400 alphanumeric ' +
      'characters, and MUST NOT exceed 4,296 alphanumeric characters.',
    scheme:
      'The format of the protocol scheme MUST conform to the following syntax:',
    protocolsJson:
      'When the interaction URL is fetched using an `Accept` header of ' +
      '`application/json`, a single JSON object containing a `protocols` map ' +
      'MUST be returned where each map/key is a protocol identifier and each ' +
      'map/value is a URL that can be used to initiate the interaction.',
    protocolsHtml:
      'When the interaction URL is fetched using any unrecognized `Accept` ' +
      'header, a `text/html` document MUST be returned with directions ' +
      'instructing a human being to use specific software that understands ' +
      'how to process interaction URLs.'
  },
  errorHandling: {
    problemDetailsType:
      'The `type` map/key MUST be present and its value MUST be a URL ' +
      'identifying the type of problem.',
    problemDetailsTitle:
      'The `title` map/key SHOULD provide a short but specific ' +
      'human-readable string for the problem.',
    problemDetailsDetail:
      'The `detail` map/key SHOULD provide a longer human-readable string ' +
      'for the problem.',
    verifiedReflectsErrors:
      'If an error is included, the `verified` property of the ' +
      '`VerificationResponse` object MUST be set to `false`; if no errors ' +
      'are included, it MUST be set to `true`.'
  }
};
