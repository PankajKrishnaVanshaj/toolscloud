"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const PDFToHTML = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [htmlPreview, setHtmlPreview] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSettings, setConversionSettings] = useState({
    includeImages: true,
    extractText: true,
    preserveFormatting: true,
    pageRange: "all",
    customRange: "",
    cssStyling: "basic",
    fontSize: 16,
    backgroundColor: "#ffffff",
    textAlignment: "left",
  });
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setHtmlPreview("");
      setPreviewPage(1);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConversionSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const convertToHTML = async () => {
    if (!file) return;

    setIsConverting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate processing

      let generatedHTML = `<!DOCTYPE html><html><head><title>${file.name.split(".pdf")[0]}</title>`;
      if (conversionSettings.cssStyling !== "none") {
        generatedHTML += `
          <style>
            body {
              font-family: ${conversionSettings.cssStyling === "modern" ? "'Helvetica', sans-serif" : "Arial, sans-serif"};
              font-size: ${conversionSettings.fontSize}px;
              background-color: ${conversionSettings.backgroundColor};
              ${conversionSettings.cssStyling === "modern" ? "max-width: 900px; margin: 0 auto; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);" : ""}
            }
            .page {
              margin-bottom: 20px;
              text-align: ${conversionSettings.textAlignment};
              ${conversionSettings.preserveFormatting ? "white-space: pre-wrap; line-height: 1.6;" : ""}
            }
            img {
              max-width: 100%;
              height: auto;
              margin: 10px 0;
            }
          </style>`;
      }
      generatedHTML += "</head><body>";

      const pagesToConvert =
        conversionSettings.pageRange === "custom" && conversionSettings.customRange
          ? parsePageRange(conversionSettings.customRange, numPages)
          : Array.from({ length: numPages }, (_, i) => i + 1);

      pagesToConvert.forEach((pageNum) => {
        generatedHTML += `<div class="page">`;
        if (conversionSettings.extractText) {
          generatedHTML += `<h2>Page ${pageNum}</h2><p>Sample text content from page ${pageNum}. This is a placeholder for actual extracted text.</p>`;
        }
        if (conversionSettings.includeImages) {
          generatedHTML += `<img src="https://via.placeholder.com/300x200?text=Page+${pageNum}" alt="Page ${pageNum} image" />`;
        }
        generatedHTML += `</div>`;
      });

      generatedHTML += "</body></html>";
      setHtmlPreview(generatedHTML);

      const blob = new Blob([generatedHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.split(".pdf")[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Conversion failed:", error);
      setHtmlPreview("Error during conversion");
    } finally {
      setIsConverting(false);
    }
  };

  const parsePageRange = (rangeStr, maxPages) => {
    const pages = new Set();
    const ranges = rangeStr.split(",");
    ranges.forEach((range) => {
      if (range.includes("-")) {
        const [start, end] = range.split("-").map((num) => parseInt(num.trim()));
        for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
          pages.add(i);
        }
      } else {
        const page = parseInt(range.trim());
        if (page >= 1 && page <= maxPages) pages.add(page);
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  };

  const reset = () => {
    setFile(null);
    setNumPages(null);
    setPreviewPage(1);
    setHtmlPreview("");
    setIsConverting(false);
    setConversionSettings({
      includeImages: true,
      extractText: true,
      preserveFormatting: true,
      pageRange: "all",
      customRange: "",
      cssStyling: "basic",
      fontSize: 16,
      backgroundColor: "#ffffff",
      textAlignment: "left",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF to HTML Converter</h1>

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

        {/* Conversion Settings */}
        {file && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeImages"
                    checked={conversionSettings.includeImages}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include Images</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="extractText"
                    checked={conversionSettings.extractText}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Extract Text</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="preserveFormatting"
                    checked={conversionSettings.preserveFormatting}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Preserve Formatting</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Range</label>
                <select
                  name="pageRange"
                  value={conversionSettings.pageRange}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Pages</option>
                  <option value="custom">Custom Range</option>
                </select>
                {conversionSettings.pageRange === "custom" && (
                  <input
                    type="text"
                    name="customRange"
                    value={conversionSettings.customRange}
                    onChange={handleSettingsChange}
                    className="w-full p-2 border rounded-md mt-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1-5, 7"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CSS Styling</label>
                <select
                  name="cssStyling"
                  value={conversionSettings.cssStyling}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="basic">Basic</option>
                  <option value="modern">Modern</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Font Size (px)</label>
                <input
                  type="number"
                  name="fontSize"
                  min="10"
                  max="30"
                  value={conversionSettings.fontSize}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <label className="block text-sm font-medium text-gray-700">Background Color</label>
                <input
                  type="color"
                  name="backgroundColor"
                  value={conversionSettings.backgroundColor}
                  onChange={handleSettingsChange}
                  className="w-full h-10 border rounded-md"
                />
                <label className="block text-sm font-medium text-gray-700">Text Alignment</label>
                <select
                  name="textAlignment"
                  value={conversionSettings.textAlignment}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
            </div>

            {/* Preview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">PDF Preview</h2>
                <div className="border p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                  <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex justify-center"
                  >
                    <Page pageNumber={previewPage} width={Math.min(500, window.innerWidth - 40)} />
                  </Document>
                  {numPages && (
                    <div className="mt-4 flex justify-center items-center gap-2">
                      <button
                        onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                        disabled={previewPage === 1 || isConverting}
                        className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {previewPage} of {numPages}
                      </span>
                      <button
                        onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                        disabled={previewPage === numPages || isConverting}
                        className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">HTML Preview</h2>
                <div className="border p-4 bg-gray-50 rounded-lg h-96 overflow-auto">
                  {htmlPreview ? (
                    <iframe
                      srcDoc={htmlPreview}
                      className="w-full h-full border-none"
                      title="HTML Preview"
                    />
                  ) : (
                    <p className="text-gray-500 italic text-center mt-20">
                      Convert to see HTML preview
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={convertToHTML}
                disabled={!file || isConverting}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUpload className="mr-2" />
                {isConverting ? "Converting..." : "Convert to HTML"}
              </button>
              <button
                onClick={reset}
                disabled={!file || isConverting}
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
            <p className="text-gray-500 italic">Upload a PDF to start converting</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert PDF to HTML with customizable settings</li>
            <li>Include/exclude images and text</li>
            <li>Custom page range selection</li>
            <li>Multiple CSS styling options</li>
            <li>Adjustable font size, background color, and text alignment</li>
            <li>Real-time PDF and HTML previews</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Download converted HTML file</li>
          </ul>
        </div>

        {/* Note */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> This is a simulation. For accurate text and image extraction, integrate with a backend service or library like pdf2json.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFToHTML;