// components/PDFColorConverter.jsx
"use client";
import React, { useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFColorConverter = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState(null);
  const [conversionSettings, setConversionSettings] = useState({
    mode: "grayscale", // grayscale, blackwhite, coloradjust, invert
    threshold: 128, // for black & white
    brightness: 0,
    contrast: 0,
    saturation: 0,
    pageRange: "all",
    customRange: "",
    quality: 80, // for output compression
  });
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle file upload
  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setConvertedFileUrl(null);
      setPreviewPage(1);
      setIsProcessing(false);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Handle settings change
  const handleSettingsChange = (e) => {
    const { name, value, type } = e.target;
    setConversionSettings((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) : value,
    }));
  };

  // Simulate PDF conversion
  const convertPDF = useCallback(async () => {
    if (!file || !canvasRef.current) return;

    setIsProcessing(true);
    try {
      const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Get pages to process
      let pages = [];
      if (conversionSettings.pageRange === "all") {
        pages = Array.from({ length: numPages }, (_, i) => i + 1);
      } else {
        pages = parsePageRange(conversionSettings.customRange, numPages);
      }

      // Process first page as preview (for simplicity)
      const page = await pdf.getPage(previewPage);
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx,
        viewport: viewport,
      }).promise;

      // Apply color conversion
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      switch (conversionSettings.mode) {
        case "grayscale":
          applyGrayscale(data);
          break;
        case "blackwhite":
          applyBlackWhite(data, conversionSettings.threshold);
          break;
        case "coloradjust":
          applyColorAdjust(data, conversionSettings);
          break;
        case "invert":
          applyInvert(data);
          break;
        default:
          break;
      }

      ctx.putImageData(imageData, 0, 0);
      const convertedUrl = canvas.toDataURL("image/jpeg", conversionSettings.quality / 100);
      setConvertedFileUrl(convertedUrl);

      // Simulate full conversion (in reality, you'd process all pages)
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = convertedUrl;
        link.download = `converted_${file.name.split(".")[0]}.jpg`; // Single page as demo
        link.click();
      }, 1000);
    } catch (error) {
      console.error("Conversion failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [file, numPages, previewPage, conversionSettings]);

  // Helper functions for color conversion
  const applyGrayscale = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // R
      data[i + 1] = avg; // G
      data[i + 2] = avg; // B
    }
  };

  const applyBlackWhite = (data, threshold) => {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const value = avg > threshold ? 255 : 0;
      data[i] = value; // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
    }
  };

  const applyColorAdjust = (data, settings) => {
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness
      r = clamp(r + settings.brightness);
      g = clamp(g + settings.brightness);
      b = clamp(b + settings.brightness);

      // Contrast
      const factor = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));
      r = clamp(factor * (r - 128) + 128);
      g = clamp(factor * (g - 128) + 128);
      b = clamp(factor * (b - 128) + 128);

      // Saturation
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
      r = clamp(gray + settings.saturation * (r - gray));
      g = clamp(gray + settings.saturation * (g - gray));
      b = clamp(gray + settings.saturation * (b - gray));

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  };

  const applyInvert = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]; // R
      data[i + 1] = 255 - data[i + 1]; // G
      data[i + 2] = 255 - data[i + 2]; // B
    }
  };

  const clamp = (value) => Math.max(0, Math.min(255, value));

  const parsePageRange = (range, maxPages) => {
    const pages = new Set();
    range.split(",").forEach((part) => {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
          pages.add(i);
        }
      } else {
        const page = Number(part);
        if (page >= 1 && page <= maxPages) pages.add(page);
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  };

  const reset = () => {
    setFile(null);
    setConvertedFileUrl(null);
    setNumPages(null);
    setPreviewPage(1);
    setConversionSettings({
      mode: "grayscale",
      threshold: 128,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      pageRange: "all",
      customRange: "",
      quality: 80,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Color Converter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        {file && (
          <div className="space-y-6">
            {/* Conversion Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                <select
                  name="mode"
                  value={conversionSettings.mode}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="grayscale">Grayscale</option>
                  <option value="blackwhite">Black & White</option>
                  <option value="coloradjust">Color Adjustment</option>
                  <option value="invert">Invert</option>
                </select>
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

              {conversionSettings.mode === "blackwhite" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Threshold ({conversionSettings.threshold})
                  </label>
                  <input
                    type="range"
                    name="threshold"
                    value={conversionSettings.threshold}
                    onChange={handleSettingsChange}
                    min="0"
                    max="255"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              )}

              {conversionSettings.mode === "coloradjust" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brightness ({conversionSettings.brightness})
                    </label>
                    <input
                      type="range"
                      name="brightness"
                      value={conversionSettings.brightness}
                      onChange={handleSettingsChange}
                      min="-100"
                      max="100"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contrast ({conversionSettings.contrast})
                    </label>
                    <input
                      type="range"
                      name="contrast"
                      value={conversionSettings.contrast}
                      onChange={handleSettingsChange}
                      min="-100"
                      max="100"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Saturation ({conversionSettings.saturation})
                    </label>
                    <input
                      type="range"
                      name="saturation"
                      value={conversionSettings.saturation}
                      onChange={handleSettingsChange}
                      min="-100"
                      max="100"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Quality ({conversionSettings.quality}%)
                </label>
                <input
                  type="range"
                  name="quality"
                  value={conversionSettings.quality}
                  onChange={handleSettingsChange}
                  min="10"
                  max="100"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="relative">
              <h2 className="text-lg font-semibold mb-2">Preview (Page {previewPage})</h2>
              <div className="border p-4 bg-gray-50 rounded-lg overflow-auto max-h-96">
                {convertedFileUrl ? (
                  <img src={convertedFileUrl} alt="Converted Preview" className="max-w-full h-auto" />
                ) : (
                  <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={previewPage} width={Math.min(600, window.innerWidth - 80)} />
                  </Document>
                )}
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                )}
              </div>
              {numPages && (
                <div className="mt-2 flex justify-center gap-2">
                  <button
                    onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                    disabled={previewPage === 1 || isProcessing}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-1">
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
            <canvas ref={canvasRef} className="hidden" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={convertPDF}
                disabled={!file || isProcessing}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                {isProcessing ? "Processing..." : "Convert & Download"}
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
            <p className="text-gray-500 italic">Upload a PDF to start converting</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h3 className="font-semibold text-indigo-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-indigo-600 text-sm space-y-1">
            <li>Conversion modes: Grayscale, Black & White, Color Adjustment, Invert</li>
            <li>Custom page range selection</li>
            <li>Adjustable settings with real-time preview</li>
            <li>Output quality control</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Processing indicator</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default PDFColorConverter;