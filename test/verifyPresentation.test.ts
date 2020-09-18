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
  let getDidSpy, verifySpy, response: hlpr.JSONObj, verStatus;
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
  let getDidSpy, verifySpy, response: hlpr.JSONObj, verStatus;
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
  let response: hlpr.JSONObj, preReq: hlpr.JSONObj;
  const { context, type, verifiableCredential, presentationRequestUuid, proof, authToken } = populateMockData();

  it('returns a 400 status code with a descriptive error message when @context is missing', async () => {
    response = await callVerifyPresentation('', type, verifiableCredential, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: @context is required.');
  });

  it('returns a 400 status code with a descriptive error message when type is missing', async () => {
    response = await callVerifyPresentation(context, '', verifiableCredential, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: type is required.');
  });

  it('returns a 400 status code with a descriptive error message when verifiableCredential is missing', async () => {
    response = await callVerifyPresentation(context, type, '', presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: verifiableCredential is required.');
  });

  it('returns a 400 status code with a descriptive error message when presentationRequestUuid is missing', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, '', proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: presentationRequestUuid is required.');
  });

  it('returns a 400 status code with a descriptive error message when proof is missing', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, '', authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: proof is required.');
  });

  it('returns a 400 status code with a descriptive error message when @context is not an array', async () => {
    response = await callVerifyPresentation('https://www.w3.org/2018/credentials/v1', type, verifiableCredential, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: @context must be a non-empty array.');
  });

  it('returns a 400 status code with a descriptive error message when @context array is empty', async () => {
    response = await callVerifyPresentation([], type, verifiableCredential, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: @context must be a non-empty array.');
  });

  it('returns a 400 status code with a descriptive error message when type is not an array', async () => {
    response = await callVerifyPresentation(context, 'VerifiablePresentation', verifiableCredential, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: type must be a non-empty array.');
  });

  it('returns a 400 status code with a descriptive error message when type array is empty', async () => {
    response = await callVerifyPresentation(context, [], verifiableCredential, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: type must be a non-empty array.');
  });

  it('returns a 400 status code with a descriptive error message when verifiableCredential is not an array', async () => {
    response = await callVerifyPresentation(context, type, 'verifiableCredential', presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: verifiableCredential must be a non-empty array.');
  });

  it('returns a 400 status code with a descriptive error message when verifiableCredential array is empty', async () => {
    response = await callVerifyPresentation(context, type, [], presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: verifiableCredential must be a non-empty array.');
  });

  it('returns a 401 status code if x-auth-token header is missing', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, '');
    preReq = response.body;

    expect(response.statusCode).toBe(401);
    expect(preReq.message).toBe('Not authenticated');
  });
});

describe('POST /api/verifyPresentation - Validation for verifiableCredential object', () => {
  let response: hlpr.JSONObj, preReq: hlpr.JSONObj;
  const { context, type, verifiableCredential, presentationRequestUuid, proof, authToken } = populateMockData();

  let cred;
  it('Response code should be ' + 400 + ' when @context is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], '@context');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: @context is required.');
  });

  it('Response code should be ' + 400 + ' when credentialStatus is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], 'credentialStatus');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: credentialStatus is required.');
  });

  it('Response code should be ' + 400 + ' when credentialSubject is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], 'credentialSubject');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: credentialSubject is required.');
  });

  it('Response code should be ' + 400 + ' when issuer is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], 'issuer');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: issuer is required.');
  });

  it('Response code should be ' + 400 + ' when type is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], 'type');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: type is required.');
  });

  it('Response code should be ' + 400 + ' when id is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], 'id');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: id is required.');
  });

  it('Response code should be ' + 400 + ' when issuanceDate is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], 'issuanceDate');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: issuanceDate is required.');
  });

  it('Response code should be ' + 400 + ' when proof is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], 'proof');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: proof is required.');
  });
});

describe('POST /api/verifyPresentation - Validation for proof object', () => {
  let response: hlpr.JSONObj, preReq: hlpr.JSONObj;
  const { context, type, verifiableCredential, presentationRequestUuid, proof, authToken } = populateMockData();

  it('returns a 400 status code with a descriptive error message when created is missing', async () => {
    const invalidProof = { created: '', signatureValue: proof.signatureValue, type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, invalidProof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: proof is not correctly formatted.');
  });

  it('returns a 400 status code with a descriptive error message when signatureValue is missing', async () => {
    const invlaidProof = { created: proof.created, signatureValue: '', type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, invlaidProof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: proof is not correctly formatted.');
  });

  it('returns a 400 status code with a descriptive error message when type is missing', async () => {
    const invalidProof = { created: proof.created, signatureValue: proof.signatureValue, type: '', verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, invalidProof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: proof is not correctly formatted.');
  });

  it('returns a 400 status code with a descriptive error message when verificationMethod is missing', async () => {
    const invalidProof = { created: proof.created, signatureValue: proof.signatureValue, type: proof.type, verificationMethod: '', proofPurpose: proof.proofPurpose };
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, invalidProof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: proof is not correctly formatted.');
  });

  it('returns a 400 status code with a descriptive error message when proofPurpose is missing', async () => {
    const invalidProof = { created: proof.created, signatureValue: proof.signatureValue, type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: '' };
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, invalidProof, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: proof is not correctly formatted.');
  });
});
