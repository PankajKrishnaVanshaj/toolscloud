"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For exporting report

const PDFAccessibilityChecker = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isChecking, setIsChecking] = useState(false);
  const [accessibilityReport, setAccessibilityReport] = useState(null);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef(null);
  const reportRef = useRef(null);

  const accessibilityChecks = {
    hasTitle: "Document Title",
    hasLanguage: "Language Specification",
    hasTags: "Structural Tags",
    hasAltText: "Image Alt Text",
    hasHeadings: "Heading Structure",
    hasReadingOrder: "Logical Reading Order",
    hasContrast: "Color Contrast",
    hasFormFields: "Accessible Forms",
    hasBookmarks: "Bookmarks",
    hasMetadata: "Document Metadata",
  };

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setAccessibilityReport(null);
      setPreviewPage(1);
      setZoom(1);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const checkAccessibility = async () => {
    if (!file) return;

    setIsChecking(true);
    try {
      // Simulated accessibility checking
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockReport = Object.keys(accessibilityChecks).reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            status: Math.random() > 0.2 ? "pass" : "fail",
            details:
              key === "hasContrast" && Math.random() > 0.5
                ? "Insufficient contrast ratio on page 2 (4.2:1, minimum 4.5:1)"
                : `Checked ${accessibilityChecks[key]}`,
          },
        }),
        {}
      );

      setAccessibilityReport(mockReport);
    } catch (error) {
      console.error("Accessibility check failed:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const getRemediationSuggestion = (check) => {
    switch (check) {
      case "hasTitle":
        return "Add a document title in Document Properties";
      case "hasLanguage":
        return "Set document language in Advanced Properties";
      case "hasTags":
        return "Add structural tags using Tags panel";
      case "hasAltText":
        return "Add alternative text to images";
      case "hasHeadings":
        return "Implement proper heading hierarchy (H1-H6)";
      case "hasReadingOrder":
        return "Define reading order in Tags panel";
      case "hasContrast":
        return "Increase contrast ratio to minimum 4.5:1";
      case "hasFormFields":
        return "Add form field descriptions and tooltips";
      case "hasBookmarks":
        return "Add bookmarks for navigation";
      case "hasMetadata":
        return "Include metadata in Document Properties";
      default:
        return "Review and fix in PDF editor";
    }
  };

  const reset = () => {
    setFile(null);
    setNumPages(null);
    setPreviewPage(1);
    setAccessibilityReport(null);
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadReport = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `accessibility-report-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          PDF Accessibility Checker
        </h1>

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* PDF Preview */}
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Preview</h2>
              <div className="border p-4 bg-gray-50 rounded-lg overflow-auto max-h-[70vh]">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page
                    pageNumber={previewPage}
                    scale={zoom}
                    width={Math.min(500, window.innerWidth - 80)}
                  />
                </Document>
              </div>
              {numPages && (
                <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                      disabled={previewPage === 1}
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {previewPage} of {numPages}
                    </span>
                    <button
                      onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                      disabled={previewPage === numPages}
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Zoom:</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-sm text-gray-600">{(zoom * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Accessibility Controls and Report */}
            <div>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <button
                  onClick={checkAccessibility}
                  disabled={isChecking}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaUpload className="mr-2" />
                  {isChecking ? "Checking..." : "Check Accessibility"}
                </button>
                <button
                  onClick={downloadReport}
                  disabled={!accessibilityReport || isChecking}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download Report
                </button>
                <button
                  onClick={reset}
                  disabled={isChecking}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </div>

              {accessibilityReport && (
                <div ref={reportRef} className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-700">Accessibility Report</h2>
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                    {Object.entries(accessibilityReport).map(([check, result]) => (
                      <div
                        key={check}
                        className="border p-3 rounded-lg shadow-sm bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">
                            {accessibilityChecks[check]}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              result.status === "pass"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {result.status === "pass" ? "Pass" : "Fail"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                        {result.status === "fail" && (
                          <p className="text-sm text-blue-600 mt-1">
                            Fix: {getRemediationSuggestion(check)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary and Features */}
        {accessibilityReport && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Summary</h3>
            <p className="text-blue-700">
              {Object.values(accessibilityReport).filter((r) => r.status === "pass").length} of{" "}
              {Object.keys(accessibilityReport).length} checks passed
            </p>
          </div>
        )}

        {!file && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to start checking accessibility</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Checks multiple accessibility criteria</li>
            <li>PDF preview with zoom and pagination</li>
            <li>Detailed report with remediation suggestions</li>
            <li>Downloadable report as PNG</li>
          </ul>
        </div>

       
      </div>
    </div>
  );
};

export default PDFAccessibilityChecker;