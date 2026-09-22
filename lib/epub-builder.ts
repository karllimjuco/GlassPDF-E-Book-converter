import JSZip from 'jszip';

interface PageText {
  pageNum: number;
  text: string;
}

interface Chapter {
  id: string;
  title: string;
  content: string;
}

/**
 * Heuristically split page-text into chapters.
 * A new chapter starts when a page begins with a short line (likely a heading)
 * or every N pages if no natural break is found.
 */
function detectChapters(pages: PageText[]): Chapter[] {
  const chapters: Chapter[] = [];
  let current: Chapter = {
    id: 'ch001',
    title: 'Chapter 1',
    content: '',
  };
  let chapterNum = 1;

  for (const { pageNum, text } of pages) {
    // Heuristic: if text starts with a very short first "sentence" (<= 60 chars ending in newline-like pattern)
    // treat it as a heading / chapter break
    const firstLine = text.split(/[.!?]\s/)[0];
    const isLikelyHeading =
      pageNum > 1 && firstLine.length > 0 && firstLine.length <= 60 && firstLine === firstLine.toUpperCase();

    if (isLikelyHeading && current.content.length > 500) {
      // Save current chapter
      chapters.push({ ...current });
      chapterNum++;
      const id = `ch${String(chapterNum).padStart(3, '0')}`;
      current = { id, title: firstLine.trim() || `Chapter ${chapterNum}`, content: '' };
    }

    current.content += `\n${text}`;
  }

  if (current.content.trim()) {
    chapters.push(current);
  }

  return chapters.length > 0 ? chapters : [{ id: 'ch001', title: 'Content', content: pages.map((p) => p.text).join('\n') }];
}

function wrapXhtml(title: string, body: string): string {
  const escaped = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => `<p>${l}</p>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
  <title>${title}</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
<h1>${title}</h1>
${escaped}
</body>
</html>`;
}

function buildOpf(title: string, author: string, chapters: Chapter[]): string {
  const manifestItems = chapters
    .map((ch) => `<item id="${ch.id}" href="${ch.id}.xhtml" media-type="application/xhtml+xml"/>`)
    .join('\n    ');

  const spineItems = chapters
    .map((ch) => `<itemref idref="${ch.id}"/>`)
    .join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${title}</dc:title>
    <dc:creator>${author}</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="BookId">glasspdf-${Date.now()}</dc:identifier>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="css" href="style.css" media-type="text/css"/>
    ${manifestItems}
  </manifest>
  <spine toc="ncx">
    ${spineItems}
  </spine>
</package>`;
}

function buildNcx(title: string, chapters: Chapter[]): string {
  const navPoints = chapters
    .map(
      (ch, i) => `<navPoint id="${ch.id}" playOrder="${i + 1}">
      <navLabel><text>${ch.title}</text></navLabel>
      <content src="${ch.id}.xhtml"/>
    </navPoint>`
    )
    .join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="glasspdf-uid"/>
  </head>
  <docTitle><text>${title}</text></docTitle>
  <navMap>
    ${navPoints}
  </navMap>
</ncx>`;
}

const CSS = `body { font-family: Georgia, serif; margin: 2em; line-height: 1.7; }
h1 { font-size: 1.5em; margin-bottom: 1em; }
p { margin: 0 0 0.8em 0; }`;

/**
 * Build a valid .epub Blob from extracted PDF page text.
 */
export async function buildEpub(
  pages: PageText[],
  title: string,
  author = 'GlassPDF'
): Promise<Blob> {
  const chapters = detectChapters(pages);

  const zip = new JSZip();

  // mimetype MUST be first and uncompressed
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // META-INF
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  // OEBPS
  zip.file('OEBPS/content.opf', buildOpf(title, author, chapters));
  zip.file('OEBPS/toc.ncx', buildNcx(title, chapters));
  zip.file('OEBPS/style.css', CSS);

  for (const ch of chapters) {
    zip.file(`OEBPS/${ch.id}.xhtml`, wrapXhtml(ch.title, ch.content));
  }

  return zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
