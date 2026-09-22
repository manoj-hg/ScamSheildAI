import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Extracts plain text from a raw PDF buffer using pdf-parse with stream fallback.
 */
export async function extractTextFromPdfBuffer(pdfBuffer: Buffer): Promise<string> {
  try {
    const pdfParsePkg = require('pdf-parse');
    const PDFParse = pdfParsePkg.PDFParse || pdfParsePkg;

    if (typeof PDFParse === 'function') {
      // In version 2.x, PDFParse is a class or factory function
      try {
        const parser = new PDFParse({ data: pdfBuffer });
        if (typeof parser.load === 'function') {
          await parser.load();
          const result = await parser.getText();
          if (result && typeof result.text === 'string' && result.text.trim()) {
            return result.text.trim();
          }
        }
      } catch (classErr) {
        // Try calling as standard v1 function (buffer) => Promise<{ text: string }>
        const v1Result = await PDFParse(pdfBuffer);
        if (v1Result && typeof v1Result.text === 'string' && v1Result.text.trim()) {
          return v1Result.text.trim();
        }
      }
    }
  } catch (err: any) {
    console.warn("Direct PDF text parsing warning:", err?.message || err);
  }

  // Fallback: Extract ASCII / UTF-8 text strings directly from uncompressed PDF streams
  try {
    const raw = pdfBuffer.toString('latin1');
    const textChunks: string[] = [];

    // Match text within standard PDF text show operators: (text) Tj or [(text)] TJ
    const tjMatches = raw.match(/\(([^)]+)\)\s*(?:Tj|'|")/g) || [];
    for (const m of tjMatches) {
      const clean = m.replace(/\)\s*(?:Tj|'|")$/, '').replace(/^\(/, '').trim();
      if (clean.length > 1) {
        textChunks.push(clean);
      }
    }

    // Match text in array TJ operators
    const arrayTjMatches = raw.match(/\[([^[\]]+)\]\s*TJ/gi) || [];
    for (const block of arrayTjMatches) {
      const innerStrings = block.match(/\(([^)]+)\)/g) || [];
      for (const s of innerStrings) {
        const clean = s.slice(1, -1).trim();
        if (clean.length > 1) textChunks.push(clean);
      }
    }

    if (textChunks.length > 0) {
      return textChunks.join(' ');
    }
  } catch (fallbackErr) {
    console.warn("PDF stream regex fallback notice:", fallbackErr);
  }

  return '';
}
