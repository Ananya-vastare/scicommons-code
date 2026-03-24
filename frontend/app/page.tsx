'use client';
import { useState } from "react";
import dynamic from "next/dynamic";
import "./style.css";

interface PdfViewerClientProps {
  file: File;
}

const PdfViewerClient = dynamic<PdfViewerClientProps>(
  () => import("./components/PdfViewerClient"),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading PDF Viewer...
      </div>
    ),
  }
);

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setExtractedText(null);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selected);   
      const res = await fetch("http://localhost:8000/serverresponse/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      setExtractedText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className={`upload-card ${file ? "has-pdf" : ""}`}>
        <h1 className="title">Upload your PDF</h1>
        <p className="subtitle">Drag & drop your file here or click to browse</p>

        <label className="drop-zone">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
          />
          <span>{file ? file.name : "Drop your PDF here"}</span>
        </label>

        {loading && <p style={{ color: "#065f46", marginTop: "1rem" }}>Extracting text...</p>}
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
        {extractedText && (
          <pre style={{ marginTop: "1rem", whiteSpace: "pre-wrap", fontSize: "13px" }}>
            {extractedText}
          </pre>
        )}

        {file && <PdfViewerClient file={file} />}
      </div>
    </div>
  );
}