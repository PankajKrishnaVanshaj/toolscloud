// components/PDFWatermark.jsx
"use client";
import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib"; // For PDF manipulation
import { saveAs } from "file-saver"; // For downloading
import { FaWater, FaDownload, FaUpload, FaSync } from "react-icons/fa";

const PDFWatermark = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState("Confidential");
  const [fontSize, setFontSize] = useState(30);
  const [opacity, setOpacity] = useState(0.5);
  const [color, setColor] = useState("#808080"); // Gray by default
  const [rotation, setRotation] = useState(45); // Diagonal by default
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError("");
      setSuccess(false);
    } else {
      setError("Please upload a valid PDF file.");
      setPdfFile(null);
    }
  };

  // Add watermark to PDF
  const addWatermark = async () => {
    if (!pdfFile || !watermarkText) {
      setError(!pdfFile ? "Please upload a PDF file." : "Please enter watermark text.");
      setSuccess(false);
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess(false);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont("Helvetica"); // Use a standard font

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = fontSize;

        // Center the watermark diagonally
        const centerX = (width - textWidth * Math.cos(rotation * Math.PI / 180)) / 2;
        const centerY = (height + textHeight * Math.sin(rotation * Math.PI / 180)) / 2;

        page.drawText(watermarkText, {
          x: centerX,
          y: centerY,
          size: fontSize,
          font,
          color: pdfDoc.getRGBColorFromHex(color), // Convert hex to RGB
          opacity,
          rotate: { type: "degrees", angle: rotation },
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, `watermarked_${pdfFile.name}`);

      setSuccess(true);
    } catch (err) {
      setError("Failed to add watermark. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setPdfFile(null);
    setWatermarkText("Confidential");
    setFontSize(30);
    setOpacity(0.5);
    setColor("#808080");
    setRotation(45);
    setError("");
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Utility to convert hex color to RGB for pdf-lib
  PDFDocument.prototype.getRGBColorFromHex = function (hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return this.context.rgb(r, g, b);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          PDF Watermarker
        </h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF File
          </label>
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {pdfFile && (
          <div className="space-y-6">
            {/* Watermark Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter watermark text"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size ({fontSize}px)
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opacity ({opacity})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 rounded-md cursor-pointer"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rotation ({rotation}°)
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={addWatermark}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaWater className="mr-2" />
                )}
                {isProcessing ? "Processing..." : "Add Watermark"}
              </button>
              <button
                onClick={resetForm}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                Watermark added successfully and PDF downloaded!
              </div>
            )}
          </div>
        )}

        {/* Placeholder */}
        {!pdfFile && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to add a watermark</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Add customizable text watermark to PDFs</li>
            <li>Adjust font size, opacity, color, and rotation</li>
            <li>Apply watermark to all pages</li>
            <li>Download watermarked PDF</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFWatermark;