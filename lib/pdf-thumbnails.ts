import * as pdfjs from 'pdfjs-dist';

let workerInitialized = false;

function ensureWorker() {
  if (workerInitialized) return;
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  workerInitialized = true;
}

/**
 * Render a single PDF page to a canvas and return a data URL.
 */
export async function renderPageToDataUrl(
  pdfData: ArrayBuffer,
  pageIndex: number, // 0-based
  scale = 1.2
): Promise<string> {
  ensureWorker();
  const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
  const page = await pdf.getPage(pageIndex + 1); // pdfjs is 1-based
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Render all pages of a PDF and return an array of data URLs.
 * Calls onProgress(completedCount, totalCount) after each page.
 */
export async function renderAllPages(
  pdfData: ArrayBuffer,
  scale = 0.6,
  onProgress?: (done: number, total: number) => void
): Promise<string[]> {
  ensureWorker();
  const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
  const total = pdf.numPages;
  const results: string[] = [];

  for (let i = 0; i < total; i++) {
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    results.push(canvas.toDataURL('image/jpeg', 0.8));
    onProgress?.(i + 1, total);
  }

  return results;
}

/**
 * Get the page count of a PDF without rendering.
 */
export async function getPdfPageCount(pdfData: ArrayBuffer): Promise<number> {
  ensureWorker();
  const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
  return pdf.numPages;
}

/**
 * Extract text content from all pages. Used by EPUB builder.
 */
export async function extractTextByPage(
  pdfData: ArrayBuffer
): Promise<{ pageNum: number; text: string }[]> {
  ensureWorker();
  const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
  const pages: { pageNum: number; text: string }[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pages.push({ pageNum: i, text });
  }

  return pages;
}
