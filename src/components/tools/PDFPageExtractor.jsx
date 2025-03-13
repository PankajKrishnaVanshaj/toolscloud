"use client";
import React, { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { PDFDocument } from "pdf-lib";
import { FaDownload, FaSync, FaUpload, FaTrash } from "react-icons/fa";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFPageExtractor = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [previewPage, setPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rangeInput, setRangeInput] = useState("");
  const [outputName, setOutputName] = useState("");
  const fileInputRef = React.useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setSelectedPages(new Set());
      setPreviewPage(1);
      setRangeInput("");
      setOutputName(selectedFile.name.replace(".pdf", "_extracted.pdf"));
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const togglePageSelection = (pageNumber) => {
    setSelectedPages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pageNumber)) {
        newSet.delete(pageNumber);
      } else {
        newSet.add(pageNumber);
      }
      return newSet;
    });
  };

  const handleRangeInput = (e) => {
    setRangeInput(e.target.value);
    const pages = parsePageRange(e.target.value, numPages);
    setSelectedPages(new Set(pages));
  };

  const parsePageRange = (range, totalPages) => {
    const pages = new Set();
    const parts = range.split(",");

    parts.forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map((n) => parseInt(n));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
            pages.add(i);
          }
        }
      } else {
        const num = parseInt(trimmed);
        if (!isNaN(num) && num >= 1 && num <= totalPages) {
          pages.add(num);
        }
      }
    });
    return pages;
  };

  const selectEvenOdd = (type) => {
    const pages = new Set();
    for (let i = 1; i <= numPages; i++) {
      if (type === "even" && i % 2 === 0) pages.add(i);
      if (type === "odd" && i % 2 !== 0) pages.add(i);
    }
    setSelectedPages(pages);
    setRangeInput(type === "even" ? "Even pages" : "Odd pages");
  };

  const extractPages = useCallback(async () => {
    if (!file || selectedPages.size === 0) return;

    setIsProcessing(true);
    try {
      const pdfBytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(pdfBytes);
      const newPdfDoc = await PDFDocument.create();

      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
      const copiedPages = await newPdfDoc.copyPages(
        srcDoc,
        sortedPages.map((pageNum) => pageNum - 1)
      );

      copiedPages.forEach((page) => newPdfDoc.addPage(page));

      const pdfBytesExtracted = await newPdfDoc.save();
      const blob = new Blob([pdfBytesExtracted], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = outputName || `extracted_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Extraction failed:", error);
      alert("An error occurred while extracting pages");
    } finally {
      setIsProcessing(false);
    }
  }, [file, selectedPages, outputName]);

  const reset = () => {
    setFile(null);
    setNumPages(null);
    setSelectedPages(new Set());
    setPreviewPage(1);
    setRangeInput("");
    setOutputName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Page Extractor</h1>

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

        {file && numPages && (
          <div className="space-y-6">
            {/* Selection Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Range (e.g., 1-3, 5, 7-9)
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={handleRangeInput}
                  placeholder="e.g., 1-3, 5, 7-9"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedPages(new Set([...Array(numPages)].map((_, i) => i + 1)))}
                  className="py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isProcessing}
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedPages(new Set())}
                  className="py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isProcessing}
                >
                  Clear
                </button>
                <button
                  onClick={() => selectEvenOdd("odd")}
                  className="py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isProcessing}
                >
                  Odd Pages
                </button>
                <button
                  onClick={() => selectEvenOdd("even")}
                  className="py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isProcessing}
                >
                  Even Pages
                </button>
              </div>
            </div>

            {/* Page Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg">
              {[...Array(numPages)].map((_, index) => {
                const pageNum = index + 1;
                const isSelected = selectedPages.has(pageNum);
                return (
                  <button
                    key={pageNum}
                    onClick={() => togglePageSelection(pageNum)}
                    className={`p-2 border rounded-md text-sm transition-colors ${
                      isSelected
                        ? "bg-blue-500 text-white border-blue-600"
                        : "bg-white border-gray-300 hover:bg-gray-100"
                    }`}
                    disabled={isProcessing}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Output Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Output File Name</label>
              <input
                type="text"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                placeholder="Enter output file name"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
            </div>

            {/* Preview */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Preview</h2>
              <div className="border p-4 bg-gray-50 rounded-lg">
                <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="flex justify-center">
                  <Page pageNumber={previewPage} width={Math.min(400, window.innerWidth - 40)} />
                </Document>
                <div className="mt-2 text-center space-x-2">
                  <button
                    onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                    disabled={previewPage === 1 || isProcessing}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {previewPage} of {numPages}
                  </span>
                  <button
                    onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                    disabled={previewPage === numPages || isProcessing}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={extractPages}
                disabled={!file || selectedPages.size === 0 || isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                {isProcessing
                  ? "Processing..."
                  : `Extract ${selectedPages.size} Page${selectedPages.size !== 1 ? "s" : ""}`}
              </button>
              <button
                onClick={reset}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        )}

        {!file && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to start extracting pages</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Select pages individually or via range input</li>
            <li>Quick select all, odd, or even pages</li>
            <li>Custom output file name</li>
            <li>Interactive page preview with navigation</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Download extracted pages as a new PDF</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFPageExtractor;