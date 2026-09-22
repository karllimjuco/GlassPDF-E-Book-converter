import { PDFDocument } from 'pdf-lib';
import type { FitMode } from '@/types';

/**
 * Convert a list of image files to a single PDF.
 * Supports PNG, JPEG, and WebP (WebP converted via canvas).
 */
export async function imagesToPdf(
  files: File[],
  fitMode: FitMode = 'fit'
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let embeddedImage;

    const type = file.type;
    if (type === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(arrayBuffer);
    } else if (type === 'image/jpeg' || type === 'image/jpg') {
      embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
    } else {
      // WebP or other — convert to JPEG via canvas
      const jpegBytes = await convertImageToJpeg(file);
      embeddedImage = await pdfDoc.embedJpg(jpegBytes);
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    // A4 page size
    const pageWidth = 595;
    const pageHeight = 842;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    let drawWidth: number;
    let drawHeight: number;
    let x: number;
    let y: number;

    if (fitMode === 'actual') {
      drawWidth = imgWidth;
      drawHeight = imgHeight;
    } else if (fitMode === 'stretch') {
      drawWidth = pageWidth;
      drawHeight = pageHeight;
    } else {
      // fit — maintain aspect ratio
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      drawWidth = imgWidth * ratio;
      drawHeight = imgHeight * ratio;
    }

    x = (pageWidth - drawWidth) / 2;
    y = (pageHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, { x, y, width: drawWidth, height: drawHeight });
  }

  return pdfDoc.save();
}

async function convertImageToJpeg(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Canvas toBlob failed'));
          blob.arrayBuffer().then(resolve).catch(reject);
        },
        'image/jpeg',
        0.92
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}
