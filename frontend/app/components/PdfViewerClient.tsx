"use client";
import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
 
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
 
interface PdfViewerClientProps {
  file: File;
}
 
const PdfViewerClient = ({ file }: PdfViewerClientProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    setPageNumber(1);
    setNumPages(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);
 
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPageWidth(Math.floor(entry.contentRect.width - 48));
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
 
  if (!fileUrl) return null;
 
  return (
    <div ref={containerRef} className="pdf-viewer">
      <div className="pdf-nav">
        <button
          onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
          disabled={pageNumber <= 1}
          className="pdf-nav-btn"
        >
          ← Prev
        </button>
 
        <span className="pdf-page-info">
          Page {pageNumber} of {numPages ?? "..."}
        </span>
 
        <button
          onClick={() => setPageNumber((p) => Math.min(p + 1, numPages ?? p))}
          disabled={pageNumber >= (numPages ?? 1)}
          className="pdf-nav-btn"
        >
          Next →
        </button>
      </div>
 
      {numPages && numPages > 1 && (
        <div className="pdf-jump">
          <label htmlFor="page-input">Go to page:</label>
          <input
            id="page-input"
            type="number"
            min={1}
            max={numPages}
            value={pageNumber}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1 && val <= numPages) {
                setPageNumber(val);
              }
            }}
            className="pdf-jump-input"
          />
        </div>
      )}
 
      <div className="pdf-document-wrapper">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={(err) => console.error("PDF load error:", err)}
          loading={<p className="pdf-status">Loading PDF...</p>}
          error={<p className="pdf-status pdf-error">Failed to load PDF.</p>}
        >
          <Page
            pageNumber={pageNumber}
            width={pageWidth}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            loading={<p className="pdf-status">Loading page...</p>}
          />
        </Document>
      </div>
    </div>
  );
};
 
export default PdfViewerClient;
