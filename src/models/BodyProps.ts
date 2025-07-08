import * as Either from 'fp-ts/lib/Either.js';
import { z as zod } from 'zod/v4';
import type { ValidationError } from 'zod-validation-error/v4';
import { toValidationError } from 'zod-validation-error/v4';

import * as HTML from './HTML.ts';

const schema = zod
  .object({
    filename: zod.string().optional(),
    body: HTML.schema,
    header: HTML.schema.optional(),
    footer: HTML.schema.optional(),
  })
  .brand<'BodyProps'>();

export type BodyProps = zod.infer<typeof schema>;

export function parse(
  value: zod.input<typeof schema>
): Either.Either<ValidationError, BodyProps> {
  return Either.tryCatch(() => schema.parse(value), toValidationError());
}
