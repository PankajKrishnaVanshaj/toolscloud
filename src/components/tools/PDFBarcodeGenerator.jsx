"use client";
import React, { useState, useRef, useCallback } from "react";
import JsBarcode from "jsbarcode";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { FaDownload, FaSync, FaEye } from "react-icons/fa";

const PDFBarcodeGenerator = () => {
  const canvasRef = useRef(null);
  const [barcodeData, setBarcodeData] = useState({
    value: "",
    format: "CODE128",
    width: 2,
    height: 100,
    text: true,
    fontSize: 20,
    background: "#ffffff",
    lineColor: "#000000",
    copies: 1,
    pageSize: "A4",
    margin: 20,
    orientation: "portrait",
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const barcodeFormats = [
    "CODE128",
    "CODE39",
    "EAN13",
    "EAN8",
    "UPC",
    "ITF",
    "MSI",
    "PHARMACODE",
    "CODABAR",
  ];

  const pageSizes = {
    A4: [595.28, 841.89], // in points (1/72 inch)
    Letter: [612, 792],
    Legal: [612, 1008],
    Custom: [595.28, 841.89], // Default, adjustable
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBarcodeData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const generatePreview = useCallback(() => {
    if (!barcodeData.value) return;

    try {
      JsBarcode(canvasRef.current, barcodeData.value, {
        format: barcodeData.format,
        width: barcodeData.width,
        height: barcodeData.height,
        displayValue: barcodeData.text,
        fontSize: barcodeData.fontSize,
        background: barcodeData.background,
        lineColor: barcodeData.lineColor,
      });
      setPreviewUrl(canvasRef.current.toDataURL());
    } catch (error) {
      console.error("Barcode generation failed:", error);
    }
  }, [barcodeData]);

  const generatePDF = async () => {
    if (!barcodeData.value) return;

    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      let [pageWidth, pageHeight] =
        barcodeData.pageSize === "Custom"
          ? pageSizes[barcodeData.pageSize]
          : pageSizes[barcodeData.pageSize];
      if (barcodeData.orientation === "landscape") [pageWidth, pageHeight] = [pageHeight, pageWidth];

      const canvas = canvasRef.current;
      JsBarcode(canvas, barcodeData.value, {
        format: barcodeData.format,
        width: barcodeData.width,
        height: barcodeData.height,
        displayValue: barcodeData.text,
        fontSize: barcodeData.fontSize,
        background: barcodeData.background,
        lineColor: barcodeData.lineColor,
      });

      const barcodeImageData = canvas.toDataURL("image/png");
      const barcodeImageBytes = await fetch(barcodeImageData).then((res) => res.arrayBuffer());
      const barcodeImage = await pdfDoc.embedPng(barcodeImageBytes);

      const barcodeWidth = barcodeImage.width * 0.5;
      const barcodeHeight = barcodeImage.height * 0.5;
      const spacing = barcodeData.margin;
      const itemsPerRow = Math.floor((pageWidth - spacing) / (barcodeWidth + spacing));
      const rowsPerPage = Math.floor((pageHeight - spacing) / (barcodeHeight + spacing));
      const itemsPerPage = itemsPerRow * rowsPerPage;
      const totalPages = Math.ceil(barcodeData.copies / itemsPerPage);

      for (let i = 0; i < barcodeData.copies; i++) {
        const pageIndex = Math.floor(i / itemsPerPage);
        const itemIndex = i % itemsPerPage;
        const row = Math.floor(itemIndex / itemsPerRow);
        const col = itemIndex % itemsPerRow;

        if (i % itemsPerPage === 0) {
          pdfDoc.addPage([pageWidth, pageHeight]);
        }

        const page = pdfDoc.getPage(pageIndex);
        const x = col * (barcodeWidth + spacing) + spacing / 2;
        const y = pageHeight - ((row + 1) * (barcodeHeight + spacing)) - spacing / 2;

        page.drawImage(barcodeImage, {
          x,
          y,
          width: barcodeWidth,
          height: barcodeHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, `barcodes_${barcodeData.value}_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setBarcodeData({
      value: "",
      format: "CODE128",
      width: 2,
      height: 100,
      text: true,
      fontSize: 20,
      background: "#ffffff",
      lineColor: "#000000",
      copies: 1,
      pageSize: "A4",
      margin: 20,
      orientation: "portrait",
    });
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Barcode Generator</h1>

        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barcode Value</label>
            <input
              type="text"
              name="value"
              value={barcodeData.value}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter barcode value"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select
              name="format"
              value={barcodeData.format}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {barcodeFormats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
            <input
              type="number"
              name="width"
              value={barcodeData.width}
              onChange={handleInputChange}
              min="1"
              max="10"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
            <input
              type="number"
              name="height"
              value={barcodeData.height}
              onChange={handleInputChange}
              min="20"
              max="200"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
            <input
              type="number"
              name="fontSize"
              value={barcodeData.fontSize}
              onChange={handleInputChange}
              min="10"
              max="40"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Copies</label>
            <input
              type="number"
              name="copies"
              value={barcodeData.copies}
              onChange={handleInputChange}
              min="1"
              max="1000"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Size</label>
            <select
              name="pageSize"
              value={barcodeData.pageSize}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(pageSizes).map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
            <select
              name="orientation"
              value={barcodeData.orientation}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Margin (pt)</label>
            <input
              type="number"
              name="margin"
              value={barcodeData.margin}
              onChange={handleInputChange}
              min="0"
              max="100"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
            <input
              type="color"
              name="background"
              value={barcodeData.background}
              onChange={handleInputChange}
              className="w-full h-10 p-1 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Line Color</label>
            <input
              type="color"
              name="lineColor"
              value={barcodeData.lineColor}
              onChange={handleInputChange}
              className="w-full h-10 p-1 border rounded-md"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="text"
                checked={barcodeData.text}
                onChange={handleInputChange}
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Show Text</span>
            </label>
          </div>
        </div>

        {/* Preview and Controls */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generatePreview}
              disabled={!barcodeData.value || isGenerating}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaEye className="mr-2" /> Generate Preview
            </button>
            <button
              onClick={generatePDF}
              disabled={!barcodeData.value || isGenerating}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> {isGenerating ? "Generating..." : "Generate PDF"}
            </button>
            <button
              onClick={resetForm}
              disabled={isGenerating}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          <canvas ref={canvasRef} className="hidden" />
          {previewUrl && (
            <div className="border p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
              <img src={previewUrl} alt="Barcode Preview" className="mx-auto max-w-full h-auto" />
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple barcode formats supported</li>
            <li>Customizable width, height, and font size</li>
            <li>Adjustable page size and orientation</li>
            <li>Configurable margins and number of copies</li>
            <li>Color customization for background and lines</li>
            <li>Real-time preview</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFBarcodeGenerator;