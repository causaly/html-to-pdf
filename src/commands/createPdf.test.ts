import { pipe } from 'fp-ts/lib/function.js';
import * as TaskEither from 'fp-ts/lib/TaskEither.js';
import {
  expectLeftTaskEither,
  expectRightTaskEither,
} from 'jest-fp-ts-matchers';
import puppeteer from 'puppeteer';

import * as BodyProps from '../models/BodyProps.ts';
import { createPdf, CreatePdfError } from './createPdf.ts';

vi.mock('puppeteer');

const mockPuppeteer = vi.mocked(puppeteer);

describe('createPdf', () => {
  const mockBrowser = {
    newPage: vi.fn(),
    close: vi.fn(),
  };

  const mockPage = {
    setContent: vi.fn(),
    pdf: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockBrowser.close.mockResolvedValue(undefined);
    mockPage.setContent.mockResolvedValue(undefined);
    mockPuppeteer.launch.mockResolvedValue(mockBrowser as any);
    mockBrowser.newPage.mockResolvedValue(mockPage as any);
    mockPage.pdf.mockResolvedValue(Buffer.from(''));
  });

  it('should create PDF successfully with valid body', async () => {
    const content = 'Test';
    const body = `<html><body><h1>${content}</h1></body></html>`;
    mockPage.pdf.mockResolvedValue(Buffer.from(content));

    await pipe(
      { body },
      BodyProps.parse,
      TaskEither.fromEither,
      TaskEither.flatMap(createPdf),
      expectRightTaskEither((pdfBuffer) => {
        expect(pdfBuffer).toBeInstanceOf(Buffer);
        expect(pdfBuffer.toString()).toBe(content);
        expect(mockBrowser.close).toHaveBeenCalled();
      })
    )();
  });

  it('should create PDF successfully with header and footer', async () => {
    const content = 'Test';
    const html = `<html><body><h1>${content}</h1></body></html>`;
    const header = '<div>Header</div>';
    const footer = '<div>Footer</div>';
    mockPage.pdf.mockResolvedValue(Buffer.from(content));

    await pipe(
      { body: html, header, footer },
      BodyProps.parse,
      TaskEither.fromEither,
      TaskEither.flatMap(createPdf),
      expectRightTaskEither((pdfBuffer) => {
        expect(pdfBuffer).toBeInstanceOf(Buffer);
        expect(pdfBuffer.toString()).toBe(content);
        expect(mockBrowser.close).toHaveBeenCalled();
        expect(mockPage.pdf).toHaveBeenCalledWith(
          expect.objectContaining({
            displayHeaderFooter: true,
            headerTemplate: expect.stringContaining('<div>Header</div>'),
            footerTemplate: expect.stringContaining('<div>Footer</div>'),
            margin: expect.objectContaining({
              top: '80px',
              bottom: '80px',
            }),
          })
        );
      })
    )();
  });

  it('should return CreatePdfError when puppeteer fails to launch', async () => {
    mockPuppeteer.launch.mockRejectedValue(
      new Error('Failed to launch browser')
    );
    const body = '<html><body>Test</body></html>';

    await pipe(
      { body },
      BodyProps.parse,
      TaskEither.fromEither,
      TaskEither.flatMap(createPdf),
      expectLeftTaskEither((error: any) => {
        expect(error.name).toBeInstanceOf(CreatePdfError);
        expect(error.message).toBe('Failed to launch browser');
        expect(mockBrowser.close).toHaveBeenCalled();
      })
    );
  });

  it('should return CreatePdfError when PDF generation fails', async () => {
    mockPage.pdf.mockRejectedValue(new Error('PDF generation failed'));
    const body = '<html><body>Test</body></html>';

    await pipe(
      { body },
      BodyProps.parse,
      TaskEither.fromEither,
      TaskEither.flatMap(createPdf),
      expectLeftTaskEither((error: any) => {
        expect(error.name).toBeInstanceOf(CreatePdfError);
        expect(error.message).toBe('PDF generation failed');
        expect(mockBrowser.close).toHaveBeenCalled();
      })
    );
  });
});
