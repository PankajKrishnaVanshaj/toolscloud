// app/components/PDFMetadataEditor.jsx
"use client";
import React, { useState, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib"; // For actual PDF editing
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const PDFMetadataEditor = () => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    title: "",
    author: "",
    subject: "",
    keywords: "",
    creator: "",
    producer: "",
    creationDate: "",
    modDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file upload
  const onFileChange = useCallback(async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      await loadMetadata(selectedFile);
      setError(null);
    } else {
      setError("Please upload a valid PDF file.");
    }
  }, []);

  // Load PDF metadata using pdf-lib
  const loadMetadata = async (pdfFile) => {
    try {
      setIsLoading(true);
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const info = pdfDoc.getInfo();

      setMetadata({
        title: pdfDoc.getTitle() || "",
        author: pdfDoc.getAuthor() || "",
        subject: pdfDoc.getSubject() || "",
        keywords: pdfDoc.getKeywords() || "",
        creator: pdfDoc.getCreator() || "",
        producer: pdfDoc.getProducer() || "",
        creationDate: pdfDoc.getCreationDate()?.toISOString().slice(0, 19).replace("T", " ") || "",
        modDate: pdfDoc.getModificationDate()?.toISOString().slice(0, 19).replace("T", " ") || "",
      });
    } catch (error) {
      console.error("Error loading metadata:", error);
      setError("Failed to load PDF metadata.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle metadata changes
  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsModified(true);
  };

  // Reset to initial state
  const reset = () => {
    setFile(null);
    setMetadata({
      title: "",
      author: "",
      subject: "",
      keywords: "",
      creator: "",
      producer: "",
      creationDate: "",
      modDate: "",
    });
    setIsModified(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Save modified PDF with updated metadata
  const savePDF = async () => {
    if (!file || !isModified) return;

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Update metadata
      pdfDoc.setTitle(metadata.title);
      pdfDoc.setAuthor(metadata.author);
      pdfDoc.setSubject(metadata.subject);
      pdfDoc.setKeywords(metadata.keywords.split(",").map((k) => k.trim()));
      pdfDoc.setCreator(metadata.creator);
      pdfDoc.setProducer(metadata.producer);
      if (metadata.creationDate) pdfDoc.setCreationDate(new Date(metadata.creationDate));
      if (metadata.modDate) pdfDoc.setModificationDate(new Date(metadata.modDate));

      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `metadata_edited_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsModified(false);
    } catch (error) {
      console.error("Error saving PDF:", error);
      setError("Failed to save modified PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Metadata Editor</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF File</label>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Metadata Form */}
        {file && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Title", name: "title" },
                { label: "Author", name: "author" },
                { label: "Subject", name: "subject" },
                { label: "Keywords", name: "keywords", placeholder: "Separate with commas" },
                { label: "Creator", name: "creator" },
                { label: "Producer", name: "producer" },
                { label: "Creation Date", name: "creationDate", placeholder: "YYYY-MM-DD HH:mm:ss" },
                { label: "Modification Date", name: "modDate", placeholder: "YYYY-MM-DD HH:mm:ss" },
              ].map(({ label, name, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700">{label}</label>
                  <input
                    type="text"
                    name={name}
                    value={metadata[name]}
                    onChange={handleMetadataChange}
                    placeholder={placeholder}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-100"
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={savePDF}
                disabled={isLoading || !isModified}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                {isLoading ? "Processing..." : "Save Modified PDF"}
              </button>
              <button
                onClick={reset}
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        )}

        {/* Placeholder */}
        {!file && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to start editing metadata</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Edit all standard PDF metadata fields</li>
            <li>Actual metadata modification using pdf-lib</li>
            <li>Download modified PDF with updated metadata</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Error handling and loading states</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFMetadataEditor;