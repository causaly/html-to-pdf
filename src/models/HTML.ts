import * as Either from 'fp-ts/lib/Either.js';
import { z as zod } from 'zod/v4';
import type { ValidationError } from 'zod-validation-error/v4';
import { toValidationError } from 'zod-validation-error/v4';

import { sanitizeHtml, wrapHtmlWithCSP } from '../utils/html.ts';

export const schema = zod
  .string()
  .transform((html) => sanitizeHtml(html))
  .transform((html) => wrapHtmlWithCSP(html))
  .brand<'HTML'>();

export type HTML = zod.infer<typeof schema>;

export function parse(
  value: zod.input<typeof schema>
): Either.Either<ValidationError, HTML> {
  return Either.tryCatch(() => schema.parse(value), toValidationError());
}
