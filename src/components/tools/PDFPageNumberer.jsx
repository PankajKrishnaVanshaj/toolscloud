// app/components/PDFPageNumberer.jsx
"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page } from "react-pdf";
import { PDFDocument } from "pdf-lib"; // For PDF manipulation
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const PDFPageNumberer = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [numberingSettings, setNumberingSettings] = useState({
    position: "bottom-right",
    fontSize: 12,
    fontFamily: "Arial",
    color: "#000000",
    startNumber: 1,
    format: "number",
    prefix: "",
    suffix: "",
    pageRange: "all",
    customRange: "",
    opacity: 1,
    margin: 20,
  });
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setNumPages(null);
      setPreviewPage(1);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNumberingSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const romanize = (num) => {
    const roman = [
      "M",
      "CM",
      "D",
      "CD",
      "C",
      "XC",
      "L",
      "XL",
      "X",
      "IX",
      "V",
      "IV",
      "I",
    ];
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    let result = "";
    for (let i = 0; i < values.length; i++) {
      while (num >= values[i]) {
        result += roman[i];
        num -= values[i];
      }
    }
    return result;
  };

  const addPageNumbers = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(numberingSettings.fontFamily);

      const { position, fontSize, color, startNumber, format, prefix, suffix, pageRange, customRange, opacity, margin } =
        numberingSettings;

      let pageIndices = [];
      if (pageRange === "all") {
        pageIndices = pages.map((_, i) => i);
      } else {
        const ranges = customRange.split(",").map((r) => r.trim());
        ranges.forEach((range) => {
          if (range.includes("-")) {
            const [start, end] = range.split("-").map(Number);
            for (let i = Math.max(0, start - 1); i < Math.min(pages.length, end); i++) {
              pageIndices.push(i);
            }
          } else {
            const index = Number(range) - 1;
            if (index >= 0 && index < pages.length) pageIndices.push(index);
          }
        });
      }

      pageIndices.forEach((pageIndex, idx) => {
        const page = pages[pageIndex];
        const { width, height } = page.getSize();
        const pageNum = startNumber + idx;
        let text = "";
        switch (format) {
          case "roman":
            text = romanize(pageNum);
            break;
          case "letter":
            text = String.fromCharCode(65 + (pageNum - 1));
            break;
          default:
            text = pageNum.toString();
        }
        text = `${prefix}${text}${suffix}`;

        let x, y;
        switch (position) {
          case "top-left":
            x = margin;
            y = height - margin - fontSize;
            break;
          case "top-center":
            x = width / 2 - font.widthOfTextAtSize(text, fontSize) / 2;
            y = height - margin - fontSize;
            break;
          case "top-right":
            x = width - margin - font.widthOfTextAtSize(text, fontSize);
            y = height - margin - fontSize;
            break;
          case "bottom-left":
            x = margin;
            y = margin;
            break;
          case "bottom-center":
            x = width / 2 - font.widthOfTextAtSize(text, fontSize) / 2;
            y = margin;
            break;
          case "bottom-right":
            x = width - margin - font.widthOfTextAtSize(text, fontSize);
            y = margin;
            break;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: PDFDocument.rgb(
            parseInt(color.slice(1, 3), 16) / 255,
            parseInt(color.slice(3, 5), 16) / 255,
            parseInt(color.slice(5, 7), 16) / 255
          ),
          opacity: parseFloat(opacity),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `numbered_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Page numbering failed:", error);
      alert("An error occurred while processing the PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setNumPages(null);
    setPreviewPage(1);
    setNumberingSettings({
      position: "bottom-right",
      fontSize: 12,
      fontFamily: "Arial",
      color: "#000000",
      startNumber: 1,
      format: "number",
      prefix: "",
      suffix: "",
      pageRange: "all",
      customRange: "",
      opacity: 1,
      margin: 20,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Page Numberer</h1>

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

        {/* Numbering Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <select
              name="position"
              value={numberingSettings.position}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Size (pt)</label>
            <input
              type="number"
              name="fontSize"
              value={numberingSettings.fontSize}
              onChange={handleSettingsChange}
              min="6"
              max="72"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
            <select
              name="fontFamily"
              value={numberingSettings.fontFamily}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="Helvetica">Helvetica</option>
              <option value="Times-Roman">Times Roman</option>
              <option value="Courier">Courier</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="color"
              name="color"
              value={numberingSettings.color}
              onChange={handleSettingsChange}
              className="w-full h-10 p-1 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opacity</label>
            <input
              type="range"
              name="opacity"
              min="0.1"
              max="1"
              step="0.1"
              value={numberingSettings.opacity}
              onChange={handleSettingsChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-sm text-gray-600">{numberingSettings.opacity}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Margin (px)</label>
            <input
              type="number"
              name="margin"
              value={numberingSettings.margin}
              onChange={handleSettingsChange}
              min="0"
              max="100"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Number</label>
            <input
              type="number"
              name="startNumber"
              value={numberingSettings.startNumber}
              onChange={handleSettingsChange}
              min="1"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number Format</label>
            <select
              name="format"
              value={numberingSettings.format}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="number">1, 2, 3...</option>
              <option value="roman">I, II, III...</option>
              <option value="letter">A, B, C...</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
            <input
              type="text"
              name="prefix"
              value={numberingSettings.prefix}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Page "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
            <input
              type="text"
              name="suffix"
              value={numberingSettings.suffix}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., /10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Range</label>
            <select
              name="pageRange"
              value={numberingSettings.pageRange}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Pages</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {numberingSettings.pageRange === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Range (e.g., 1-5, 7)
              </label>
              <input
                type="text"
                name="customRange"
                value={numberingSettings.customRange}
                onChange={handleSettingsChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1-5, 7"
              />
            </div>
          )}
        </div>

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-lg relative">
              <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="flex justify-center">
                <Page pageNumber={previewPage} width={Math.min(400, window.innerWidth - 40)} />
              </Document>
              {numPages && (
                <div className="mt-4 flex justify-center items-center gap-4">
                  <button
                    onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                    disabled={previewPage === 1 || isProcessing}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {previewPage} of {numPages}
                  </span>
                  <button
                    onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                    disabled={previewPage === numPages || isProcessing}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            onClick={addPageNumbers}
            disabled={!file || isProcessing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <FaDownload className="mr-2" />
            )}
            {isProcessing ? "Processing..." : "Add Page Numbers & Download"}
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
            <li>Customizable position, font, size, and color</li>
            <li>Multiple number formats (numbers, Roman, letters)</li>
            <li>Prefix and suffix support</li>
            <li>Page range selection (all or custom)</li>
            <li>Adjustable opacity and margin</li>
            <li>Responsive preview with navigation</li>
            <li>Download numbered PDF</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFPageNumberer;