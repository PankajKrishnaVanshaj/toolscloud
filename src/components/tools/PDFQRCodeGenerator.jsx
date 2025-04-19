"use client";
import React, { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import { FaDownload, FaSync, FaQrcode } from "react-icons/fa";

// Dynamically import QRCode
const QRCode = dynamic(() => import("qrcode.react").then((mod) => mod.default), {
  ssr: false,
});

const PDFQRCodeGenerator = () => {
  const [qrValue, setQrValue] = useState("");
  const [settings, setSettings] = useState({
    size: 200,
    color: "#000000",
    bgColor: "#ffffff",
    margin: 10,
    title: "",
    position: "center",
    pageSize: "A4",
    errorCorrection: "H",
    borderWidth: 0,
    fontSize: 16,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const qrRef = useRef(null);
  const inputRef = useRef(null);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "qrValue") {
      setQrValue(value);
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  // Generate PDF
  const generatePDF = useCallback(async () => {
    if (!qrValue) return;

    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: settings.pageSize,
      });

      const canvas = qrRef.current?.querySelector("canvas");
      if (!canvas) throw new Error("QR Code canvas not found");

      const qrImage = canvas.toDataURL("image/png");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const qrSizeMM = settings.size / 3.78; // Convert px to mm
      let xPosition;

      switch (settings.position) {
        case "left":
          xPosition = settings.margin;
          break;
        case "right":
          xPosition = pageWidth - qrSizeMM - settings.margin;
          break;
        default: // center
          xPosition = (pageWidth - qrSizeMM) / 2;
      }

      // Add title if present
      let yOffset = 20;
      if (settings.title) {
        doc.setFontSize(settings.fontSize);
        doc.text(settings.title, pageWidth / 2, yOffset, { align: "center" });
        yOffset += 20;
      }

      // Add border if specified
      if (settings.borderWidth > 0) {
        doc.setLineWidth(settings.borderWidth / 3.78);
        doc.setDrawColor(settings.color);
        doc.rect(
          xPosition - settings.borderWidth / 3.78,
          yOffset - settings.borderWidth / 3.78,
          qrSizeMM + (settings.borderWidth * 2) / 3.78,
          qrSizeMM + (settings.borderWidth * 2) / 3.78
        );
      }

      doc.addImage(qrImage, "PNG", xPosition, yOffset, qrSizeMM, qrSizeMM);

      const pdfBlob = doc.output("blob");
      saveAs(pdfBlob, `qrcode-${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [qrValue, settings]);

  // Reset form
  const resetForm = () => {
    setQrValue("");
    setSettings({
      size: 200,
      color: "#000000",
      bgColor: "#ffffff",
      margin: 10,
      title: "",
      position: "center",
      pageSize: "A4",
      errorCorrection: "H",
      borderWidth: 0,
      fontSize: 16,
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FaQrcode className="mr-2" /> PDF QR Code Generator
        </h1>

        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            QR Code Content
          </label>
          <input
            ref={inputRef}
            type="text"
            name="qrValue"
            value={qrValue}
            onChange={handleInputChange}
            placeholder="Enter URL, text, or any content"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size (px)
            </label>
            <input
              type="number"
              name="size"
              value={settings.size}
              onChange={handleInputChange}
              min="100"
              max="500"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Margin (mm)
            </label>
            <input
              type="number"
              name="margin"
              value={settings.margin}
              onChange={handleInputChange}
              min="0"
              max="50"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              QR Color
            </label>
            <input
              type="color"
              name="color"
              value={settings.color}
              onChange={handleInputChange}
              className="w-full h-10 p-1 border rounded-md cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <input
              type="color"
              name="bgColor"
              value={settings.bgColor}
              onChange={handleInputChange}
              className="w-full h-10 p-1 border rounded-md cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              name="position"
              value={settings.position}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Size
            </label>
            <select
              name="pageSize"
              value={settings.pageSize}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="A4">A4 (210 × 297 mm)</option>
              <option value="Letter">Letter (216 × 279 mm)</option>
              <option value="A3">A3 (297 × 420 mm)</option>
              <option value="A5">A5 (148 × 210 mm)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Error Correction
            </label>
            <select
              name="errorCorrection"
              value={settings.errorCorrection}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="L">Low</option>
              <option value="M">Medium</option>
              <option value="Q">Quartile</option>
              <option value="H">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Border Width (px)
            </label>
            <input
              type="number"
              name="borderWidth"
              value={settings.borderWidth}
              onChange={handleInputChange}
              min="0"
              max="20"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title Font Size (pt)
            </label>
            <input
              type="number"
              name="fontSize"
              value={settings.fontSize}
              onChange={handleInputChange}
              min="8"
              max="40"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title (optional)
            </label>
            <input
              type="text"
              name="title"
              value={settings.title}
              onChange={handleInputChange}
              placeholder="Enter title for PDF"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Preview */}
        {qrValue && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Preview</h2>
            <div
              ref={qrRef}
              className="flex justify-center p-4 bg-gray-50 rounded-lg shadow-inner"
            >
              <QRCode
                value={qrValue}
                size={settings.size}
                fgColor={settings.color}
                bgColor={settings.bgColor}
                level={settings.errorCorrection}
                includeMargin={true}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={generatePDF}
            disabled={!qrValue || isGenerating}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" />
            {isGenerating ? "Generating..." : "Generate PDF"}
          </button>
          <button
            onClick={resetForm}
            disabled={isGenerating}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable QR code size, colors, and margins</li>
            <li>Multiple page sizes (A4, Letter, A3, A5)</li>
            <li>Adjustable error correction levels</li>
            <li>Optional title with custom font size</li>
            <li>Border around QR code</li>
            <li>Real-time preview</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFQRCodeGenerator;