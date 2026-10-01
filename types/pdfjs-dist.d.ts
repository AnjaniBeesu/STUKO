declare module 'pdfjs-dist/build/pdf.mjs' {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<{ items: Array<{ str?: string }> }>;
  }

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export function getDocument(options: {
    data: Uint8Array;
    [key: string]: unknown;
  }): PDFDocumentLoadingTask;
}
