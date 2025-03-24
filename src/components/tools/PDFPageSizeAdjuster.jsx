// app/components/PDFPageSizeAdjuster.jsx
"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { PDFDocument } from "pdf-lib"; // Add pdf-lib for actual PDF manipulation
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const PDFPageSizeAdjuster = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sizeSettings, setSizeSettings] = useState({
    preset: "A4",
    width: 595, // A4 width in points (210mm)
    height: 842, // A4 height in points (297mm)
    unit: "pt",
    maintainAspect: true,
    applyTo: "all",
    customRange: "1", // For custom range input
  });
  const fileInputRef = useRef(null);

  const pageSizes = {
    A4: { width: 595, height: 842 },
    Letter: { width: 612, height: 792 },
    Legal: { width: 612, height: 1008 },
    A3: { width: 842, height: 1191 },
    Tabloid: { width: 792, height: 1224 },
    Custom: { width: 595, height: 842 },
  };

  const units = {
    pt: 1,
    mm: 2.83465,
    in: 72,
  };

  const onFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setPreviewPage(1);
      setNumPages(null);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSizeSettings((prev) => {
      let newSettings = { ...prev };

      if (name === "preset") {
        const { width, height } = pageSizes[value];
        return { ...prev, preset: value, width, height };
      }

      if (name === "width" || name === "height") {
        let newWidth = name === "width" ? parseFloat(value) : prev.width;
        let newHeight = name === "height" ? parseFloat(value) : prev.height;

        if (prev.maintainAspect && file) {
          const aspectRatio = prev.width / prev.height;
          if (name === "width") {
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = newHeight * aspectRatio;
          }
        }
        return { ...prev, [name]: value, width: newWidth, height: newHeight };
      }

      if (type === "checkbox") {
        return { ...prev, [name]: checked };
      }

      return { ...prev, [name]: value };
    });
  };

  const adjustPageSize = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      const { width, height, applyTo, customRange } = sizeSettings;
      const targetWidth = width * units[sizeSettings.unit];
      const targetHeight = height * units[sizeSettings.unit];

      let pagesToAdjust = [];
      if (applyTo === "all") {
        pagesToAdjust = pages;
      } else if (applyTo === "first") {
        pagesToAdjust = [pages[0]];
      } else if (applyTo === "custom") {
        const [start, end] = customRange.split("-").map(Number);
        const startIdx = Math.max(0, start - 1);
        const endIdx = end ? Math.min(pages.length - 1, end - 1) : startIdx;
        pagesToAdjust = pages.slice(startIdx, endIdx + 1);
      }

      pagesToAdjust.forEach((page) => {
        page.setSize(targetWidth, targetHeight);
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resized_${file.name}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF resizing failed:", error);
      alert("An error occurred while resizing the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setNumPages(null);
    setPreviewPage(1);
    setSizeSettings({
      preset: "A4",
      width: 595,
      height: 842,
      unit: "pt",
      maintainAspect: true,
      applyTo: "all",
      customRange: "1",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const convertToPoints = (value, unit) => value * units[unit];

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Page Size Adjuster</h1>

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

        {/* Size Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Size Preset</label>
            <select
              name="preset"
              value={sizeSettings.preset}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(pageSizes).map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              name="unit"
              value={sizeSettings.unit}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="pt">Points (pt)</option>
              <option value="mm">Millimeters (mm)</option>
              <option value="in">Inches (in)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width ({sizeSettings.unit})</label>
            <input
              type="number"
              name="width"
              value={Math.round(convertToPoints(sizeSettings.width, sizeSettings.unit) / units[sizeSettings.unit] * 100) / 100}
              onChange={handleSettingsChange}
              min="1"
              step="0.1"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height ({sizeSettings.unit})</label>
            <input
              type="number"
              name="height"
              value={Math.round(convertToPoints(sizeSettings.height, sizeSettings.unit) / units[sizeSettings.unit] * 100) / 100}
              onChange={handleSettingsChange}
              min="1"
              step="0.1"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="maintainAspect"
                checked={sizeSettings.maintainAspect}
                onChange={handleSettingsChange}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Maintain Aspect Ratio</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apply To</label>
            <select
              name="applyTo"
              value={sizeSettings.applyTo}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Pages</option>
              <option value="first">First Page Only</option>
              <option value="custom">Custom Range</option>
            </select>
            {sizeSettings.applyTo === "custom" && (
              <input
                type="text"
                name="customRange"
                value={sizeSettings.customRange}
                onChange={handleSettingsChange}
                placeholder="e.g., 1-5"
                className="w-full p-2 border rounded-md mt-2 focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-lg relative">
              <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="flex justify-center">
                <Page
                  pageNumber={previewPage}
                  width={Math.min(400, sizeSettings.width)}
                  height={sizeSettings.height * (400 / sizeSettings.width)}
                />
              </Document>
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              {numPages && (
                <div className="mt-4 text-center space-x-2">
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
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={adjustPageSize}
            disabled={!file || isProcessing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" />
            {isProcessing ? "Processing..." : "Adjust Size & Download"}
          </button>
          <button
            onClick={reset}
            disabled={!file || isProcessing}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports multiple page size presets (A4, Letter, Legal, A3, Tabloid)</li>
            <li>Custom width and height with unit conversion (pt, mm, in)</li>
            <li>Maintain aspect ratio option</li>
            <li>Apply to all pages, first page, or custom range</li>
            <li>Real-time preview with page navigation</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFPageSizeAdjuster;