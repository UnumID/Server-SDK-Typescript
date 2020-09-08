import request from 'supertest';

import * as hlpr from 'library-issuer-verifier-utility';
import { app } from '../src/index';

const callVerifyPresentation = (context, type, verifiableCredential, presentationRequestUuid, proof, authToken): Promise<hlpr.JSONObj> => {
  return (request(app)
    .post('/api/verifyPresentation')
    .set('Content-Type', 'application/json')
    .set('x-auth-token', authToken)
    .send({
      '@context': context,
      type,
      verifiableCredential,
      presentationRequestUuid,
      proof
    })
  );
};

const copyCredentialObj = (credential: hlpr.JSONObj, elemName: string, elemValue = ''): hlpr.JSONObj => {
  const newCred: hlpr.JSONObj = [
    {
      '@context': credential['@context'],
      credentialStatus: credential.credentialStatus,
      credentialSubject: credential.credentialSubject,
      issuer: credential.issuer,
      type: credential.type,
      id: credential.id,
      issuanceDate: credential.issuanceDate,
      proof: credential.proof
    }
  ];

  newCred[0][elemName] = elemValue;

  return (newCred);
};

const populateMockData = (): hlpr.JSONObj => {
  const context: string[] = ['https://www.w3.org/2018/credentials/v1'];
  const type: string[] = ['VerifiablePresentation'];
  const verifiableCredential: hlpr.JSONObj[] = [
    {
      '@context': [
        'https://www.w3.org/2018/credentials/v1'
      ],
      credentialStatus: {
        id: 'https://api.dev-unumid.org//credentialStatus/b2acd26a-ab18-4d18-9ad1-3b77f55c564b',
        type: 'CredentialStatus'
      },
      credentialSubject: {
        id: 'did:unum:3ff2f020-50b0-4f4c-a267-a9f104aedcd8',
        test: 'test'
      },
      issuer: 'did:unum:2e05967f-216f-44c4-ae8e-d6f71cd17c5a',
      type: [
        'VerifiableCredential',
        'TestCredential'
      ],
      id: 'b2acd26a-ab18-4d18-9ad1-3b77f55c564b',
      issuanceDate: '2020-09-03T18:42:30.645Z',
      proof: {
        created: '2020-09-03T18:42:30.658Z',
        signatureValue: '381yXYx2wa7qR4XMEWeLPWVR7xhksi4684VCZL7Yx9jXneVMxXoa3eT3dA5QU1tofsH4XrGbU8d4pNTiLRpa8iUWvWmAdnfE',
        type: 'secp256r1Signature2020',
        verificationMethod: 'did:unum:2e05967f-216f-44c4-ae8e-d6f71cd17c5a',
        proofPurpose: 'AssertionMethod'
      }
    }
  ];
  const presentationRequestUuid = '0cebee3b-3295-4ef6-a4d6-7dfea413b3aa';
  const proof: hlpr.JSONObj = {
    created: '2020-09-03T18:50:52.105Z',
    signatureValue: 'iKx1CJLYue7vopUo2fqGps3TWmxqRxoBDTupumLkaNp2W3UeAjwLUf5WxLRCRkDzEFeKCgT7JdF5fqbpvqnBZoHyYzWYbmW4YQ',
    type: 'secp256r1Signature2020',
    verificationMethod: 'did:unum:3ff2f020-50b0-4f4c-a267-a9f104aedcd8',
    proofPurpose: 'AssertionMethod'
  };
  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';

  return ({
    context,
    type,
    verifiableCredential,
    presentationRequestUuid,
    proof,
    authToken
  });
};

describe('POST /api/verifyPresentation - Success Scenario', () => {
  const getDidSpy, verifySpy, response: hlpr.JSONObj, verStatus;
  const { context, type, verifiableCredential, presentationRequestUuid, proof, authToken } = populateMockData();

  beforeAll(() => {
    getDidSpy = jest.spyOn(hlpr, 'getKeyFromDIDDoc', 'get');
    verifySpy = jest.spyOn(hlpr, 'doVerify', 'get');
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('Verify the presentation object by calling the api', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, authToken);
    verStatus = response.body.verifiedStatus;

    expect(getDidSpy).toBeCalled();
    expect(verifySpy).toBeCalled();
  });

  it('Response status code should be 200', () => {
    expect(response.statusCode).toBe(200);
  });

  it('Result should be true', () => {
    expect(verStatus).toBeDefined();
    expect(verStatus).toBe(true);
  });
});

describe('POST /api/verifyPresentation - Failure Scenario', () => {
  const getDidSpy, verifySpy, response: hlpr.JSONObj, verStatus;
  const { context, type, verifiableCredential, presentationRequestUuid, proof, authToken } = populateMockData();

  beforeAll(() => {
    getDidSpy = jest.spyOn(hlpr, 'getKeyFromDIDDoc', 'get');
    verifySpy = jest.spyOn(hlpr, 'doVerify', 'get');
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('Verify the presentation object by calling the api', async () => {
    // Pass some random did as part of proof object in verifiableCredential
    verifiableCredential[0].proof.verificationMethod = proof.verificationMethod;
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, authToken);
    verStatus = response.body.verifiedStatus;

    expect(getDidSpy).toBeCalled();
    expect(verifySpy).toBeCalled();
  });

  it('Response status code should be 200', () => {
    expect(response.statusCode).toBe(200);
  });

  it('Result should be false', () => {
    expect(verStatus).toBeDefined();
    expect(verStatus).toBe(false);
  });
});

describe('POST /api/verifyPresentation - Validateion Failures', () => {
  const response: hlpr.JSONObj, preReq: hlpr.JSONObj;
  const { context, type, verifiableCredential, presentationRequestUuid, proof, authToken } = populateMockData();
  const stCode = 404;
  const stCode1 = 401;
  const errMsg = 'Missing required context, type, verifiableCredential, proof and/or presentationRequestUuid';
  const errMsg1 = 'context element is not an array and / or is empty';
  const errMsg2 = 'type element is not an array and / or is empty';
  const errMsg3 = 'verifiableCredential element is not an array and / or is empty';

  it('Response code should be ' + stCode + ' when context is not passed', async () => {
    response = await callVerifyPresentation('', type, verifiableCredential, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  it('Response code should be ' + stCode + ' when type is not passed', async () => {
    response = await callVerifyPresentation(context, '', verifiableCredential, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  it('Response code should be ' + stCode + ' when verifiableCredential is not passed', async () => {
    response = await callVerifyPresentation(context, type, '', presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  it('Response code should be ' + stCode + ' when presentationRequestUuid is not passed', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, '', proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  it('Response code should be ' + stCode + ' when proof is not passed', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, '', authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  it('Response code should be ' + stCode + ' when context is not an array', async () => {
    response = await callVerifyPresentation('https://www.w3.org/2018/credentials/v1', type, verifiableCredential, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg1);
  });

  it('Response code should be ' + stCode + ' when context is array but empty', async () => {
    response = await callVerifyPresentation([], type, verifiableCredential, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg1);
  });

  it('Response code should be ' + stCode + ' when type is not an array', async () => {
    response = await callVerifyPresentation(context, 'VerifiablePresentation', verifiableCredential, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg2);
  });

  it('Response code should be ' + stCode + ' when type is array but empty', async () => {
    response = await callVerifyPresentation(context, [], verifiableCredential, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg2);
  });

  it('Response code should be ' + stCode + ' when verifiableCredential is array but empty', async () => {
    response = await callVerifyPresentation(context, type, 'verifiableCredential', presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg3);
  });

  it('Response code should be ' + stCode + ' when verifiableCredential is array but empty', async () => {
    response = await callVerifyPresentation(context, type, [], presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg3);
  });

  it('Response code should be ' + stCode1 + ' when x-auth-token is not passed in the header', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, '');
    preReq = response.body;

    expect(response.statusCode).toBe(stCode1);
    expect(preReq.message).toBe('Request not authenticated');
  });
});

describe('POST /api/verifyPresentation - Validation for verifiableCredential object', () => {
  const response: hlpr.JSONObj, preReq: hlpr.JSONObj;
  const { context, type, verifiableCredential, presentationRequestUuid, proof, authToken } = populateMockData();
  const stCode = 404;
  const errMsg = 'context, credentialStatus, credentialSubject, issuer, type, id, issuanceDate and / or proof element in verifiableCredential[0] is empty';

  let cred = copyCredentialObj(verifiableCredential[0], '@context');
  it('Response code should be ' + stCode + ' when @context is not passed', async () => {
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  cred = copyCredentialObj(verifiableCredential[0], 'credentialStatus');
  it('Response code should be ' + stCode + ' when credentialStatus is not passed', async () => {
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  cred = copyCredentialObj(verifiableCredential[0], 'credentialSubject');
  it('Response code should be ' + stCode + ' when credentialSubject is not passed', async () => {
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  cred = copyCredentialObj(verifiableCredential[0], 'issuer');
  it('Response code should be ' + stCode + ' when issuer is not passed', async () => {
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  cred = copyCredentialObj(verifiableCredential[0], 'type');
  it('Response code should be ' + stCode + ' when type is not passed', async () => {
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  cred = copyCredentialObj(verifiableCredential[0], 'id');
  it('Response code should be ' + stCode + ' when id is not passed', async () => {
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  cred = copyCredentialObj(verifiableCredential[0], 'issuanceDate');
  it('Response code should be ' + stCode + ' when issuanceDate is not passed', async () => {
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  cred = copyCredentialObj(verifiableCredential[0], 'proof');
  it('Response code should be ' + stCode + ' when proof is not passed', async () => {
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });
});

describe('POST /api/verifyPresentation - Validation for proof object', () => {
  const response: hlpr.JSONObj, preReq: hlpr.JSONObj;
  const { context, type, verifiableCredential, presentationRequestUuid, proof, authToken } = populateMockData();
  const stCode = 404;
  const errMsg = 'created, signatureValue, type, verificationMethod, and / or proofPurpose of proof element is empty';

  let proof1 = { created: '', signatureValue: proof.signatureValue, type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
  it('Response code should be ' + stCode + ' when created is not passed', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof1, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  proof1 = { created: proof.created, signatureValue: '', type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
  it('Response code should be ' + stCode + ' when signatureValue is not passed', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof1, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  proof1 = { created: proof.created, signatureValue: proof.signatureValue, type: '', verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
  it('Response code should be ' + stCode + ' when type is not passed', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof1, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  proof1 = { created: proof.created, signatureValue: proof.signatureValue, type: proof.type, verificationMethod: '', proofPurpose: proof.proofPurpose };
  it('Response code should be ' + stCode + ' when verificationMethod is not passed', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof1, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  proof1 = { created: proof.created, signatureValue: proof.signatureValue, type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: '' };
  it('Response code should be ' + stCode + ' when proofPurpose is not passed', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof1, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });
});
