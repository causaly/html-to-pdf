import * as Either from 'fp-ts/lib/Either.js';
import { identity, pipe } from 'fp-ts/lib/function.js';
import { z as zod } from 'zod/v4';
import { createErrorMap } from 'zod-validation-error/v4';

import pkg from '../package.json' with { type: 'json' };
import { EnvVariables } from './models/index.ts';
import { makeServer } from './server.ts';
import { makeLogger } from './utils/logger.ts';
import { makeRollbar } from './utils/rollbar.ts';

zod.config({
  customError: createErrorMap({
    includePath: true,
  }),
});

const envVariables = pipe(
  process.env as any,
  EnvVariables.parse,
  Either.match((err) => {
    throw err;
  }, identity)
);

const logger = makeLogger({
  name: pkg.name,
  level: envVariables.LOG_LEVEL,
  format: envVariables.LOG_FORMAT,
});

const rollbar = makeRollbar({
  name: pkg.name,
  deployEnv: envVariables.DEPLOY_ENV,
  rollbarAccessToken: envVariables.ROLLBAR_ACCESS_TOKEN,
});

const server = makeServer({
  logger,
  rollbar,
});

const port = envVariables.PORT;
const host = envVariables.HOST;

server
  .listen({ port, host })
  .then(() => {
    logger.info(`PDF Exporter server started on ${host}:${port}`);
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
