// app/components/PDFToJSON.jsx
"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

// Set workerSrc for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFToJSON = () => {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionOptions, setExtractionOptions] = useState({
    extractText: true,
    extractMetadata: true,
    extractImages: false,
    extractAnnotations: false,
    pageRange: "all",
    customRange: "",
    includePageNumbers: false,
    formatTextAsArray: false,
  });
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setJsonData(null);
      setNumPages(null);
      setPreviewPage(1);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleOptionsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExtractionOptions((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const convertToJSON = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;

      const jsonOutput = {
        filename: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString(),
      };

      // Extract metadata
      if (extractionOptions.extractMetadata) {
        const metadata = await pdf.getMetadata();
        jsonOutput.metadata = {
          pageCount: pdf.numPages,
          info: metadata.info,
        };
      }

      // Determine page range
      const pageRange =
        extractionOptions.pageRange === "custom" && extractionOptions.customRange
          ? parsePageRange(extractionOptions.customRange, pdf.numPages)
          : Array.from({ length: pdf.numPages }, (_, i) => i + 1);

      // Extract text
      if (extractionOptions.extractText) {
        const textContent = extractionOptions.formatTextAsArray ? [] : "";
        for (const pageNum of pageRange) {
          const page = await pdf.getPage(pageNum);
          const text = await page.getTextContent();
          const pageText = text.items.map((item) => item.str).join(" ").trim();
          if (extractionOptions.formatTextAsArray) {
            textContent.push({
              page: extractionOptions.includePageNumbers ? pageNum : undefined,
              text: pageText,
            });
          } else {
            textContent += (extractionOptions.includePageNumbers ? `Page ${pageNum}: ` : "") + pageText + "\n";
          }
        }
        jsonOutput.textContent = extractionOptions.formatTextAsArray ? textContent : textContent.trim();
      }

      // Extract annotations (basic support)
      if (extractionOptions.extractAnnotations) {
        jsonOutput.annotations = [];
        for (const pageNum of pageRange) {
          const page = await pdf.getPage(pageNum);
          const annotations = await page.getAnnotations();
          if (annotations.length > 0) {
            jsonOutput.annotations.push({
              page: pageNum,
              annotations: annotations.map((ann) => ({
                subtype: ann.subtype,
                contents: ann.contents,
              })),
            });
          }
        }
      }

      // Extract images (placeholder with basic implementation)
      if (extractionOptions.extractImages) {
        jsonOutput.images = [];
        for (const pageNum of pageRange) {
          const page = await pdf.getPage(pageNum);
          const ops = await page.getOperatorList();
          const imageOps = ops.fnArray
            .map((fn, idx) => (fn === pdfjs.OPS.paintImageXObject ? ops.argsArray[idx][0] : null))
            .filter(Boolean);
          if (imageOps.length > 0) {
            jsonOutput.images.push({
              page: pageNum,
              imageCount: imageOps.length,
              note: "Image data extraction requires additional processing",
            });
          }
        }
      }

      if (extractionOptions.pageRange === "custom" && extractionOptions.customRange) {
        jsonOutput.pageRange = extractionOptions.customRange;
      }

      setJsonData(jsonOutput);

      // Download JSON
      const blob = new Blob([JSON.stringify(jsonOutput, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.split(".pdf")[0]}_converted.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("An error occurred during conversion. Check the console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setJsonData(null);
    setNumPages(null);
    setPreviewPage(1);
    setExtractionOptions({
      extractText: true,
      extractMetadata: true,
      extractImages: false,
      extractAnnotations: false,
      pageRange: "all",
      customRange: "",
      includePageNumbers: false,
      formatTextAsArray: false,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const parsePageRange = (rangeStr, maxPages) => {
    const pages = new Set();
    const parts = rangeStr.split(",");

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map((num) => parseInt(num));
        for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
          pages.add(i);
        }
      } else {
        const page = parseInt(trimmed);
        if (page >= 1 && page <= maxPages) pages.add(page);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF to JSON Converter</h1>

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

        {/* Extraction Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="extractText"
                checked={extractionOptions.extractText}
                onChange={handleOptionsChange}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Extract Text</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="extractMetadata"
                checked={extractionOptions.extractMetadata}
                onChange={handleOptionsChange}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Extract Metadata</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="extractImages"
                checked={extractionOptions.extractImages}
                onChange={handleOptionsChange}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Extract Images (Beta)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="extractAnnotations"
                checked={extractionOptions.extractAnnotations}
                onChange={handleOptionsChange}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Extract Annotations</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page Range</label>
              <select
                name="pageRange"
                value={extractionOptions.pageRange}
                onChange={handleOptionsChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Pages</option>
                <option value="custom">Custom Range</option>
              </select>
              {extractionOptions.pageRange === "custom" && (
                <input
                  type="text"
                  name="customRange"
                  value={extractionOptions.customRange}
                  onChange={handleOptionsChange}
                  className="w-full p-2 border rounded-md mt-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1-5, 7"
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includePageNumbers"
                checked={extractionOptions.includePageNumbers}
                onChange={handleOptionsChange}
                className="mr-2 accent-blue-500"
                disabled={!extractionOptions.extractText}
              />
              <span className="text-sm text-gray-700">Include Page Numbers</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="formatTextAsArray"
                checked={extractionOptions.formatTextAsArray}
                onChange={handleOptionsChange}
                className="mr-2 accent-blue-500"
                disabled={!extractionOptions.extractText}
              />
              <span className="text-sm text-gray-700">Format Text as Array</span>
            </label>
          </div>
        </div>

        {/* Preview Section */}
        {file && (
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">PDF Preview</h2>
              <div className="border p-4 bg-gray-50 rounded-lg">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page pageNumber={previewPage} width={Math.min(400, window.innerWidth - 40)} />
                </Document>
                {numPages && (
                  <div className="mt-4 flex justify-center items-center gap-4">
                    <button
                      onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                      disabled={previewPage === 1 || isProcessing}
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {previewPage} of {numPages}
                    </span>
                    <button
                      onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                      disabled={previewPage === numPages || isProcessing}
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>

            {jsonData && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">JSON Preview</h2>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm border border-gray-200">
                  {JSON.stringify(jsonData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={convertToJSON}
            disabled={!file || isProcessing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" />
            {isProcessing ? "Converting..." : "Convert & Download"}
          </button>
          <button
            onClick={reset}
            disabled={!file || isProcessing}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {!file && (
          <div className="text-center p-6 bg-gray-50 rounded-lg mt-6">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to start converting</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Extract text, metadata, annotations, and images (beta)</li>
            <li>Custom page range selection</li>
            <li>Optional page numbers and array formatting</li>
            <li>Real-time PDF preview with pagination</li>
            <li>Automatic JSON download</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFToJSON;