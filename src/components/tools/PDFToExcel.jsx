"use client";
import React, { useState, useRef, useCallback } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
// Note: For real conversion, install pdf-parse and xlsx: npm install pdf-parse xlsx

const PDFToExcel = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSettings, setConversionSettings] = useState({
    pageRange: "all",
    customRange: "",
    detectTables: true,
    mergeTables: false,
    outputFormat: "xlsx",
    includeFormatting: true,
    headerRow: true,
    delimiter: ",", // For CSV
  });
  const [previewData, setPreviewData] = useState(null);
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setPreviewData(null);
      setPreviewPage(1);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConversionSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateCustomRange = (range) => {
    if (!range) return { start: 1, end: numPages };
    const pages = range.split(",").flatMap((r) => {
      const [start, end] = r.split("-").map(Number);
      return end ? Array.from({ length: end - start + 1 }, (_, i) => start + i) : [start];
    });
    return {
      start: Math.max(1, Math.min(...pages)),
      end: Math.min(numPages, Math.max(...pages)),
    };
  };

  const convertToExcel = useCallback(async () => {
    if (!file) return;

    setIsConverting(true);
    try {
      // Simulate PDF parsing and table extraction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Sample data simulation (replace with real pdf-parse/xlsx logic)
      const sampleData = [
        conversionSettings.headerRow ? ["Name", "Age", "City"] : ["Row 1", "Row 1", "Row 1"],
        ["John", "30", "New York"],
        ["Jane", "25", "Los Angeles"],
        ["Bob", "35", "Chicago"],
      ];

      setPreviewData(sampleData);

      // Generate and download file
      let blob;
      if (conversionSettings.outputFormat === "xlsx") {
        // For real XLSX, use xlsx library
        blob = new Blob([JSON.stringify(sampleData)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        // CSV output
        const csvContent = sampleData.map((row) => row.join(conversionSettings.delimiter)).join("\n");
        blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `converted_${file.name.split(".")[0]}.${conversionSettings.outputFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("An error occurred during conversion.");
    } finally {
      setIsConverting(false);
    }
  }, [file, conversionSettings, numPages]);

  const reset = () => {
    setFile(null);
    setNumPages(null);
    setPreviewPage(1);
    setPreviewData(null);
    setIsConverting(false);
    setConversionSettings({
      pageRange: "all",
      customRange: "",
      detectTables: true,
      mergeTables: false,
      outputFormat: "xlsx",
      includeFormatting: true,
      headerRow: true,
      delimiter: ",",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF to Excel Converter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF File</label>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>

        {file && (
          <div className="space-y-6">
            {/* Conversion Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Range</label>
                <select
                  name="pageRange"
                  value={conversionSettings.pageRange}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
                  disabled={isConverting}
                >
                  <option value="all">All Pages</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {conversionSettings.pageRange === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Range (e.g., 1-5, 7)
                  </label>
                  <input
                    type="text"
                    name="customRange"
                    value={conversionSettings.customRange}
                    onChange={handleSettingsChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 1-5, 7"
                    disabled={isConverting}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
                <select
                  name="outputFormat"
                  value={conversionSettings.outputFormat}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
                  disabled={isConverting}
                >
                  <option value="xlsx">XLSX (Excel)</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              {conversionSettings.outputFormat === "csv" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delimiter</label>
                  <select
                    name="delimiter"
                    value={conversionSettings.delimiter}
                    onChange={handleSettingsChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
                    disabled={isConverting}
                  >
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="\t">Tab</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="detectTables"
                    checked={conversionSettings.detectTables}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-green-500"
                    disabled={isConverting}
                  />
                  <span className="text-sm text-gray-700">Detect Tables</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="mergeTables"
                    checked={conversionSettings.mergeTables}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-green-500"
                    disabled={isConverting}
                  />
                  <span className="text-sm text-gray-700">Merge Tables</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeFormatting"
                    checked={conversionSettings.includeFormatting}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-green-500"
                    disabled={isConverting}
                  />
                  <span className="text-sm text-gray-700">Include Formatting</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="headerRow"
                    checked={conversionSettings.headerRow}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-green-500"
                    disabled={isConverting}
                  />
                  <span className="text-sm text-gray-700">First Row as Header</span>
                </label>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">PDF Preview</h2>
              <div className="border p-4 bg-gray-50 rounded-lg relative">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page pageNumber={previewPage} width={Math.min(400, window.innerWidth - 80)} />
                </Document>
                {numPages && (
                  <div className="mt-2 flex justify-center gap-2">
                    <button
                      onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                      disabled={previewPage === 1 || isConverting}
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-1 text-gray-700">
                      Page {previewPage} of {numPages}
                    </span>
                    <button
                      onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                      disabled={previewPage === numPages || isConverting}
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Excel Preview */}
            {previewData && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Excel Preview</h2>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody>
                      {previewData.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={rowIndex === 0 && conversionSettings.headerRow ? "bg-gray-100 font-semibold" : ""}
                        >
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-4 py-2 border text-sm text-gray-700 whitespace-nowrap"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={convertToExcel}
                disabled={!file || isConverting}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isConverting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.2" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Converting...
                  </span>
                ) : (
                  <>
                    <FaDownload className="mr-2" /> Convert and Download
                  </>
                )}
              </button>
              <button
                onClick={reset}
                disabled={isConverting}
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
            <p className="text-gray-500 italic">Upload a PDF file to start</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Convert PDF to Excel (XLSX) or CSV</li>
            <li>Custom page range selection</li>
            <li>Table detection and merging options</li>
            <li>CSV delimiter customization</li>
            <li>Preview PDF and converted data</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Header row support</li>
          </ul>
        </div>

        {/* Note */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> This is a simulation. For accurate conversion, integrate with libraries like pdf-parse and xlsx.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFToExcel;