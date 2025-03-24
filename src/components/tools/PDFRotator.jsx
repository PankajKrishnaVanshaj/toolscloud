// app/components/PDFRotator.jsx
"use client";
import React, { useState, useRef, useCallback } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { PDFDocument } from "pdf-lib"; // For actual PDF manipulation
import { FaDownload, FaSync, FaUpload, FaTrash } from "react-icons/fa";

const PDFRotator = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotations, setRotations] = useState({});
  const [bulkRotation, setBulkRotation] = useState(0);
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setRotations({});
      setBulkRotation(0);
      setPreviewPage(1);
      setNumPages(null);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const rotatePage = (pageNumber, degrees) => {
    setRotations((prev) => ({
      ...prev,
      [pageNumber]: ((prev[pageNumber] || 0) + degrees) % 360,
    }));
  };

  const rotateAllPages = (degrees) => {
    setBulkRotation((prev) => (prev + degrees) % 360);
    setRotations({});
  };

  const getPageRotation = (pageNumber) => {
    return (rotations[pageNumber] || 0) + bulkRotation;
  };

  const resetRotations = () => {
    setRotations({});
    setBulkRotation(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFile(null);
    setPreviewPage(1);
    setNumPages(null);
  };

  const saveRotatedPDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      // Load the original PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Rotate pages according to the state
      const pages = pdfDoc.getPages();
      pages.forEach((page, index) => {
        const pageNumber = index + 1;
        const rotation = getPageRotation(pageNumber);
        page.setRotation((page.getRotation().angle + rotation) % 360);
      });

      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rotated_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Rotation failed:", error);
      alert("Failed to save rotated PDF. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Rotator</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF File
          </label>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {file && (
          <div className="space-y-6">
            {/* Rotation Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Rotate All Pages</p>
                <div className="flex flex-wrap gap-2">
                  {[-90, 90, 180].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => rotateAllPages(deg)}
                      disabled={isProcessing}
                      className="flex-1 min-w-[80px] py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {deg > 0 ? "+" : ""}{deg}°
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Rotate Current Page</p>
                <div className="flex flex-wrap gap-2">
                  {[-90, 90, 180].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => rotatePage(previewPage, deg)}
                      disabled={isProcessing}
                      className="flex-1 min-w-[80px] py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {deg > 0 ? "+" : ""}{deg}°
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div className="relative border p-4 bg-gray-50 rounded-lg">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page
                    pageNumber={previewPage}
                    width={Math.min(600, window.innerWidth - 40)} // Responsive width
                    rotate={getPageRotation(previewPage)}
                  />
                </Document>
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                {numPages && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                      disabled={previewPage === 1 || isProcessing}
                      className="px-3 py-1 bg-gray-200 rounded-l-md hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-4 text-sm text-gray-700">
                      Page {previewPage} of {numPages} (Rotated: {getPageRotation(previewPage)}°)
                    </span>
                    <button
                      onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                      disabled={previewPage === numPages || isProcessing}
                      className="px-3 py-1 bg-gray-200 rounded-r-md hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={saveRotatedPDF}
                disabled={!file || isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                {isProcessing ? "Processing..." : "Save Rotated PDF"}
              </button>
              <button
                onClick={resetRotations}
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
            <p className="text-gray-500 italic">Upload a PDF to start rotating</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Rotate individual pages or all pages</li>
            <li>Preview with navigation</li>
            <li>Save rotated PDF with actual page rotation</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Processing indicator</li>
            <li>Reset functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFRotator;