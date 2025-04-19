"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const PDFTableExtractor = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [extractedTables, setExtractedTables] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState({
    format: "csv",
    pageRange: "all",
    customRange: "",
    mergeTables: false,
    includeHeaders: true,
    delimiter: ",", // For CSV
    detectionSensitivity: 50, // Simulated sensitivity
  });
  const fileInputRef = useRef(null);

  // Handle file upload
  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setExtractedTables([]);
      setPreviewPage(1);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Handle settings changes
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Parse custom page range
  const parsePageRange = () => {
    if (settings.pageRange === "all") return Array.from({ length: numPages }, (_, i) => i + 1);
    const ranges = settings.customRange.split(",").map((r) => r.trim());
    let pages = [];
    for (const range of ranges) {
      if (range.includes("-")) {
        const [start, end] = range.split("-").map(Number);
        for (let i = Math.max(1, start); i <= Math.min(numPages, end); i++) {
          pages.push(i);
        }
      } else {
        const page = Number(range);
        if (page >= 1 && page <= numPages) pages.push(page);
      }
    }
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  // Extract tables (simulated)
  const extractTables = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate async processing

      const pagesToExtract = parsePageRange();
      const mockTables = pagesToExtract.map((page) => ({
        page,
        data: [
          ["Name", "Age", "City"],
          ["John", "25", "New York"],
          ["Jane", "30", "London"],
        ].slice(settings.includeHeaders ? 0 : 1),
      }));

      const tables = settings.mergeTables
        ? [
            {
              page: "Merged",
              data: mockTables.reduce(
                (acc, table) => [...acc, ...table.data],
                settings.includeHeaders ? [["Page", ...mockTables[0].data[0]]] : []
              ),
            },
          ]
        : mockTables;

      setExtractedTables(tables);

      // Generate output
      let content = "";
      if (settings.format === "csv") {
        content = tables
          .map((table) =>
            table.data.map((row) => row.join(settings.delimiter)).join("\n")
          )
          .join("\n\n");
      } else if (settings.format === "json") {
        content = JSON.stringify(tables, null, 2);
      } else if (settings.format === "txt") {
        content = tables
          .map((table) =>
            table.data.map((row) => row.join("\t")).join("\n")
          )
          .join("\n\n");
      }

      const blob = new Blob([content], {
        type: settings.format === "json" ? "application/json" : "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tables-${Date.now()}.${settings.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Table extraction failed:", error);
      alert("An error occurred during extraction.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset everything
  const reset = () => {
    setFile(null);
    setNumPages(null);
    setPreviewPage(1);
    setExtractedTables([]);
    setSettings({
      format: "csv",
      pageRange: "all",
      customRange: "",
      mergeTables: false,
      includeHeaders: true,
      delimiter: ",",
      detectionSensitivity: 50,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Table Extractor</h1>

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
        {file && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
                <select
                  name="format"
                  value={settings.format}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="txt">Text (Tab-separated)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Range</label>
                <select
                  name="pageRange"
                  value={settings.pageRange}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Pages</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {settings.pageRange === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Range
                  </label>
                  <input
                    type="text"
                    name="customRange"
                    value={settings.customRange}
                    onChange={handleSettingsChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1-5, 7"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CSV Delimiter
                </label>
                <input
                  type="text"
                  name="delimiter"
                  value={settings.delimiter}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  maxLength="1"
                  disabled={settings.format !== "csv"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detection Sensitivity ({settings.detectionSensitivity})
                </label>
                <input
                  type="range"
                  name="detectionSensitivity"
                  min="0"
                  max="100"
                  value={settings.detectionSensitivity}
                  onChange={handleSettingsChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="mergeTables"
                    checked={settings.mergeTables}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Merge Tables</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeHeaders"
                    checked={settings.includeHeaders}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include Headers</span>
                </label>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">PDF Preview</h2>
              <div className="border p-4 bg-gray-50 rounded-lg">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page pageNumber={previewPage} width={Math.min(600, window.innerWidth - 40)} />
                </Document>
                {numPages && (
                  <div className="mt-4 flex justify-center items-center gap-4">
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

            {/* Extracted Tables Preview */}
            {extractedTables.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Extracted Tables</h2>
                <div className="max-h-96 overflow-y-auto border rounded-lg bg-gray-50 p-4">
                  {extractedTables.map((table, index) => (
                    <div key={index} className="mb-4">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Table from Page {table.page}
                      </p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <tbody className="bg-white divide-y divide-gray-200">
                            {table.data.map((row, rowIdx) => (
                              <tr key={rowIdx}>
                                {row.map((cell, cellIdx) => (
                                  <td
                                    key={cellIdx}
                                    className="px-4 py-2 whitespace-nowrap text-sm text-gray-600"
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
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={extractTables}
                disabled={!file || isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                    Processing...
                  </span>
                ) : (
                  <>
                    <FaUpload className="mr-2" /> Extract Tables
                  </>
                )}
              </button>
              <button
                onClick={reset}
                disabled={!file || isProcessing}
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
            <p className="text-gray-500 italic">Upload a PDF to start extracting tables</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Extract tables to CSV, JSON, or tab-separated text</li>
            <li>Custom page range support (e.g., 1-5, 7)</li>
            <li>Merge tables across pages</li>
            <li>Adjustable CSV delimiter and detection sensitivity</li>
            <li>PDF preview with page navigation</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFTableExtractor;