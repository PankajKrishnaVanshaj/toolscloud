// app/components/PDFOCRTool.jsx
"use client";
import React, { useState, useRef, useCallback } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const PDFOCRTool = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [ocrText, setOcrText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState({
    language: "eng",
    pageRange: "all",
    customRange: "",
    outputFormat: "text",
    dpi: 300,
    preprocess: true,
  });
  const fileInputRef = useRef(null);

  const languageOptions = [
    { value: "eng", label: "English" },
    { value: "spa", label: "Spanish" },
    { value: "fra", label: "French" },
    { value: "deu", label: "German" },
    { value: "ita", label: "Italian" },
    { value: "chi_sim", label: "Chinese (Simplified)" },
    { value: "jpn", label: "Japanese" },
  ];

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setOcrText("");
      setPreviewPage(1);
      setNumPages(null);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const performOCR = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      // Simulated OCR process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Parse custom range if applicable
      let pagesToProcess = [];
      if (settings.pageRange === "custom" && settings.customRange) {
        pagesToProcess = settings.customRange.split(",").flatMap((range) => {
          if (range.includes("-")) {
            const [start, end] = range.split("-").map(Number);
            return Array.from(
              { length: end - start + 1 },
              (_, i) => start + i
            ).filter((p) => p >= 1 && p <= numPages);
          }
          const page = Number(range);
          return page >= 1 && page <= numPages ? [page] : [];
        });
      } else {
        pagesToProcess = Array.from({ length: numPages }, (_, i) => i + 1);
      }

      const simulatedText = pagesToProcess
        .map(
          (page) =>
            `Extracted text from ${file.name}\nPage ${page}\nLanguage: ${
              languageOptions.find((opt) => opt.value === settings.language)
                ?.label
            }\nDPI: ${settings.dpi}${
              settings.preprocess ? "\nPreprocessed: Yes" : ""
            }\n\nSample OCR content for page ${page}...`
        )
        .join("\n\n---\n\n");
      setOcrText(simulatedText);
    } catch (error) {
      console.error("OCR failed:", error);
      setOcrText("Error performing OCR");
    } finally {
      setIsProcessing(false);
    }
  }, [file, numPages, settings]);

  const exportResult = () => {
    if (!ocrText) return;

    let blob;
    let extension;
    switch (settings.outputFormat) {
      case "text":
        blob = new Blob([ocrText], { type: "text/plain" });
        extension = "txt";
        break;
      case "pdf":
        blob = new Blob([ocrText], { type: "application/pdf" });
        extension = "pdf";
        break;
      case "docx":
        blob = new Blob([ocrText], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        extension = "docx";
        break;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ocr_result_${file?.name.split(".")[0]}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setNumPages(null);
    setPreviewPage(1);
    setOcrText("");
    setIsProcessing(false);
    setSettings({
      language: "eng",
      pageRange: "all",
      customRange: "",
      outputFormat: "text",
      dpi: 300,
      preprocess: true,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          PDF OCR Tool
        </h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF File
          </label>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              name="language"
              value={settings.language}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Range
            </label>
            <select
              name="pageRange"
              value={settings.pageRange}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            >
              <option value="all">All Pages</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output Format
            </label>
            <select
              name="outputFormat"
              value={settings.outputFormat}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            >
              <option value="text">Plain Text (.txt)</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="docx">Word (.docx)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DPI ({settings.dpi})
            </label>
            <input
              type="range"
              name="dpi"
              min="150"
              max="600"
              step="50"
              value={settings.dpi}
              onChange={handleSettingsChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500 mt-1">
              Higher DPI improves accuracy
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="preprocess"
              checked={settings.preprocess}
              onChange={handleSettingsChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isProcessing}
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Preprocess Image
            </label>
          </div>

          {settings.pageRange === "custom" && (
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Range (e.g., 1-5, 7)
              </label>
              <input
                type="text"
                name="customRange"
                value={settings.customRange}
                onChange={handleSettingsChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1-5, 7"
                disabled={isProcessing}
              />
            </div>
          )}
        </div>

        {/* Preview and Results */}
        {file && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* PDF Preview */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Preview
              </h2>
              <div className="border p-4 bg-gray-50 rounded-lg relative">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page
                    pageNumber={previewPage}
                    width={Math.min(400, window.innerWidth - 40)}
                  />
                </Document>
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                {numPages && (
                  <div className="mt-4 flex justify-center items-center space-x-2">
                    <button
                      onClick={() =>
                        setPreviewPage(Math.max(1, previewPage - 1))
                      }
                      disabled={previewPage === 1 || isProcessing}
                      className="px-3 py-1 bg-gray-200 rounded-l-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {previewPage} of {numPages}
                    </span>
                    <button
                      onClick={() =>
                        setPreviewPage(Math.min(numPages, previewPage + 1))
                      }
                      disabled={previewPage === numPages || isProcessing}
                      className="px-3 py-1 bg-gray-200 rounded-r-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* OCR Results */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                OCR Results
              </h2>
              <textarea
                value={ocrText}
                readOnly
                className="w-full h-64 p-3 border rounded-lg bg-gray-50 text-gray-700 resize-none focus:ring-2 focus:ring-blue-500"
                placeholder="OCR results will appear here after processing..."
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={performOCR}
            disabled={!file || isProcessing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaUpload className="mr-2" />
            {isProcessing ? "Processing..." : "Perform OCR"}
          </button>
          <button
            onClick={exportResult}
            disabled={!ocrText || isProcessing}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Export Result
          </button>
          <button
            onClick={reset}
            disabled={isProcessing}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple language support</li>
            <li>Custom page range processing</li>
            <li>Adjustable DPI for quality control</li>
            <li>Image preprocessing option</li>
            <li>Export as Text, PDF, or Word</li>
            <li>Responsive design with PDF preview</li>
          </ul>
        </div>

       
      </div>
    </div>
  );
};

export default PDFOCRTool;