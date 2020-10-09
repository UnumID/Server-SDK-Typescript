import { Request, Response, NextFunction } from 'express';
import { configData } from './config';
import { makeRESTCall, CustError } from 'library-issuer-verifier-utility';

import { VerifierApiKey } from './types';

export const validateRequest = (req: Request): void => {
  const { customerApiKey, customerUuid } = req.body;

  if (!customerApiKey) {
    throw new CustError(401, 'Not authenticated.');
  }

  if (!customerUuid) {
    throw new CustError(400, 'Invalid Verifier API Key options: customerUuid is required.');
  }
};

export const createVerifierApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    validateRequest(req);
    const { customerApiKey, customerUuid } = req.body;

    const options = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'apiKey',
      header: { Authorization: `Bearer ${customerApiKey}` },
      data: { customerUuid, type: 'Verifier' }
    };

    const apiResponse = await makeRESTCall<VerifierApiKey>(options);

    const responseData = { verifierApiKey: apiResponse.body.key };
    res.status(201).send(responseData);
  } catch (e) {
    next(e);
  }
};
