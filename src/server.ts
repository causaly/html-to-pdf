import Fastify from 'fastify';
import { pipe } from 'fp-ts/lib/function.js';
import * as TaskEither from 'fp-ts/lib/TaskEither.js';
import type { Logger } from 'pino';
import type Rollbar from 'rollbar';
import { isValidationErrorLike } from 'zod-validation-error/v4';

import pkg from '../package.json' with { type: 'json' };
import { createPdf } from './commands/createPdf.ts';
import { BodyProps, HTML } from './models/index.ts';
import { generateFilename } from './utils/filename.ts';

export const makeServer = (ctx: {
  logger: Logger;
  rollbar: Rollbar;
  cspPolicy: string;
}) => {
  const server = Fastify({
    logger: false,
    bodyLimit: 10 * 1024 * 1024, // 10MB limit
  });

  // Health check endpoint
  server.get('/health', async () => {
    return { status: 'healthy', version: pkg.version };
  });

  server.post<{
    Body: BodyProps.BodyProps;
    Reply: {
      200: Buffer<ArrayBuffer>;
      '4xx': { message: string; reason: string };
      500: { message: string; reason: string };
    };
  }>('/', async (request, reply) => {
    await pipe(
      request.body,
      BodyProps.parse,
      TaskEither.fromEither,
      TaskEither.map((bodyProps) => ({
        body: HTML.withCSP(bodyProps.body, ctx.cspPolicy),
        header: bodyProps.header
          ? HTML.withCSP(bodyProps.header, ctx.cspPolicy)
          : undefined,
        footer: bodyProps.footer
          ? HTML.withCSP(bodyProps.footer, ctx.cspPolicy)
          : undefined,
      })),
      TaskEither.flatMap((htmlWithCSP) => createPdf(htmlWithCSP)),
      TaskEither.match(
        (error) => {
          if (isValidationErrorLike(error)) {
            ctx.logger.warn(error);
            reply.code(400).send({
              message: 'A validation error occurred while creating the PDF.',
              reason: error.message,
            });
            return;
          }

          ctx.logger.error(error);
          ctx.rollbar.error(error, {
            protocol: request.protocol,
            url: request.url,
            method: request.method,
            body: request.body,
            headers: request.headers,
          });

          reply.code(500).send({
            message: 'An internal error occurred while creating the PDF.',
            reason: error.message,
          });
        },
        (pdfBuffer) => {
          const filename =
            request.body.filename ?? generateFilename(new Date());

          reply.header('Content-Type', 'application/pdf');
          reply.header(
            'Content-Disposition',
            `attachment; filename="${filename}"`
          );
          reply.code(200).send(pdfBuffer);
        }
      )
    )();
  });

  return server;
};
