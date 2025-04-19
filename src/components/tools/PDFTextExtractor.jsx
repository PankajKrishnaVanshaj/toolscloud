"use client";
import React, { useState, useCallback, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFTextExtractor = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState({
    pageRange: "all",
    customRange: "",
    includeFormatting: true,
    extractImages: false,
    outputFormat: "plain",
    fontSize: 12,
    lineSpacing: 1.5,
  });
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setExtractedText("");
      setError("");
    }
  }, []);

  // Handle settings changes
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Extract text from PDF
  const extractText = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    setError("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let text = "";
      const totalPages = pdf.numPages;
      let pagesToProcess = [];

      if (settings.pageRange === "all") {
        pagesToProcess = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
        pagesToProcess = parsePageRange(settings.customRange, totalPages);
      }

      for (const pageNum of pagesToProcess) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        let pageText = textContent.items
          .map((item) => item.str)
          .join(settings.includeFormatting ? "\n" : " ");

        text += `Page ${pageNum}:\n${pageText}\n\n`;
      }

      // Format output based on selection
      let formattedText = text;
      if (settings.outputFormat === "json") {
        formattedText = JSON.stringify(
          { text: text.split("\n\n"), extractedAt: new Date() },
          null,
          2
        );
      } else if (settings.outputFormat === "markdown") {
        formattedText = text.replace(/Page (\d+):/g, "# Page $1");
      } else if (settings.outputFormat === "html") {
        formattedText = `<div style="font-size: ${settings.fontSize}px; line-height: ${settings.lineSpacing};">${text
          .replace(/Page (\d+):/g, "<h2>Page $1</h2>")
          .replace(/\n/g, "<br>")}</div>`;
      }

      setExtractedText(formattedText);
    } catch (err) {
      setError("Error extracting text: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [file, settings]);

  // Parse custom page range
  const parsePageRange = (rangeStr, maxPages) => {
    const pages = new Set();
    const ranges = rangeStr.split(",");

    for (const range of ranges) {
      const trimmed = range.trim();
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map((num) => parseInt(num));
        for (let i = Math.max(1, start); i <= Math.min(end, maxPages); i++) {
          pages.add(i);
        }
      } else {
        const page = parseInt(trimmed);
        if (page >= 1 && page <= maxPages) pages.add(page);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  // Download extracted text
  const downloadText = () => {
    if (!extractedText) return;

    const extension =
      settings.outputFormat === "json"
        ? "json"
        : settings.outputFormat === "markdown"
        ? "md"
        : settings.outputFormat === "html"
        ? "html"
        : "txt";
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `extracted_text_${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset component
  const reset = () => {
    setFile(null);
    setExtractedText("");
    setError("");
    setSettings({
      pageRange: "all",
      customRange: "",
      includeFormatting: true,
      extractImages: false,
      outputFormat: "plain",
      fontSize: 12,
      lineSpacing: 1.5,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Text Extractor</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF File</label>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {file && (
          <div className="space-y-6">
            {/* Extraction Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Range</label>
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
                    disabled={isProcessing}
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
                  disabled={isProcessing}
                >
                  <option value="plain">Plain Text</option>
                  <option value="json">JSON</option>
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size ({settings.fontSize}px)
                </label>
                <input
                  type="range"
                  name="fontSize"
                  min="8"
                  max="24"
                  value={settings.fontSize}
                  onChange={handleSettingsChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing || settings.outputFormat !== "html"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line Spacing ({settings.lineSpacing})
                </label>
                <input
                  type="range"
                  name="lineSpacing"
                  min="1"
                  max="3"
                  step="0.1"
                  value={settings.lineSpacing}
                  onChange={handleSettingsChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing || settings.outputFormat !== "html"}
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
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-700">Preserve Formatting</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={extractText}
                disabled={!file || isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUpload className="mr-2" />
                {isProcessing ? "Extracting..." : "Extract Text"}
              </button>
              <button
                onClick={downloadText}
                disabled={!extractedText || isProcessing}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={reset}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>

            {/* Results */}
            {extractedText && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Extracted Text</h2>
                {settings.outputFormat === "html" ? (
                  <div
                    className="w-full h-64 p-4 border rounded-lg bg-gray-50 overflow-auto"
                    dangerouslySetInnerHTML={{ __html: extractedText }}
                  />
                ) : (
                  <textarea
                    value={extractedText}
                    readOnly
                    className="w-full h-64 p-4 border rounded-lg font-mono text-sm bg-gray-50"
                  />
                )}
              </div>
            )}

            {error && <div className="mt-4 text-red-600">{error}</div>}
          </div>
        )}

        {!file && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF file to start extracting text</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Extract text from all or specific pages</li>
            <li>Multiple output formats: Plain Text, JSON, Markdown, HTML</li>
            <li>Customizable font size and line spacing for HTML output</li>
            <li>Preserve formatting option</li>
            <li>Download extracted text in chosen format</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFTextExtractor;