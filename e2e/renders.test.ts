import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, relative } from 'node:path';

import { createCanvas } from '@napi-rs/canvas';
import pixelmatch from 'pixelmatch';
import { inject } from 'vitest';

import { type PdfPage, readPdf } from './readPdf.ts';

const FIXTURES_DIR = join(import.meta.dirname, 'fixtures');
const OUTPUT_DIR = join(import.meta.dirname, 'output');
const shouldUpdate = process.env.UPDATE_GOLDENS === '1';

const fixtureNames = readdirSync(FIXTURES_DIR);

function readOptional(path: string) {
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
}

async function render(fixtureDir: string) {
  const response = await fetch(`${inject('baseUrl')}/`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      body: readFileSync(join(fixtureDir, 'body.html'), 'utf8'),
      header: readOptional(join(fixtureDir, 'header.html')),
      footer: readOptional(join(fixtureDir, 'footer.html')),
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Render failed with ${response.status}: ${await response.text()}`
    );
  }

  return new Uint8Array(await response.arrayBuffer());
}

function describePages(pages: Array<PdfPage>) {
  return pages.map(({ width, height, text, links }) => ({
    width,
    height,
    text,
    links,
  }));
}

function diffPage(expected: PdfPage, actual: PdfPage) {
  const { width, height } = expected.canvas;
  const diff = createCanvas(width, height);
  const diffImage = diff.getContext('2d').createImageData(width, height);

  const mismatchedPixels = pixelmatch(
    expected.canvas.getContext('2d').getImageData(0, 0, width, height).data,
    actual.canvas.getContext('2d').getImageData(0, 0, width, height).data,
    diffImage.data,
    width,
    height
  );
  diff.getContext('2d').putImageData(diffImage, 0, 0);

  return { mismatchedPixels, diff };
}

describe('rendered PDFs', () => {
  it.each(fixtureNames)('%s matches expected.pdf', async (fixtureName) => {
    const fixtureDir = join(FIXTURES_DIR, fixtureName);
    const expectedPath = join(fixtureDir, 'expected.pdf');
    const actualPdf = await render(fixtureDir);

    if (shouldUpdate) {
      writeFileSync(expectedPath, actualPdf);
      return;
    }

    const outputDir = join(OUTPUT_DIR, fixtureName);
    rmSync(outputDir, { recursive: true, force: true });
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(join(outputDir, 'actual.pdf'), actualPdf);

    const expectedPages = await readPdf(readFileSync(expectedPath));
    const actualPages = await readPdf(actualPdf);

    expect(describePages(actualPages)).toEqual(describePages(expectedPages));

    const pagesWithPixelDiffs = expectedPages.flatMap((expectedPage, index) => {
      const actualPage = actualPages[index];
      const { mismatchedPixels, diff } = diffPage(expectedPage, actualPage);
      if (mismatchedPixels === 0) {
        return [];
      }

      const prefix = join(outputDir, `page-${index + 1}`);
      writeFileSync(
        `${prefix}-expected.png`,
        expectedPage.canvas.toBuffer('image/png')
      );
      writeFileSync(
        `${prefix}-actual.png`,
        actualPage.canvas.toBuffer('image/png')
      );
      writeFileSync(`${prefix}-diff.png`, diff.toBuffer('image/png'));

      return [
        {
          page: index + 1,
          mismatchedPixels,
          diff: relative(process.cwd(), `${prefix}-diff.png`),
        },
      ];
    });

    expect(pagesWithPixelDiffs).toEqual([]);
  });
});
