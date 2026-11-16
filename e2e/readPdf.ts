import { type Canvas, createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

// 1.5 × 72 dpi: fine enough to catch shifted glyphs, small enough to diff fast.
const RENDER_SCALE = 1.5;

export type PdfPage = {
  width: number;
  height: number;
  text: string;
  links: Array<string>;
  canvas: Canvas;
};

export async function readPdf(pdf: Uint8Array): Promise<Array<PdfPage>> {
  // pdfjs rejects Buffers and detaches what it is given, so hand it a plain copy.
  const loadingTask = getDocument({ data: new Uint8Array(pdf), verbosity: 0 });
  const document = await loadingTask.promise;

  try {
    const pages: Array<PdfPage> = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: RENDER_SCALE });
      const canvas = createCanvas(
        Math.ceil(viewport.width),
        Math.ceil(viewport.height)
      );

      await page.render({
        // pdfjs types expect a DOM canvas; @napi-rs/canvas implements what it uses.
        canvas: canvas as unknown as HTMLCanvasElement,
        viewport,
      }).promise;

      const textContent = await page.getTextContent();
      const annotations = await page.getAnnotations();
      const [, , width, height] = page.view;

      pages.push({
        width,
        height,
        text: textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(''),
        links: annotations
          .filter((annotation) => annotation.subtype === 'Link')
          .map((annotation) => annotation.url),
        canvas,
      });
    }

    return pages;
  } finally {
    await loadingTask.destroy();
  }
}
