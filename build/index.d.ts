import { registerVerifier } from './registerVerifier';
import { sendEmail } from './sendEmail';
import { sendRequest } from './sendRequest';
import { sendSms } from './sendSms';
import { NoPresentation, Presentation, Receipt, VerifierDto, RegisteredVerifier, PresentationRequestResponse } from './types';
import { verifyNoPresentation } from './verifyNoPresentation';
import { verifyPresentation } from './verifyPresentation';
import { verifyEncryptedPresentation } from './verifyEncryptedPresentation';
export { registerVerifier, sendEmail, sendRequest, sendSms, verifyNoPresentation, // Deprecated as an exposed function in favor of verifyEncryptedPresentation. Ought to be removed after holder stops sending presentations to the test customer app
verifyPresentation, // Deprecated as an exposed function in favor of verifyEncryptedPresentation. Ought to be removed after holder stops sending presentations to the test customer app
verifyEncryptedPresentation, VerifierDto, RegisteredVerifier, PresentationRequestResponse, Receipt, NoPresentation, Presentation };
//# sourceMappingURL=index.d.ts.map