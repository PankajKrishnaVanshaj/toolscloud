"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument } from "pdf-lib"; 
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { FaDownload, FaSync, FaUpload, FaTrash } from "react-icons/fa";

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFCropper = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const [cropSettings, setCropSettings] = useState({
    applyToAll: false,
    units: "px",
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    quality: 1, // 0.1 to 1
  });
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setCurrentPage(1);
      setCropArea({ x: 0, y: 0, width: 0, height: 0 });
      setIsProcessing(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const onPageLoadSuccess = (page) =>
    setPageDimensions({ width: page.originalWidth, height: page.originalHeight });

  const handleMouseDown = (e) => {
    const rect = e.target.getBoundingClientRect();
    setCropArea({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: 0,
      height: 0,
    });
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const rect = e.target.getBoundingClientRect();
      const newWidth = e.clientX - rect.left - cropArea.x;
      const newHeight = e.clientY - rect.top - cropArea.y;

      setCropArea((prev) => ({
        ...prev,
        width: Math.max(0, Math.min(newWidth, pageDimensions.width - prev.x)),
        height: Math.max(0, Math.min(newHeight, pageDimensions.height - prev.y)),
      }));
    },
    [isDragging, cropArea.x, cropArea.y, pageDimensions]
  );

  const handleMouseUp = () => setIsDragging(false);

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name in cropSettings.margins) {
      setCropSettings((prev) => ({
        ...prev,
        margins: { ...prev.margins, [name]: Number(value) },
      }));
    } else {
      setCropSettings((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
      }));
    }
  };

  const cropPDF = async () => {
    if (!file || (!cropArea.width && !Object.values(cropSettings.margins).some((m) => m > 0))) return;

    setIsProcessing(true);
    try {
      // Load the existing PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      for (let i = 1; i <= numPages; i++) {
        const [page] = await newPdf.copyPages(pdfDoc, [i - 1]);
        const { width: origWidth, height: origHeight } = page.getSize();

        const [x, y, width, height] =
          cropSettings.applyToAll || i === currentPage
            ? [
                cropArea.x + cropSettings.margins.left,
                cropArea.y + cropSettings.margins.top,
                cropArea.width || origWidth - (cropSettings.margins.left + cropSettings.margins.right),
                cropArea.height || origHeight - (cropSettings.margins.top + cropSettings.margins.bottom),
              ]
            : [0, 0, origWidth, origHeight];

        // Adjust for PDF coordinate system (bottom-left origin)
        const cropY = origHeight - (y + height); // Convert to bottom-left origin

        page.setCropBox(x, cropY, width, height);
        page.setSize(width, height); // Update page size to cropped dimensions
        newPdf.addPage(page);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cropped_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Cropping failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setNumPages(null);
    setCurrentPage(1);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    setCropSettings({
      applyToAll: false,
      units: "px",
      margins: { top: 0, right: 0, bottom: 0, left: 0 },
      quality: 1,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Cropper</h1>

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

        {file && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Preview Area */}
            <div className="lg:col-span-3 relative">
              <div
                className="relative overflow-auto max-h-[70vh] bg-gray-50 rounded-lg"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                  <Page
                    pageNumber={currentPage}
                    onLoadSuccess={onPageLoadSuccess}
                    onMouseDown={handleMouseDown}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
                {cropArea.width > 0 && cropArea.height > 0 && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-200/20 pointer-events-none"
                    style={{ left: cropArea.x, top: cropArea.y, width: cropArea.width, height: cropArea.height }}
                  />
                )}
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || isProcessing}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {numPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage === numPages || isProcessing}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Crop Settings</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="applyToAll"
                    checked={cropSettings.applyToAll}
                    onChange={handleSettingsChange}
                    disabled={isProcessing}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Apply to all pages</span>
                </label>
                <select
                  name="units"
                  value={cropSettings.units}
                  onChange={handleSettingsChange}
                  disabled={isProcessing}
                  className="mt-2 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                >
                  <option value="px">Pixels</option>
                  <option value="in">Inches</option>
                  <option value="cm">Centimeters</option>
                </select>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Margins ({cropSettings.units})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {["top", "right", "bottom", "left"].map((side) => (
                    <div key={side}>
                      <label className="block text-xs capitalize text-gray-600">{side}</label>
                      <input
                        type="number"
                        name={side}
                        value={cropSettings.margins[side]}
                        onChange={handleSettingsChange}
                        min="0"
                        disabled={isProcessing}
                        className="w-full p-1 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Output Quality</h4>
                <input
                  type="range"
                  name="quality"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={cropSettings.quality}
                  onChange={handleSettingsChange}
                  disabled={isProcessing}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-xs text-gray-600">{(cropSettings.quality * 100).toFixed(0)}%</span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Crop Area ({cropSettings.units})</h4>
                <p className="text-xs text-gray-600">
                  X: {cropArea.x.toFixed(0)}, Y: {cropArea.y.toFixed(0)} <br />
                  W: {cropArea.width.toFixed(0)}, H: {cropArea.height.toFixed(0)}
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={cropPDF}
                  disabled={isProcessing}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  {isProcessing ? "Processing..." : "Crop and Download"}
                </button>
                <button
                  onClick={reset}
                  disabled={isProcessing}
                  className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {!file && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to start cropping</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Drag-to-crop interface</li>
            <li>Apply crop to single page or all pages</li>
            <li>Custom margins in pixels, inches, or centimeters</li>
            <li>Adjustable output quality</li>
            <li>Page navigation and preview</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFCropper;