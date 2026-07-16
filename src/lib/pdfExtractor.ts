import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker using a standard CDN import pattern
// This is necessary to avoid "Setting up fake worker" warnings and performance issues in the browser
// Alternatively, we could bundle it, but using cdnjs is robust for Vite.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extracts text content from a PDF file object locally in the browser
 * @param file The PDF File object from an input element
 * @returns A promise that resolves to the extracted text
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  if (file.type !== 'application/pdf') {
    throw new Error('File must be a PDF');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Iterate through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text items from the page
      const pageText = textContent.items
        // @ts-ignore - The types in pdfjs-dist can be slightly misaligned with reality
        .map((item: any) => item.str)
        .join(' ');
        
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to parse PDF file. Please ensure it is a valid, readable PDF document.');
  }
}
