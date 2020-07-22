import express from 'express';
import configData from './config/config.json';

const port = configData.port;

export const app = express();

app.get('/', function (req: express.Request, res: express.Response, next: any) {
  res.send(`Verifier Application running at http://localhost:${port}`);
});

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
