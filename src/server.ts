import { startServer } from 'library-issuer-verifier-utility';

import { configData } from './config';
import { app } from './index';

startServer(configData.port, app);
