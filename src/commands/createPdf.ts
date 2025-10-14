import { pipe } from 'fp-ts/lib/function.js';
import * as TaskEither from 'fp-ts/lib/TaskEither.js';
import puppeteer from 'puppeteer';

import type { HTMLWithCSP } from '../models/HTML.ts';

export class CreatePdfError extends Error {
  name = 'CreatePdfError' as const;
}

export type CreatePdfProps = {
  body: HTMLWithCSP;
  header?: HTMLWithCSP;
  footer?: HTMLWithCSP;
};

const HEADER_FOOTER_VERTICAL_MARGIN = '80px';
const NO_HEADER_FOOTER_VERTICAL_MARGIN = '40px';
const HORIZONTAL_MARGIN = '40px';

export const createPdf = (props: CreatePdfProps) => {
  return pipe(
    TaskEither.tryCatch(
      async () => {
        const browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-infobars',
            '--single-process',
          ],
        });

        const displayHeaderFooter = !!(props.header || props.footer);

        try {
          const page = await browser.newPage();

          // Wait for all resources to be fetched and loaded
          await page.setContent(props.body, { waitUntil: 'networkidle0' });

          const pdfData = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
              top: props.header
                ? HEADER_FOOTER_VERTICAL_MARGIN
                : NO_HEADER_FOOTER_VERTICAL_MARGIN,
              right: HORIZONTAL_MARGIN,
              bottom: props.footer
                ? HEADER_FOOTER_VERTICAL_MARGIN
                : NO_HEADER_FOOTER_VERTICAL_MARGIN,
              left: HORIZONTAL_MARGIN,
            },
            displayHeaderFooter,
            headerTemplate: props.header || '',
            footerTemplate: props.footer || '',
          });

          return Buffer.from(pdfData);
        } finally {
          await browser.close();
        }
      },
      (error: unknown) =>
        new CreatePdfError(
          error instanceof Error ? error.message : String(error)
        )
    )
  );
};
