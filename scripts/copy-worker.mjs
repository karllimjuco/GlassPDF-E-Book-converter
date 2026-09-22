import fs from 'node:fs';
import path from 'node:path';

const src = path.resolve('node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
const destDir = path.resolve('public');
const dest = path.join(destDir, 'pdf.worker.min.mjs');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('✓ pdf.worker.min.mjs copied to public/');
}
