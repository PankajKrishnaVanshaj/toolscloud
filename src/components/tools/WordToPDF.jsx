"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaUpload, FaDownload, FaSync } from "react-icons/fa";

const WordToPDF = () => {
  const [file, setFile] = useState(null);
  const [convertedPDF, setConvertedPDF] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSettings, setConversionSettings] = useState({
    includeComments: true,
    includeTrackChanges: false,
    pageOrientation: "portrait",
    pageSize: "A4",
    margins: "normal", // Added margin option
    fontSize: "12",   // Added font size option
    passwordProtect: false,
    password: "",
  });
  const fileInputRef = useRef(null);

  const acceptedFileTypes = [
    ".doc",
    ".docx",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (
      selectedFile &&
      (acceptedFileTypes.includes(selectedFile.type) ||
        acceptedFileTypes.some((ext) => selectedFile.name.endsWith(ext)))
    ) {
      setFile(selectedFile);
      setConvertedPDF(null);
      setNumPages(null);
      setPreviewPage(1);
    } else {
      alert("Please upload a valid Word document (.doc or .docx)");
    }
  }, []);

  const onPDFLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConversionSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const convertToPDF = async () => {
    if (!file) return;

    setIsConverting(true);
    try {
      // Simulated conversion (replace with actual backend service in production)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const blob = await file.arrayBuffer();
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      setConvertedPDF(pdfUrl);

      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${file.name.split(".")[0]}_converted.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("Error converting file. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setConvertedPDF(null);
    setNumPages(null);
    setPreviewPage(1);
    setConversionSettings({
      includeComments: true,
      includeTrackChanges: false,
      pageOrientation: "portrait",
      pageSize: "A4",
      margins: "normal",
      fontSize: "12",
      passwordProtect: false,
      password: "",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Word to PDF Converter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Word Document
          </label>
          <input
            type="file"
            accept=".doc,.docx"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Uploaded: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Conversion Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Orientation</label>
            <select
              name="pageOrientation"
              value={conversionSettings.pageOrientation}
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
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
              <option value="A3">A3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Margins</label>
            <select
              name="margins"
              value={conversionSettings.margins}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal (1 inch)</option>
              <option value="narrow">Narrow (0.5 inch)</option>
              <option value="wide">Wide (1.5 inch)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Size (pt)</label>
            <input
              type="number"
              name="fontSize"
              value={conversionSettings.fontSize}
              onChange={handleSettingsChange}
              min="8"
              max="72"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeComments"
                checked={conversionSettings.includeComments}
                onChange={handleSettingsChange}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Include Comments</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeTrackChanges"
                checked={conversionSettings.includeTrackChanges}
                onChange={handleSettingsChange}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Include Track Changes</span>
            </label>
          </div>

          <div>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                name="passwordProtect"
                checked={conversionSettings.passwordProtect}
                onChange={handleSettingsChange}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Password Protect</span>
            </label>
            {conversionSettings.passwordProtect && (
              <input
                type="password"
                name="password"
                value={conversionSettings.password}
                onChange={handleSettingsChange}
                placeholder="Enter password"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        {/* Preview */}
        {convertedPDF && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">PDF Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-lg shadow-inner">
              <Document
                file={convertedPDF}
                onLoadSuccess={onPDFLoadSuccess}
                className="flex justify-center"
              >
                <Page
                  pageNumber={previewPage}
                  width={Math.min(600, window.innerWidth - 80)} // Responsive width
                  renderTextLayer={false} // Optional: improve performance
                  renderAnnotationLayer={false}
                />
              </Document>
              {numPages && (
                <div className="mt-4 flex justify-center items-center gap-4">
                  <button
                    onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                    disabled={previewPage === 1 || isConverting}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {previewPage} of {numPages}
                  </span>
                  <button
                    onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                    disabled={previewPage === numPages || isConverting}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
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
            onClick={convertToPDF}
            disabled={!file || isConverting}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaUpload className="mr-2" />
            {isConverting ? "Converting..." : "Convert to PDF"}
          </button>
          <button
            onClick={reset}
            disabled={isConverting}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert .doc/.docx to PDF</li>
            <li>Customizable page orientation, size, and margins</li>
            <li>Adjustable font size</li>
            <li>Include/exclude comments and track changes</li>
            <li>Password protection option</li>
            <li>PDF preview with page navigation</li>
            <li>Responsive design</li>
          </ul>
        </div>

        {/* Note */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> This is a simulation. For actual conversion, integrate with a backend service (e.g., LibreOffice, Aspose.Words).
          </p>
        </div>
      </div>
    </div>
  );
};

export default WordToPDF;