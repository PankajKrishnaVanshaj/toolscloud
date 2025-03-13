"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { PDFDocument } from "pdf-lib";
import { FaDownload, FaSync, FaTrash, FaUndo } from "react-icons/fa";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFPageDeleter = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [previewPage, setPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setSelectedPages(new Set());
      setPreviewPage(1);
      setHistory([]);
      setError(null);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const togglePageSelection = (page) => {
    setSelectedPages((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(page)) {
        newSelection.delete(page);
      } else {
        newSelection.add(page);
      }
      return newSelection;
    });
  };

  const selectAllPages = () => {
    setSelectedPages(new Set(Array.from({ length: numPages }, (_, i) => i + 1)));
  };

  const clearSelection = () => {
    setSelectedPages(new Set());
  };

  const deletePages = useCallback(async () => {
    if (!file || selectedPages.size === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = srcDoc.getPageCount();
      const newPdfDoc = await PDFDocument.create();
      const pagesToKeep = [];

      for (let i = 0; i < totalPages; i++) {
        if (!selectedPages.has(i + 1)) {
          pagesToKeep.push(i);
        }
      }

      const copiedPages = await newPdfDoc.copyPages(srcDoc, pagesToKeep);
      copiedPages.forEach((page) => newPdfDoc.addPage(page));

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Save to history
      setHistory((prev) => [
        ...prev,
        { file: file, selectedPages: new Set(selectedPages) },
      ].slice(-5)); // Keep last 5 actions

      // Update state
      setFile(blob);
      setSelectedPages(new Set());
      setPreviewPage(1);
      setNumPages(pagesToKeep.length);

      // Auto-download
      const link = document.createElement("a");
      link.href = url;
      link.download = `modified_${Date.now()}_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to process PDF: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [file, selectedPages]);

  const undoLastAction = useCallback(() => {
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];
    setFile(lastAction.file);
    setSelectedPages(new Set());
    setPreviewPage(1);
    setHistory((prev) => prev.slice(0, -1));
    lastAction.file.arrayBuffer().then((buffer) => {
      PDFDocument.load(buffer).then((doc) => setNumPages(doc.getPageCount()));
    });
  }, [history]);

  const reset = () => {
    setFile(null);
    setNumPages(null);
    setSelectedPages(new Set());
    setPreviewPage(1);
    setHistory([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Page Deleter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {file && (
          <div className="space-y-6">
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Page Selection */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Select Pages to Delete ({selectedPages.size} selected)
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllPages}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {Array.from({ length: numPages || 0 }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => togglePageSelection(page)}
                        onMouseEnter={() => setPreviewPage(page)}
                        className={`p-2 text-sm rounded-md transition-colors ${
                          selectedPages.has(page)
                            ? "bg-red-500 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Preview</h2>
                <div className="border p-4 bg-gray-50 rounded-lg shadow-inner">
                  <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex justify-center"
                    loading={<div className="animate-pulse h-64 w-full bg-gray-200 rounded"></div>}
                  >
                    <Page
                      pageNumber={previewPage}
                      width={Math.min(400, window.innerWidth - 40)}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  </Document>
                  {numPages && (
                    <div className="mt-4 flex justify-center items-center gap-4">
                      <button
                        onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                        disabled={previewPage === 1 || isProcessing}
                        className="px-3 py-1 bg-gray-200 rounded-l-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {previewPage} of {numPages}
                      </span>
                      <button
                        onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                        disabled={previewPage === numPages || isProcessing}
                        className="px-3 py-1 bg-gray-200 rounded-r-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={undoLastAction}
                disabled={history.length === 0 || isProcessing}
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaUndo className="mr-2" /> Undo
              </button>
              <button
                onClick={deletePages}
                disabled={isProcessing || selectedPages.size === 0}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaTrash className="mr-2" />
                {isProcessing
                  ? "Processing..."
                  : `Delete ${selectedPages.size} Page${selectedPages.size === 1 ? "" : "s"}`}
              </button>
              <button
                onClick={reset}
                disabled={isProcessing}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">History</h3>
                <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                  {history.slice().reverse().map((action, index) => (
                    <li key={index}>
                      Deleted {action.selectedPages.size} page
                      {action.selectedPages.size === 1 ? "" : "s"} (
                      {Array.from(action.selectedPages).join(", ")})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!file && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaDownload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to start editing</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Select and delete multiple pages</li>
            <li>Interactive page preview with navigation</li>
            <li>Undo functionality with history tracking</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Auto-download modified PDF</li>
            <li>Error handling and processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFPageDeleter;