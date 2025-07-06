import * as Either from 'fp-ts/lib/Either.js';
import { z as zod } from 'zod/v4';
import type { ValidationError } from 'zod-validation-error/v4';
import { toValidationError } from 'zod-validation-error/v4';

import { deployEnvs } from '../constants/deployEnvs.ts';
import { nodeEnvs } from '../constants/nodeEnvs.ts';
import * as LogFormat from './LogFormat.ts';
import * as LogLevel from './LogLevel.ts';

export const schema = zod.object({
  DEPLOY_ENV: zod.enum(deployEnvs).default(deployEnvs.DEVELOPMENT),
  HOST: zod.string(),
  PORT: zod.coerce.number().int().positive(),
  LOG_FORMAT: LogFormat.schema.default(LogFormat.schema.enum.gcp),
  LOG_LEVEL: LogLevel.schema.default(LogLevel.schema.enum.info),
  ROLLBAR_ACCESS_TOKEN: zod.string().min(1).optional(),
  NODE_ENV: zod.enum(nodeEnvs).default(nodeEnvs.DEVELOPMENT),
});

export type EnvVariables = zod.infer<typeof schema>;

export function parse(
  value: zod.input<typeof schema>
): Either.Either<ValidationError, EnvVariables> {
  return Either.tryCatch(() => schema.parse(value), toValidationError());
}
