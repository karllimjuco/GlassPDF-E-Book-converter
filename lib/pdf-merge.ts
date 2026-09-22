import { PDFDocument, degrees } from 'pdf-lib';
import type { PdfPageItem } from '@/types';

/**
 * Merge multiple PDF files into one and return the bytes.
 */
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer);
    const copiedPages = await merged.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach((page) => merged.addPage(page));
  }

  return merged.save();
}

/**
 * Reassemble a PDF from a reordered/rotated/filtered list of page items.
 */
export async function reassemblePages(
  originalFile: File,
  pages: PdfPageItem[]
): Promise<Uint8Array> {
  const arrayBuffer = await originalFile.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const outDoc = await PDFDocument.create();

  const active = pages.filter((p) => !p.deleted);

  for (const item of active) {
    const [copied] = await outDoc.copyPages(srcDoc, [item.pageIndex]);
    if (item.rotation !== 0) {
      copied.setRotation(degrees(item.rotation));
    }
    outDoc.addPage(copied);
  }

  return outDoc.save();
}

/**
 * Trigger a browser download of PDF bytes.
 */
export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
