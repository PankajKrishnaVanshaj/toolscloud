"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { FaDownload, FaSync, FaUpload, FaTrash } from "react-icons/fa";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFFormFiller = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formFields, setFormFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef(null);

  // Handle file upload
  const onFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      detectFormFields(selectedFile);
      setCurrentPage(1);
      setZoom(1);
    }
  };

  // Simulate form field detection (mock implementation)
  const detectFormFields = useCallback(async (pdfFile) => {
    setIsProcessing(true);
    try {
      // Mock fields - replace with actual PDF parsing in production
      const mockFields = [
        { id: "name", type: "text", page: 1, x: 100, y: 100, width: 200, height: 30, value: "" },
        { id: "email", type: "text", page: 1, x: 100, y: 150, width: 200, height: 30, value: "" },
        { id: "agree", type: "checkbox", page: 1, x: 100, y: 200, width: 20, height: 20, value: false },
        { id: "date", type: "text", page: 1, x: 100, y: 250, width: 150, height: 30, value: "" },
      ];
      setFormFields(mockFields);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Update field value
  const updateFieldValue = (fieldId, value) => {
    setFormFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, value } : field
      )
    );
  };

  // Clear all fields and reset
  const reset = () => {
    setFile(null);
    setFormFields([]);
    setSelectedField(null);
    setCurrentPage(1);
    setNumPages(null);
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Generate filled PDF (simulation)
  const generateFilledPDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      // Simulate PDF generation (replace with pdf-lib in production)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `filled_${file.name}`;
      link.click();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete selected field
  const deleteField = () => {
    if (selectedField) {
      setFormFields((prev) => prev.filter((field) => field.id !== selectedField.id));
      setSelectedField(null);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
        {/* Left Panel - Form Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1 h-fit sticky top-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">PDF Form Filler</h1>

          {/* File Upload */}
          <div className="mb-6">
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={onFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Form Fields List */}
          {formFields.length > 0 && (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-gray-700">Form Fields</h2>
              {formFields.map((field) => (
                <div
                  key={field.id}
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedField?.id === field.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedField(field)}
                >
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {field.id}
                  </label>
                  {field.type === "text" ? (
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateFieldValue(field.id, e.target.value)}
                      className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => updateFieldValue(field.id, e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {file && (
            <div className="mt-6 space-y-4">
              <button
                onClick={generateFilledPDF}
                disabled={isProcessing}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                {isProcessing ? "Processing..." : "Generate Filled PDF"}
              </button>
              <button
                onClick={deleteField}
                disabled={!selectedField || isProcessing}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaTrash className="mr-2" /> Delete Selected Field
              </button>
              <button
                onClick={reset}
                disabled={isProcessing}
                className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          )}

          {/* Features */}
          {file && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
              <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
                <li>Fill text and checkbox fields</li>
                <li>Zoom and pagination controls</li>
                <li>Delete unwanted fields</li>
                <li>Download filled PDF</li>
                <li>Responsive design</li>
              </ul>
            </div>
          )}
        </div>

        {/* Right Panel - PDF Preview */}
        {file ? (
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <h2 className="text-lg font-semibold text-gray-700">Preview</h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isProcessing}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm">
                    Page {currentPage} of {numPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(numPages, prev + 1))}
                    disabled={currentPage === numPages || isProcessing}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Zoom:</label>
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
            </div>

            <div className="relative overflow-auto max-h-[80vh]">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="relative"
                loading={<div className="text-center p-4">Loading PDF...</div>}
              >
                <Page
                  pageNumber={currentPage}
                  scale={zoom}
                  width={700}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
                {/* Render form field overlays */}
                {formFields
                  .filter((field) => field.page === currentPage)
                  .map((field) => (
                    <div
                      key={field.id}
                      className={`absolute border-2 cursor-pointer ${
                        selectedField?.id === field.id
                          ? "border-blue-500 bg-blue-100/20"
                          : "border-dashed border-gray-400"
                      }`}
                      style={{
                        left: field.x * zoom,
                        top: field.y * zoom,
                        width: field.width * zoom,
                        height: field.height * zoom,
                      }}
                      onClick={() => setSelectedField(field)}
                    >
                      {field.type === "text" && (
                        <div
                          className="p-1 bg-white/80 text-sm overflow-hidden"
                          style={{ height: "100%" }}
                        >
                          {field.value || "Enter text"}
                        </div>
                      )}
                      {field.type === "checkbox" && (
                        <input
                          type="checkbox"
                          checked={field.value}
                          readOnly
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  ))}
              </Document>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-gray-500 italic">Upload a PDF to start filling forms</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFFormFiller;