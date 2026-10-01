/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

declare module 'pdfjs-dist/build/pdf.mjs' {
  interface PDFPageProxy {
    getTextContent(): Promise<{ items: Array<{ str?: string }> }>;
  }

  interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export function getDocument(options: {
    data: Uint8Array;
    [key: string]: unknown;
  }): PDFDocumentLoadingTask;
}
