import * as Either from 'fp-ts/lib/Either.js';
import { z as zod } from 'zod/v4';
import type { ValidationError } from 'zod-validation-error/v4';
import { toValidationError } from 'zod-validation-error/v4';

import { sanitizeHtml, wrapHtmlWithCSP } from '../utils/html.ts';

export const schema = zod
  .string()
  .transform((html) => sanitizeHtml(html))
  .brand<'SanitizedHTML'>();

export type SanitizedHTML = zod.infer<typeof schema>;

export type HTMLWithCSP = string & { readonly __brand: 'HTMLWithCSP' };

export function parse(
  value: zod.input<typeof schema>
): Either.Either<ValidationError, SanitizedHTML> {
  return Either.tryCatch(() => schema.parse(value), toValidationError());
}

export function withCSP(
  sanitizedHtml: SanitizedHTML,
  cspPolicy: string
): HTMLWithCSP {
  return wrapHtmlWithCSP(sanitizedHtml, cspPolicy) as HTMLWithCSP;
}
