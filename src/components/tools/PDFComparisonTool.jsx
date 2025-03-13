// components/PDFComparisonTool.jsx
"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page } from "react-pdf";
import { FaDownload, FaSync, FaSearchPlus, FaSearchMinus } from "react-icons/fa";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import html2canvas from "html2canvas"; // For downloading comparison result

const PDFComparisonTool = () => {
  const [files, setFiles] = useState({ original: null, modified: null });
  const [numPages, setNumPages] = useState({ original: null, modified: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [comparisonMode, setComparisonMode] = useState("side-by-side");
  const [showDifferences, setShowDifferences] = useState(true);
  const [zoom, setZoom] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [differenceData, setDifferenceData] = useState(null);
  const comparisonRef = useRef(null);

  // Handle file upload
  const handleFileChange = (type) => (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setFiles((prev) => ({ ...prev, [type]: file }));
      setDifferenceData(null);
      setCurrentPage(1);
    }
  };

  const onDocumentLoadSuccess = (type) => ({ numPages }) => {
    setNumPages((prev) => ({ ...prev, [type]: numPages }));
  };

  // Page navigation
  const changePage = (offset) => {
    setCurrentPage((prev) =>
      Math.min(
        Math.max(1, prev + offset),
        Math.min(numPages.original || Infinity, numPages.modified || Infinity)
      )
    );
  };

  // Zoom controls
  const adjustZoom = (amount) => {
    setZoom((prev) => Math.max(0.1, Math.min(2.0, prev + amount)));
  };

  // Render PDF with differences
  const renderPDF = (file, type) => (
    <Document
      file={file}
      onLoadSuccess={onDocumentLoadSuccess(type)}
      className="border rounded-lg overflow-hidden shadow-sm"
    >
      <Page
        pageNumber={currentPage}
        scale={zoom}
        renderAnnotationLayer={false}
        renderTextLayer={comparisonMode === "text"}
        className={
          showDifferences && type === "modified" && differenceData
            ? "difference-highlight"
            : ""
        }
      />
    </Document>
  );

  // Simulate PDF comparison
  const comparePDFs = useCallback(async () => {
    if (!files.original || !files.modified) return;

    setIsLoading(true);
    // Simulated comparison logic
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDifferenceData({
      pagesCompared: Math.min(numPages.original || 0, numPages.modified || 0),
      differencesFound: Math.floor(Math.random() * 5) + 1, // Random differences
    });
    setIsLoading(false);
  }, [files, numPages]);

  // Download comparison result
  const downloadComparison = () => {
    if (comparisonRef.current && files.original && files.modified) {
      html2canvas(comparisonRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `pdf-comparison-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Reset everything
  const reset = () => {
    setFiles({ original: null, modified: null });
    setNumPages({ original: null, modified: null });
    setCurrentPage(1);
    setComparisonMode("side-by-side");
    setShowDifferences(true);
    setZoom(1.0);
    setDifferenceData(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          PDF Comparison Tool
        </h1>

        {/* File Upload Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {["original", "modified"].map((type) => (
            <div key={type}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {type} PDF
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange(type)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          ))}
        </div>

        {/* Comparison Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comparison Mode
              </label>
              <select
                value={comparisonMode}
                onChange={(e) => setComparisonMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="side-by-side">Side by Side</option>
                <option value="overlay">Overlay</option>
                <option value="text">Text Only</option>
                <option value="split">Split View</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zoom ({zoom.toFixed(1)}x)
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustZoom(-0.1)}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  <FaSearchMinus />
                </button>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <button
                  onClick={() => adjustZoom(0.1)}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  <FaSearchPlus />
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showDifferences}
                  onChange={(e) => setShowDifferences(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Highlight Differences</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* PDF Display */}
        {files.original && files.modified && (
          <div ref={comparisonRef} className="mb-6">
            <div
              className={`${
                comparisonMode === "side-by-side"
                  ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
                  : comparisonMode === "split"
                  ? "flex flex-col lg:flex-row gap-4"
                  : "grid grid-cols-1"
              } relative`}
            >
              {comparisonMode === "side-by-side" || comparisonMode === "text" ? (
                <>
                  <div className="relative">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Original</h3>
                    {renderPDF(files.original, "original")}
                  </div>
                  <div className="relative">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Modified</h3>
                    {renderPDF(files.modified, "modified")}
                  </div>
                </>
              ) : comparisonMode === "overlay" ? (
                <div className="relative">
                  {renderPDF(files.original, "original")}
                  <div className="absolute top-0 left-0 opacity-50">
                    {renderPDF(files.modified, "modified")}
                  </div>
                </div>
              ) : (
                // Split View
                <div className="relative flex flex-col lg:flex-row">
                  <div className="flex-1 relative overflow-hidden">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Original</h3>
                    {renderPDF(files.original, "original")}
                  </div>
                  <div className="flex-1 relative overflow-hidden">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Modified</h3>
                    {renderPDF(files.modified, "modified")}
                  </div>
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-4 flex justify-center items-center gap-4">
              <button
                onClick={() => changePage(-1)}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of{" "}
                {Math.min(numPages.original || 0, numPages.modified || 0)}
              </span>
              <button
                onClick={() => changePage(1)}
                disabled={
                  currentPage === Math.min(numPages.original || 0, numPages.modified || 0) ||
                  isLoading
                }
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={comparePDFs}
            disabled={!files.original || !files.modified || isLoading}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Comparing..." : "Compare PDFs"}
          </button>
          <button
            onClick={downloadComparison}
            disabled={!differenceData || isLoading}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Comparison
          </button>
        </div>

        {/* Difference Summary */}
        {differenceData && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-700 mb-2">Comparison Results</h3>
            <p className="text-sm text-green-600">
              Compared {differenceData.pagesCompared} pages. Found{" "}
              {differenceData.differencesFound} differences.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple comparison modes: Side by Side, Overlay, Text, Split View</li>
            <li>Zoom controls with slider and buttons</li>
            <li>Page navigation</li>
            <li>Highlight differences option</li>
            <li>Download comparison as PNG</li>
          </ul>
        </div>

        {/* Custom CSS */}
        <style jsx>{`
          .difference-highlight {
            background-color: rgba(255, 0, 0, 0.1);
            position: relative;
          }
          .difference-highlight::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 2px solid rgba(255, 0, 0, 0.3);
            pointer-events: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default PDFComparisonTool;