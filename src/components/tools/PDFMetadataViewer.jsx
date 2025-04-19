"use client";
import React, { useState, useCallback } from "react";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
import { PDFDocument } from "pdf-lib"; // For actual metadata editing

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFMetadataViewer = () => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState({});
  const fileInputRef = React.useRef(null);

  // Standard PDF metadata fields with additional ones
  const metadataFields = [
    "Title",
    "Author",
    "Subject",
    "Keywords",
    "Creator",
    "Producer",
    "CreationDate",
    "ModDate",
    "Trapped", // Additional field
  ];

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
      extractMetadata(selectedFile);
    } else {
      setError("Please upload a valid PDF file.");
    }
  }, []);

  const extractMetadata = useCallback(async (pdfFile) => {
    setIsLoading(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      const meta = await pdf.getMetadata();

      setMetadata({
        info: meta.info,
        metadata: meta.metadata,
      });
      setEditedMetadata(meta.info);
    } catch (err) {
      setError("Failed to load PDF metadata: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMetadataChange = (field, value) => {
    setEditedMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveMetadata = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Update metadata
      pdfDoc.setTitle(editedMetadata.Title || "");
      pdfDoc.setAuthor(editedMetadata.Author || "");
      pdfDoc.setSubject(editedMetadata.Subject || "");
      pdfDoc.setKeywords(editedMetadata.Keywords ? editedMetadata.Keywords.split(",") : []);
      pdfDoc.setCreator(editedMetadata.Creator || "");
      pdfDoc.setProducer(editedMetadata.Producer || "");
      if (editedMetadata.CreationDate) pdfDoc.setCreationDate(new Date(editedMetadata.CreationDate));
      if (editedMetadata.ModDate) pdfDoc.setModificationDate(new Date(editedMetadata.ModDate));

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `metadata_updated_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setEditMode(false);
      setFile(blob);
      extractMetadata(blob); // Refresh displayed metadata
    } catch (err) {
      setError("Failed to save metadata: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setMetadata(null);
    setEditedMetadata({});
    setEditMode(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Metadata Viewer & Editor</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF File</label>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 text-center">
            <div className="animate-spin inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-gray-600 mt-2">Processing...</p>
          </div>
        )}

        {/* Metadata Display/Edit */}
        {metadata && !isLoading && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-800">Metadata</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaUpload className="mr-2" />
                  {editMode ? "Cancel" : "Edit"}
                </button>
                <button
                  onClick={reset}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {metadataFields.map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">{field}</label>
                  {editMode ? (
                    <input
                      type={field.includes("Date") ? "datetime-local" : "text"}
                      value={
                        field.includes("Date") && editedMetadata[field]
                          ? new Date(editedMetadata[field]).toISOString().slice(0, 16)
                          : editedMetadata[field] || ""
                      }
                      onChange={(e) =>
                        handleMetadataChange(
                          field,
                          field.includes("Date") ? new Date(e.target.value).toISOString() : e.target.value
                        )
                      }
                      className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Enter ${field}`}
                    />
                  ) : (
                    <div className="mt-1 p-2 bg-gray-50 rounded-md text-gray-700">
                      {metadata.info[field]
                        ? field.includes("Date")
                          ? new Date(metadata.info[field]).toLocaleString()
                          : metadata.info[field]
                        : "Not specified"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Extended Metadata */}
            {metadata.metadata && (
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-2">Extended Metadata</h3>
                <pre className="p-3 bg-gray-50 rounded-md text-sm text-gray-700 overflow-auto max-h-48">
                  {JSON.stringify(metadata.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Save Button */}
            {editMode && (
              <button
                onClick={saveMetadata}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        )}

        {/* Placeholder */}
        {!file && !isLoading && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to view and edit its metadata</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>View and edit standard PDF metadata</li>
            <li>Support for date fields with datetime picker</li>
            <li>Download updated PDF with new metadata</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Extended metadata display</li>
            <li>Error handling and loading states</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFMetadataViewer;