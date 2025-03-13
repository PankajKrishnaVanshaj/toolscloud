// app/components/ExcelToPDF.jsx
"use client";
import React, { useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FaUpload, FaDownload, FaSync } from "react-icons/fa";

const ExcelToPDF = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionSettings, setConversionSettings] = useState({
    orientation: "portrait",
    pageSize: "A4",
    fontSize: 12,
    includeHeaders: true,
    fitToPage: false,
    addGrid: true,
    headerColor: "#e5e7eb", // Light gray
    textColor: "#000000",
    margin: 20,
    title: "Excel to PDF Conversion",
  });
  const fileInputRef = useRef(null);

  // Handle file upload and parsing
  const handleFileUpload = useCallback((e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const firstSheet = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
      setData(sheetData);
    };

    reader.readAsBinaryString(uploadedFile);
  }, []);

  // Handle settings change
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConversionSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Convert Excel data to PDF
  const convertToPDF = useCallback(() => {
    if (!file || !data.length) return;

    setIsProcessing(true);
    try {
      const doc = new jsPDF({
        orientation: conversionSettings.orientation,
        unit: "pt",
        format: conversionSettings.pageSize,
      });

      // Prepare table data
      const headers = conversionSettings.includeHeaders
        ? [Object.keys(data[0])]
        : [];
      const body = data.map((obj) => Object.values(obj));

      // Generate table
      doc.autoTable({
        head: headers,
        body: body,
        startY: conversionSettings.margin + 20,
        theme: conversionSettings.addGrid ? "grid" : "plain",
        styles: {
          fontSize: conversionSettings.fontSize,
          cellPadding: 5,
          textColor: conversionSettings.textColor,
        },
        headStyles: {
          fillColor: conversionSettings.headerColor,
          textColor: "#000000",
        },
        margin: { top: conversionSettings.margin, left: conversionSettings.margin, right: conversionSettings.margin },
        tableWidth: conversionSettings.fitToPage ? "wrap" : "auto",
        didDrawPage: (data) => {
          // Add custom title
          doc.setFontSize(18);
          doc.setTextColor("#000000");
          doc.text(conversionSettings.title, conversionSettings.margin, conversionSettings.margin);
        },
      });

      // Download the PDF
      doc.save(`converted_${file.name.split(".")[0]}_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("An error occurred during conversion. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [file, data, conversionSettings]);

  // Reset everything
  const reset = () => {
    setFile(null);
    setData([]);
    setConversionSettings({
      orientation: "portrait",
      pageSize: "A4",
      fontSize: 12,
      includeHeaders: true,
      fitToPage: false,
      addGrid: true,
      headerColor: "#e5e7eb",
      textColor: "#000000",
      margin: 20,
      title: "Excel to PDF Conversion",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Excel to PDF Converter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Excel File (.xlsx, .xls)
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Conversion Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
            <select
              name="orientation"
              value={conversionSettings.orientation}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Size</label>
            <select
              name="pageSize"
              value={conversionSettings.pageSize}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
            <input
              type="number"
              name="fontSize"
              value={conversionSettings.fontSize}
              onChange={handleSettingsChange}
              min="8"
              max="20"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Margin (pt)</label>
            <input
              type="number"
              name="margin"
              value={conversionSettings.margin}
              onChange={handleSettingsChange}
              min="10"
              max="50"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Header Color</label>
            <input
              type="color"
              name="headerColor"
              value={conversionSettings.headerColor}
              onChange={handleSettingsChange}
              className="w-full h-10 border rounded-md cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
            <input
              type="color"
              name="textColor"
              value={conversionSettings.textColor}
              onChange={handleSettingsChange}
              className="w-full h-10 border rounded-md cursor-pointer"
            />
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Title</label>
            <input
              type="text"
              name="title"
              value={conversionSettings.title}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter PDF title"
            />
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeHeaders"
                checked={conversionSettings.includeHeaders}
                onChange={handleSettingsChange}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Include Headers</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="fitToPage"
                checked={conversionSettings.fitToPage}
                onChange={handleSettingsChange}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Fit to Page</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="addGrid"
                checked={conversionSettings.addGrid}
                onChange={handleSettingsChange}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Add Grid</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        {data.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Data Preview</h2>
            <div className="max-h-64 overflow-auto border rounded-lg p-4 bg-gray-50">
              <table className="w-full text-sm">
                {conversionSettings.includeHeaders && (
                  <thead>
                    <tr style={{ backgroundColor: conversionSettings.headerColor }}>
                      {Object.keys(data[0]).map((header, index) => (
                        <th key={index} className="p-2 border" style={{ color: conversionSettings.textColor }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {data.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="p-2 border" style={{ color: conversionSettings.textColor }}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 5 && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing 5 of {data.length} rows
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={convertToPDF}
            disabled={!file || isProcessing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" />
            {isProcessing ? "Converting..." : "Convert to PDF"}
          </button>
          <button
            onClick={reset}
            disabled={isProcessing}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Custom page orientation and size</li>
            <li>Adjustable font size and margins</li>
            <li>Custom header and text colors</li>
            <li>Customizable title</li>
            <li>Data preview with styling</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExcelToPDF;