"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { pdfjs } from "react-pdf";
import { FaDownload, FaSync, FaUpload, FaCopy } from "react-icons/fa";

// Set worker for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFToText = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState({
    pageRange: "all",
    customRange: "",
    includeFormatting: true,
    extractImages: false,
    outputFormat: "plain",
    fontSize: 14,
  });
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setExtractedText("");
      setNumPages(null);
      setPreviewPage(1);
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

  const extractText = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const pdfData = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
      let text = "";
      let pagesToProcess = [];

      if (settings.pageRange === "all") {
        pagesToProcess = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
      } else {
        pagesToProcess = settings.customRange
          .split(",")
          .flatMap((range) => {
            if (range.includes("-")) {
              const [start, end] = range.split("-").map(Number);
              return Array.from({ length: end - start + 1 }, (_, i) => start + i);
            }
            return [Number(range)];
          })
          .filter((page) => page >= 1 && page <= pdf.numPages);
      }

      for (const pageNum of pagesToProcess) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item) => item.str)
          .join(settings.includeFormatting ? " " : "");

        text +=
          (settings.includeFormatting
            ? settings.outputFormat === "markdown"
              ? `\n\n## Page ${pageNum}\n`
              : `\n\nPage ${pageNum}:\n`
            : "") + pageText;
      }

      setExtractedText(text.trim());
    } catch (error) {
      console.error("Text extraction failed:", error);
      setExtractedText("Error extracting text from PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadText = () => {
    const ext = settings.outputFormat === "plain" ? "txt" : "md";
    const blob = new Blob([extractedText], { type: `text/${settings.outputFormat}` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file.name.split(".")[0]}_extracted.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    alert("Text copied to clipboard!");
  };

  const reset = () => {
    setFile(null);
    setExtractedText("");
    setNumPages(null);
    setPreviewPage(1);
    setSettings({
      pageRange: "all",
      customRange: "",
      includeFormatting: true,
      extractImages: false,
      outputFormat: "plain",
      fontSize: 14,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF to Text Converter</h1>

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

        {file && (
          <div className="space-y-6">
            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Range</label>
                <select
                  name="pageRange"
                  value={settings.pageRange}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Pages</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              {settings.pageRange === "custom" && (
                <div>
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
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
                <select
                  name="outputFormat"
                  value={settings.outputFormat}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="plain">Plain Text (.txt)</option>
                  <option value="markdown">Markdown (.md)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size (px)
                </label>
                <input
                  type="number"
                  name="fontSize"
                  value={settings.fontSize}
                  onChange={handleSettingsChange}
                  min="10"
                  max="24"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeFormatting"
                    checked={settings.includeFormatting}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Preserve Formatting</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="extractImages"
                    checked={settings.extractImages}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Extract Images (Beta)</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">PDF Preview</h2>
              <div className="border p-4 bg-gray-50 rounded-lg">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page pageNumber={previewPage} width={Math.min(400, window.innerWidth - 40)} />
                </Document>
                {numPages && (
                  <div className="mt-2 text-center flex justify-center gap-4">
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
                )}
              </div>
            </div>

            {/* Extracted Text */}
            {extractedText && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">Extracted Text</h2>
                <textarea
                  value={extractedText}
                  readOnly
                  style={{ fontSize: `${settings.fontSize}px` }}
                  className="w-full h-48 p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={extractText}
                disabled={!file || isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUpload className="mr-2" />
                {isProcessing ? "Extracting..." : "Extract Text"}
              </button>
              {extractedText && (
                <>
                  <button
                    onClick={downloadText}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <FaDownload className="mr-2" /> Download
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <FaCopy className="mr-2" /> Copy to Clipboard
                  </button>
                </>
              )}
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
            <p className="text-gray-500 italic">Upload a PDF to start</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Extract text from specific pages or all pages</li>
            <li>Support for plain text and Markdown output</li>
            <li>Customizable font size for extracted text</li>
            <li>Preview PDF with page navigation</li>
            <li>Copy text to clipboard</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFToText;