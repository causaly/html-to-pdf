import * as Either from 'fp-ts/lib/Either.js';
import { z as zod } from 'zod/v4';
import type { ValidationError } from 'zod-validation-error/v4';
import { toValidationError } from 'zod-validation-error/v4';

export const schema = zod.enum(['pretty', 'gcp']);

export type LogFormat = zod.infer<typeof schema>;

export function parse(
  value: zod.input<typeof schema>
): Either.Either<ValidationError, LogFormat> {
  return Either.tryCatch(() => schema.parse(value), toValidationError());
}
