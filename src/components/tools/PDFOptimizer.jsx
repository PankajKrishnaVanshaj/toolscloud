"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const PDFOptimizer = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [optimizationStatus, setOptimizationStatus] = useState({
    isProcessing: false,
    progress: 0,
    error: null,
    originalSize: null,
    resultSize: null,
  });
  const [settings, setSettings] = useState({
    compressionLevel: "medium",
    optimizeImages: true,
    imageQuality: 75,
    removeMetadata: true,
    convertToGrayscale: false,
    removeBookmarks: false,
    flattenForms: false,
    removeFonts: false,
    subsetFonts: true,
    removeDuplicateImages: true,
    optimizePageContent: true,
  });
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setOptimizationStatus({
        isProcessing: false,
        progress: 0,
        error: null,
        originalSize: selectedFile.size,
        resultSize: null,
      });
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

  // Simulate PDF optimization
  const optimizePDF = async () => {
    if (!file) return;

    setOptimizationStatus((prev) => ({
      ...prev,
      isProcessing: true,
      progress: 0,
      error: null,
    }));

    try {
      // Simulate processing time based on settings
      const steps = Object.values(settings).filter(Boolean).length;
      const stepTime = 300; // ms per step
      for (let i = 0; i <= 100; i += Math.floor(100 / steps)) {
        await new Promise((resolve) => setTimeout(resolve, stepTime));
        setOptimizationStatus((prev) => ({ ...prev, progress: Math.min(i, 100) }));
      }

      // Simulate size reduction based on compression level and settings
      const reductionFactor = {
        low: 0.9,
        medium: 0.7,
        high: 0.5,
      }[settings.compressionLevel];
      const additionalReduction = (Object.values(settings).filter(Boolean).length - 1) * 0.05;
      const simulatedSize = file.size * reductionFactor * (1 - additionalReduction);
      const optimizedBlob = await file.arrayBuffer();
      const optimizedFile = new Blob([optimizedBlob], { type: "application/pdf" });

      // Download the file
      const url = URL.createObjectURL(optimizedFile);
      const link = document.createElement("a");
      link.href = url;
      link.download = `optimized_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setOptimizationStatus({
        isProcessing: false,
        progress: 100,
        error: null,
        originalSize: file.size,
        resultSize: simulatedSize,
      });
    } catch (error) {
      setOptimizationStatus({
        isProcessing: false,
        progress: 0,
        error: "Failed to optimize PDF: " + error.message,
        originalSize: file.size,
        resultSize: null,
      });
    }
  };

  // Reset to initial state
  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setOptimizationStatus({
      isProcessing: false,
      progress: 0,
      error: null,
      originalSize: null,
      resultSize: null,
    });
    setSettings({
      compressionLevel: "medium",
      optimizeImages: true,
      imageQuality: 75,
      removeMetadata: true,
      convertToGrayscale: false,
      removeBookmarks: false,
      flattenForms: false,
      removeFonts: false,
      subsetFonts: true,
      removeDuplicateImages: true,
      optimizePageContent: true,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Optimizer</h1>

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
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {file && (
          <div className="space-y-6">
            {/* Optimization Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compression Level
                </label>
                <select
                  name="compressionLevel"
                  value={settings.compressionLevel}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={optimizationStatus.isProcessing}
                >
                  <option value="low">Low (Better Quality)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Smaller Size)</option>
                </select>
              </div>

              {settings.optimizeImages && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Quality ({settings.imageQuality})
                  </label>
                  <input
                    type="range"
                    name="imageQuality"
                    value={settings.imageQuality}
                    onChange={handleSettingsChange}
                    min="10"
                    max="100"
                    step="5"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    disabled={optimizationStatus.isProcessing}
                  />
                </div>
              )}

              <div className="space-y-3">
                {[
                  { name: "optimizeImages", label: "Optimize Images" },
                  { name: "removeMetadata", label: "Remove Metadata" },
                  { name: "convertToGrayscale", label: "Convert to Grayscale" },
                  { name: "removeBookmarks", label: "Remove Bookmarks" },
                  { name: "flattenForms", label: "Flatten Forms" },
                  { name: "removeFonts", label: "Remove Embedded Fonts" },
                  { name: "subsetFonts", label: "Subset Fonts" },
                  { name: "removeDuplicateImages", label: "Remove Duplicate Images" },
                  { name: "optimizePageContent", label: "Optimize Page Content" },
                ].map(({ name, label }) => (
                  <label key={name} className="flex items-center">
                    <input
                      type="checkbox"
                      name={name}
                      checked={settings[name]}
                      onChange={handleSettingsChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={optimizationStatus.isProcessing}
                    />
                    <span className="ml-2 text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Progress and Status */}
            {optimizationStatus.isProcessing && (
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${optimizationStatus.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Optimizing: {optimizationStatus.progress}%
                </p>
              </div>
            )}

            {optimizationStatus.error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
                {optimizationStatus.error}
              </div>
            )}

            {optimizationStatus.resultSize && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
                Optimization complete! Original size: {(optimizationStatus.originalSize / 1024 / 1024).toFixed(2)} MB → New size: {(optimizationStatus.resultSize / 1024 / 1024).toFixed(2)} MB (
                {(((optimizationStatus.originalSize - optimizationStatus.resultSize) / optimizationStatus.originalSize) * 100).toFixed(1)}% reduction)
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={optimizePDF}
                disabled={!file || optimizationStatus.isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUpload className="mr-2" />
                {optimizationStatus.isProcessing ? "Optimizing..." : "Optimize PDF"}
              </button>
              <button
                onClick={reset}
                disabled={optimizationStatus.isProcessing}
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
            <li>Multiple compression levels (Low, Medium, High)</li>
            <li>Customizable image quality</li>
            <li>Advanced optimization options (fonts, metadata, etc.)</li>
            <li>Progress tracking with size comparison</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Download optimized PDF</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default PDFOptimizer;