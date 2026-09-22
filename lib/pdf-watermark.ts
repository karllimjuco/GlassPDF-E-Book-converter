import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import type { WatermarkOptions, PasswordOptions } from '@/types';

export async function applyWatermark(
  file: File,
  watermark: WatermarkOptions,
  password: PasswordOptions
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  // Parse hex color
  const hex = watermark.color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const color = rgb(r, g, b);

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(watermark.text, watermark.fontSize);

    if (watermark.tileAll) {
      // Tile watermark across the page
      const stepX = textWidth + 80;
      const stepY = watermark.fontSize + 60;
      for (let y = 0; y < height + stepY; y += stepY) {
        for (let x = -stepX; x < width + stepX; x += stepX) {
          page.drawText(watermark.text, {
            x,
            y,
            size: watermark.fontSize,
            font,
            color,
            opacity: watermark.opacity,
            rotate: degrees(watermark.angle),
          });
        }
      }
    } else {
      // Single centered watermark
      const x = (width - textWidth) / 2;
      const y = height / 2;
      page.drawText(watermark.text, {
        x,
        y,
        size: watermark.fontSize,
        font,
        color,
        opacity: watermark.opacity,
        rotate: degrees(watermark.angle),
      });
    }
  }

  const savedBytes = await pdfDoc.save();

  // Password protection via @pdfsmaller/pdf-encrypt
  if (password.enabled && (password.userPassword || password.ownerPassword)) {
    try {
      const { encryptPDF } = await import('@pdfsmaller/pdf-encrypt');
      return await encryptPDF(savedBytes, password.userPassword || '', {
        ownerPassword: password.ownerPassword || undefined,
        algorithm: 'AES-256',
      });
    } catch (err) {
      console.warn('Encryption unavailable, returning unencrypted PDF', err);
      return savedBytes;
    }
  }

  return savedBytes;
}

/**
 * Apply ONLY password protection (no watermark) to a PDF.
 */
export async function applyPassword(
  file: File,
  password: PasswordOptions
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const savedBytes = await pdfDoc.save();

  if (!password.enabled) return savedBytes;

  try {
    const { encryptPDF } = await import('@pdfsmaller/pdf-encrypt');
    return await encryptPDF(savedBytes, password.userPassword || '', {
      ownerPassword: password.ownerPassword || undefined,
      algorithm: 'AES-256',
    });
  } catch (err) {
    console.warn('Encryption unavailable', err);
    return savedBytes;
  }
}
