"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const PDFToEPUB = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSettings, setConversionSettings] = useState({
    includeImages: true,
    toc: true,
    chapterDetection: true,
    pageRange: "all",
    customRange: "",
    title: "",
    author: "",
    language: "en",
    fontSize: 16,
    compressOutput: false,
  });
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setPdfFile(selectedFile);
      setPreviewPage(1);
      setNumPages(null);
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

  const convertToEPUB = async () => {
    if (!pdfFile) return;

    setIsConverting(true);
    try {
      // Simulate EPUB conversion (actual implementation would need a backend or library)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo: Create a blob and trigger download
      const metadata = `
        Title: ${conversionSettings.title || "Untitled"}
        Author: ${conversionSettings.author || "Unknown"}
        Language: ${conversionSettings.language}
        Pages: ${conversionSettings.pageRange === "all" ? "All" : conversionSettings.customRange}
      `;
      const blob = new Blob([pdfFile, metadata], { type: "application/epub+zip" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${conversionSettings.title || "converted"}-${Date.now()}.epub`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("Conversion failed. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const reset = () => {
    setPdfFile(null);
    setNumPages(null);
    setPreviewPage(1);
    setConversionSettings({
      includeImages: true,
      toc: true,
      chapterDetection: true,
      pageRange: "all",
      customRange: "",
      title: "",
      author: "",
      language: "en",
      fontSize: 16,
      compressOutput: false,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF to EPUB Converter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF File</label>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        {pdfFile && (
          <div className="space-y-6">
            {/* Conversion Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={conversionSettings.title}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter EPUB title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  name="author"
                  value={conversionSettings.author}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter author name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  name="language"
                  value={conversionSettings.language}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size (px)
                </label>
                <input
                  type="number"
                  name="fontSize"
                  min="8"
                  max="24"
                  value={conversionSettings.fontSize}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Range</label>
                <select
                  name="pageRange"
                  value={conversionSettings.pageRange}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Pages</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              {conversionSettings.pageRange === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Range
                  </label>
                  <input
                    type="text"
                    name="customRange"
                    value={conversionSettings.customRange}
                    onChange={handleSettingsChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 1-5, 7"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeImages"
                    checked={conversionSettings.includeImages}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">Include Images</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="toc"
                    checked={conversionSettings.toc}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">Generate Table of Contents</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="chapterDetection"
                    checked={conversionSettings.chapterDetection}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">Auto-detect Chapters</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="compressOutput"
                    checked={conversionSettings.compressOutput}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">Compress Output</span>
                </label>
              </div>
            </div>

            {/* PDF Preview */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">PDF Preview</h2>
              <div className="border p-4 bg-gray-50 rounded-lg">
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page
                    pageNumber={previewPage}
                    width={Math.min(600, window.innerWidth - 80)} // Responsive width
                    renderTextLayer={false} // Optional: Disable text layer for performance
                  />
                </Document>
                {numPages && (
                  <div className="mt-4 flex justify-center items-center gap-4">
                    <button
                      onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                      disabled={previewPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {previewPage} of {numPages}
                    </span>
                    <button
                      onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                      disabled={previewPage === numPages}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={convertToEPUB}
                disabled={!pdfFile || isConverting}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isConverting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Converting...
                  </span>
                ) : (
                  <>
                    <FaDownload className="mr-2" /> Convert to EPUB
                  </>
                )}
              </button>
              <button
                onClick={reset}
                disabled={isConverting}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        )}

        {!pdfFile && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF file to start</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h3 className="font-semibold text-indigo-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-indigo-600 text-sm space-y-1">
            <li>Customizable title, author, and language</li>
            <li>Page range selection (all or custom)</li>
            <li>Options for images, TOC, chapter detection, and compression</li>
            <li>Responsive PDF preview with navigation</li>
            <li>Download as EPUB (simulated)</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default PDFToEPUB;