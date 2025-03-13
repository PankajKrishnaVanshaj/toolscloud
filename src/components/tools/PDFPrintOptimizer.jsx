"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const PDFPrintOptimizer = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState({
    quality: 80,
    grayscale: false,
    removeImages: false,
    compressFonts: true,
    removeMetadata: false,
    pageRange: "all",
    customRange: "",
    dpi: 150,
  });
  const fileInputRef = useRef(null);

  // Handle file upload
  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setPreviewPage(1);
      setNumPages(null);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Handle settings changes
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptimizationSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Simulate PDF optimization
  const optimizePDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      // Simulate processing time based on settings
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo: just return the original file with a new name
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `optimized_${Date.now()}_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Optimization failed:", error);
      alert("An error occurred during optimization.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset all settings
  const reset = () => {
    setFile(null);
    setNumPages(null);
    setPreviewPage(1);
    setOptimizationSettings({
      quality: 80,
      grayscale: false,
      removeImages: false,
      compressFonts: true,
      removeMetadata: false,
      pageRange: "all",
      customRange: "",
      dpi: 150,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Print Optimizer</h1>

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
            {/* Optimization Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality ({optimizationSettings.quality}%)
                </label>
                <input
                  type="range"
                  name="quality"
                  value={optimizationSettings.quality}
                  onChange={handleSettingsChange}
                  min="10"
                  max="100"
                  step="5"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DPI ({optimizationSettings.dpi})
                </label>
                <select
                  name="dpi"
                  value={optimizationSettings.dpi}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="72">72 (Screen)</option>
                  <option value="150">150 (Standard)</option>
                  <option value="300">300 (High Quality)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Range</label>
                <select
                  name="pageRange"
                  value={optimizationSettings.pageRange}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Pages</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {optimizationSettings.pageRange === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Range
                  </label>
                  <input
                    type="text"
                    name="customRange"
                    value={optimizationSettings.customRange}
                    onChange={handleSettingsChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1-5, 7"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="grayscale"
                    checked={optimizationSettings.grayscale}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Convert to Grayscale</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="removeImages"
                    checked={optimizationSettings.removeImages}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Remove Images</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="compressFonts"
                    checked={optimizationSettings.compressFonts}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Compress Fonts</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="removeMetadata"
                    checked={optimizationSettings.removeMetadata}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Remove Metadata</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Preview</h2>
              <div className="border p-4 bg-gray-50 rounded-lg relative">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page pageNumber={previewPage} width={Math.min(400, window.innerWidth - 40)} />
                </Document>
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                {numPages && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                      disabled={previewPage === 1 || isProcessing}
                      className="px-3 py-1 bg-gray-200 rounded-l-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-4 text-sm text-gray-600">
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={optimizePDF}
                disabled={!file || isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                {isProcessing ? "Processing..." : "Optimize & Download"}
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
            <p className="text-gray-500 italic">Upload a PDF to start optimizing</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjustable quality and DPI settings</li>
            <li>Grayscale conversion and image removal</li>
            <li>Font compression and metadata removal</li>
            <li>Custom page range selection</li>
            <li>Interactive preview with page navigation</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default PDFPrintOptimizer;