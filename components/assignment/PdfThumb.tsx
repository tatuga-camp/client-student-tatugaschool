import React from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// Stable identity (react-pdf reloads when `options` changes). Range requests
// fetch page 1 without downloading the whole PDF.
const PDF_OPTIONS = { disableAutoFetch: true, disableStream: false };

type Props = { url: string; width: number; onError: () => void };

/** Page 1 of a PDF, drawn `width` pixels wide. */
export default function PdfThumb({ url, width, onError }: Props) {
  return (
    <Document
      file={url}
      options={PDF_OPTIONS}
      onLoadError={onError}
      loading={null}
      error={null}
    >
      <Page
        pageNumber={1}
        width={width}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        onRenderError={onError}
        loading={null}
        error={null}
      />
    </Document>
  );
}
