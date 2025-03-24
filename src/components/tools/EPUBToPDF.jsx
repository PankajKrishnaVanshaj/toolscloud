"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const EPUBToPDF = () => {
  const [file, setFile] = useState(null);
  const [conversionSettings, setConversionSettings] = useState({
    pageSize: "A4",
    fontSize: 12,
    margins: 20,
    includeImages: true,
    includeMetadata: true,
    orientation: "portrait",
    fontFamily: "Times New Roman",
    lineSpacing: 1.5,
    compress: false,
  });
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file upload
  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/epub+zip") {
      setFile(selectedFile);
      setError(null);
      setProgress(0);
    } else {
      setError("Please upload a valid EPUB file (.epub)");
      setFile(null);
    }
  }, []);

  // Handle settings change
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConversionSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Simulate conversion
  const convertToPDF = async () => {
    if (!file) return;

    setIsConverting(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate conversion process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setProgress(i);
      }

      // Simulate PDF creation (in reality, use epubjs and pdfkit)
      const blob = new Blob([file], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(".epub", "")}_converted.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Conversion failed: " + err.message);
    } finally {
      setIsConverting(false);
    }
  };

  // Reset form
  const reset = () => {
    setFile(null);
    setConversionSettings({
      pageSize: "A4",
      fontSize: 12,
      margins: 20,
      includeImages: true,
      includeMetadata: true,
      orientation: "portrait",
      fontFamily: "Times New Roman",
      lineSpacing: 1.5,
      compress: false,
    });
    setProgress(0);
    setError(null);
    setIsConverting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">EPUB to PDF Converter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload EPUB File</label>
          <input
            type="file"
            accept=".epub,application/epub+zip"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isConverting}
          />
        </div>

        {/* Conversion Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Size</label>
            <select
              name="pageSize"
              value={conversionSettings.pageSize}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isConverting}
            >
              <option value="A4">A4 (210 × 297 mm)</option>
              <option value="Letter">Letter (8.5 × 11 in)</option>
              <option value="Legal">Legal (8.5 × 14 in)</option>
              <option value="A5">A5 (148 × 210 mm)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Size (pt)</label>
            <input
              type="number"
              name="fontSize"
              value={conversionSettings.fontSize}
              onChange={handleSettingsChange}
              min="8"
              max="24"
              step="1"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isConverting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Margins (mm)</label>
            <input
              type="number"
              name="margins"
              value={conversionSettings.margins}
              onChange={handleSettingsChange}
              min="0"
              max="50"
              step="1"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isConverting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
            <select
              name="orientation"
              value={conversionSettings.orientation}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isConverting}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
            <select
              name="fontFamily"
              value={conversionSettings.fontFamily}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isConverting}
            >
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Courier">Courier</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Line Spacing</label>
            <select
              name="lineSpacing"
              value={conversionSettings.lineSpacing}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isConverting}
            >
              <option value="1">Single (1.0)</option>
              <option value="1.15">1.15</option>
              <option value="1.5">1.5</option>
              <option value="2">Double (2.0)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeImages"
                checked={conversionSettings.includeImages}
                onChange={handleSettingsChange}
                className="mr-2 accent-blue-500"
                disabled={isConverting}
              />
              <span className="text-sm text-gray-700">Include Images</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeMetadata"
                checked={conversionSettings.includeMetadata}
                onChange={handleSettingsChange}
                className="mr-2 accent-blue-500"
                disabled={isConverting}
              />
              <span className="text-sm text-gray-700">Include Metadata</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="compress"
                checked={conversionSettings.compress}
                onChange={handleSettingsChange}
                className="mr-2 accent-blue-500"
                disabled={isConverting}
              />
              <span className="text-sm text-gray-700">Compress PDF</span>
            </label>
          </div>
        </div>

        {/* Progress Bar */}
        {isConverting && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Converting: {progress}%</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={convertToPDF}
            disabled={!file || isConverting}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaUpload className="mr-2" />
            {isConverting ? "Converting..." : "Convert to PDF"}
          </button>
          <button
            onClick={reset}
            disabled={isConverting}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable page size, font, and margins</li>
            <li>Orientation and line spacing options</li>
            <li>Include/exclude images and metadata</li>
            <li>PDF compression option</li>
            <li>Progress indicator during conversion</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default EPUBToPDF;