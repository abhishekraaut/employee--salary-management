import { app } from './app';
import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config();

const logger = pino();
const port = process.env.PORT || 8080;

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
