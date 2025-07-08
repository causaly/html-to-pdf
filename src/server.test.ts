import type Fastify from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { z as zod } from 'zod/v4';
import { createErrorMap } from 'zod-validation-error/v4';

import { makeServer } from './server.ts';
import { makeLogger } from './utils/logger.ts';
import { makeRollbar } from './utils/rollbar.ts';

zod.config({
  customError: createErrorMap({
    includePath: true,
  }),
});

const logger = makeLogger({
  name: 'html-to-pdf-service-test',
  level: 'info',
  format: 'pretty',
});

const rollbar = makeRollbar({
  name: 'html-to-pdf-service-test',
  deployEnv: 'development',
  rollbarAccessToken: undefined, // No rollbar for tests
});

describe('makeServer', () => {
  let server: Fastify.FastifyInstance;

  beforeAll(async () => {
    server = makeServer({ logger, rollbar });

    // Start server on a random available port
    await server.listen({ port: 0, host: '127.0.0.1' });
  });

  afterAll(async () => {
    // Clean up server
    if (server) {
      await server.close();
    }
  });

  it('should generate PDF from simple HTML', async () => {
    const html =
      '<html><body><h1>Test PDF</h1><p>This is a test document.</p></body></html>';

    const response = await server.inject({
      method: 'POST',
      url: '/',
      payload: {
        body: html,
        filename: 'test.pdf',
      },
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
    expect(response.headers['content-disposition']).toBe(
      'attachment; filename="test.pdf"'
    );
    expect(response.rawPayload).toBeInstanceOf(Buffer);
    expect(response.rawPayload.length).toBeGreaterThan(0);
  });

  it('should generate PDF with auto-generated filename when not provided', async () => {
    const html = '<html><body><h1>Test PDF</h1></body></html>';

    const response = await server.inject({
      method: 'POST',
      url: '/',
      payload: {
        body: html,
      },
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
    expect(response.headers['content-disposition']).toMatch(
      /attachment; filename=".+\.pdf"/
    );
    expect(response.rawPayload).toBeInstanceOf(Buffer);
    expect(response.rawPayload.length).toBeGreaterThan(0);
  });

  it('should return 400 for invalid request body', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/',
      payload: {
        // Missing required 'body' field
        filename: 'test.pdf',
      },
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body).toEqual({
      message: 'A validation error occurred while creating the PDF.',
      reason: 'Validation error: Expected string, received undefined at "body"',
    });
  });

  it('should return 400 for non-string body content', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/',
      payload: {
        body: 123, // Invalid type
      },
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body).toEqual({
      message: 'A validation error occurred while creating the PDF.',
      reason: 'Validation error: Expected string, received number at "body"',
    });
  });
});
