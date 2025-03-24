// components/PDFHeaderFooterEditor.jsx
"use client";
import React, { useState, useRef, useCallback } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { PDFDocument, rgb } from "pdf-lib"; // For actual PDF modification
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const PDFHeaderFooterEditor = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [headerSettings, setHeaderSettings] = useState({
    text: "",
    position: "center",
    fontSize: 12,
    enabled: false,
    pageNumber: false,
    color: "#000000",
    margin: 20,
  });
  const [footerSettings, setFooterSettings] = useState({
    text: "",
    position: "center",
    fontSize: 12,
    enabled: false,
    pageNumber: false,
    color: "#000000",
    margin: 20,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setPreviewPage(1);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleSettingsChange = (type, e) => {
    const { name, value, type: inputType, checked } = e.target;
    const setter = type === "header" ? setHeaderSettings : setFooterSettings;

    setter((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
    }));
  };

  const applyHeaderFooter = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      const font = await pdfDoc.embedFont("Helvetica");

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const pageNum = index + 1;

        // Header
        if (headerSettings.enabled) {
          const headerText = headerSettings.pageNumber
            ? `${headerSettings.text} - Page ${pageNum}`
            : headerSettings.text;
          const headerColor = hexToRgb(headerSettings.color);
          const headerX = getXPosition(headerSettings.position, width, headerText, headerSettings.fontSize);

          page.drawText(headerText, {
            x: headerX,
            y: height - headerSettings.margin,
            size: parseInt(headerSettings.fontSize),
            font,
            color: rgb(headerColor.r, headerColor.g, headerColor.b),
          });
        }

        // Footer
        if (footerSettings.enabled) {
          const footerText = footerSettings.pageNumber
            ? `${footerSettings.text} - Page ${pageNum}`
            : footerSettings.text;
          const footerColor = hexToRgb(footerSettings.color);
          const footerX = getXPosition(footerSettings.position, width, footerText, footerSettings.fontSize);

          page.drawText(footerText, {
            x: footerX,
            y: footerSettings.margin,
            size: parseInt(footerSettings.fontSize),
            font,
            color: rgb(footerColor.r, footerColor.g, footerColor.b),
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `modified_${file.name}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Processing failed:", error);
      alert("An error occurred while processing the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setNumPages(null);
    setPreviewPage(1);
    setHeaderSettings({
      text: "",
      position: "center",
      fontSize: 12,
      enabled: false,
      pageNumber: false,
      color: "#000000",
      margin: 20,
    });
    setFooterSettings({
      text: "",
      position: "center",
      fontSize: 12,
      enabled: false,
      pageNumber: false,
      color: "#000000",
      margin: 20,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Helper functions
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  };

  const getXPosition = (position, width, text, fontSize) => {
    const textWidth = text.length * (fontSize * 0.6); // Rough estimate
    switch (position) {
      case "left": return 20;
      case "center": return (width - textWidth) / 2;
      case "right": return width - textWidth - 20;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Header & Footer Editor</h1>

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

        {/* Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Header Settings */}
          <div className="border p-4 rounded-lg bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Header Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={headerSettings.enabled}
                  onChange={(e) => handleSettingsChange("header", e)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Enable Header</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                <input
                  type="text"
                  name="text"
                  value={headerSettings.text}
                  onChange={(e) => handleSettingsChange("header", e)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter header text"
                  disabled={!headerSettings.enabled}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    name="position"
                    value={headerSettings.position}
                    onChange={(e) => handleSettingsChange("header", e)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={!headerSettings.enabled}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                  <input
                    type="number"
                    name="fontSize"
                    value={headerSettings.fontSize}
                    onChange={(e) => handleSettingsChange("header", e)}
                    min="8"
                    max="24"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={!headerSettings.enabled}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="color"
                    name="color"
                    value={headerSettings.color}
                    onChange={(e) => handleSettingsChange("header", e)}
                    className="w-full h-10 border rounded-md cursor-pointer"
                    disabled={!headerSettings.enabled}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Margin (px)</label>
                  <input
                    type="number"
                    name="margin"
                    value={headerSettings.margin}
                    onChange={(e) => handleSettingsChange("header", e)}
                    min="10"
                    max="50"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={!headerSettings.enabled}
                  />
                </div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="pageNumber"
                  checked={headerSettings.pageNumber}
                  onChange={(e) => handleSettingsChange("header", e)}
                  className="mr-2 accent-blue-500"
                  disabled={!headerSettings.enabled}
                />
                <span className="text-sm text-gray-700">Include Page Number</span>
              </label>
            </div>
          </div>

          {/* Footer Settings */}
          <div className="border p-4 rounded-lg bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Footer Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={footerSettings.enabled}
                  onChange={(e) => handleSettingsChange("footer", e)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Enable Footer</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                <input
                  type="text"
                  name="text"
                  value={footerSettings.text}
                  onChange={(e) => handleSettingsChange("footer", e)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter footer text"
                  disabled={!footerSettings.enabled}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    name="position"
                    value={footerSettings.position}
                    onChange={(e) => handleSettingsChange("footer", e)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={!footerSettings.enabled}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                  <input
                    type="number"
                    name="fontSize"
                    value={footerSettings.fontSize}
                    onChange={(e) => handleSettingsChange("footer", e)}
                    min="8"
                    max="24"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={!footerSettings.enabled}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="color"
                    name="color"
                    value={footerSettings.color}
                    onChange={(e) => handleSettingsChange("footer", e)}
                    className="w-full h-10 border rounded-md cursor-pointer"
                    disabled={!footerSettings.enabled}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Margin (px)</label>
                  <input
                    type="number"
                    name="margin"
                    value={footerSettings.margin}
                    onChange={(e) => handleSettingsChange("footer", e)}
                    min="10"
                    max="50"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={!footerSettings.enabled}
                  />
                </div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="pageNumber"
                  checked={footerSettings.pageNumber}
                  onChange={(e) => handleSettingsChange("footer", e)}
                  className="mr-2 accent-blue-500"
                  disabled={!footerSettings.enabled}
                />
                <span className="text-sm text-gray-700">Include Page Number</span>
              </label>
            </div>
          </div>
        </div>

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-lg relative overflow-hidden">
              {headerSettings.enabled && (
                <div
                  className="absolute top-2 w-full"
                  style={{
                    textAlign: headerSettings.position,
                    fontSize: `${headerSettings.fontSize}px`,
                    color: headerSettings.color,
                    paddingLeft: headerSettings.position === "left" ? "20px" : "0",
                    paddingRight: headerSettings.position === "right" ? "20px" : "0",
                  }}
                >
                  {headerSettings.text}
                  {headerSettings.pageNumber && ` - Page ${previewPage}`}
                </div>
              )}
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page pageNumber={previewPage} width={Math.min(600, window.innerWidth - 80)} />
              </Document>
              {footerSettings.enabled && (
                <div
                  className="absolute bottom-2 w-full"
                  style={{
                    textAlign: footerSettings.position,
                    fontSize: `${footerSettings.fontSize}px`,
                    color: footerSettings.color,
                    paddingLeft: footerSettings.position === "left" ? "20px" : "0",
                    paddingRight: footerSettings.position === "right" ? "20px" : "0",
                  }}
                >
                  {footerSettings.text}
                  {footerSettings.pageNumber && ` - Page ${previewPage}`}
                </div>
              )}
              {numPages && (
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                    disabled={previewPage === 1 || isProcessing}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-1 text-sm text-gray-700">
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
            onClick={applyHeaderFooter}
            disabled={!file || isProcessing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" />
            {isProcessing ? "Processing..." : "Apply and Download"}
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
            <li>Add custom headers and footers to PDFs</li>
            <li>Adjust position, font size, color, and margin</li>
            <li>Optional page numbering</li>
            <li>Real-time preview with page navigation</li>
            <li>Download modified PDF</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFHeaderFooterEditor;