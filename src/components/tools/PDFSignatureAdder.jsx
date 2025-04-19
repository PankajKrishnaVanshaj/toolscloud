"use client";
import React, { useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument } from "pdf-lib"; // For actual PDF modification
import { FaDownload, FaSync, FaUpload, FaTrash } from "react-icons/fa";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFSignatureAdder = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [signature, setSignature] = useState(null);
  const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSize, setSignatureSize] = useState(150);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const signatureInputRef = useRef(null);

  // File handling
  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setCurrentPage(1);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Signature upload
  const onSignatureUpload = useCallback((event) => {
    const sigFile = event.target.files[0];
    if (sigFile && sigFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setSignature(e.target.result);
      reader.readAsDataURL(sigFile);
    }
  }, []);

  // Drawing signature
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    setSignature(canvas.toDataURL("image/png"));
  };

  // Clear drawing canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  // Signature positioning
  const handleSignatureDrag = (e) => {
    e.preventDefault();
    setSignaturePosition({
      x: e.nativeEvent.offsetX - signatureSize / 2,
      y: e.nativeEvent.offsetY - signatureSize / 2,
    });
  };

  // Add signature to PDF and download
  const addSignatureToPDF = async () => {
    if (!file || !signature) return;

    setIsProcessing(true);
    try {
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPage(currentPage - 1); // 0-based index

      const sigImg = await fetch(signature).then((res) => res.arrayBuffer());
      const sigImage = await pdfDoc.embedPng(sigImg);

      const { width, height } = page.getSize();
      const sigWidth = signatureSize;
      const sigHeight = (sigImage.height / sigImage.width) * sigWidth;

      // Adjust Y-coordinate to match PDF coordinate system (bottom-up)
      const pdfY = height - signaturePosition.y - sigHeight;

      page.drawImage(sigImage, {
        x: signaturePosition.x,
        y: pdfY,
        width: sigWidth,
        height: sigHeight,
      });

      const pdfBytesSigned = await pdfDoc.save();
      const blob = new Blob([pdfBytesSigned], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `signed_${file.name}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error adding signature:", error);
      alert("Failed to add signature. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset everything
  const reset = () => {
    setFile(null);
    setSignature(null);
    setNumPages(null);
    setCurrentPage(1);
    setSignaturePosition({ x: 0, y: 0 });
    setSignatureSize(150);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (signatureInputRef.current) signatureInputRef.current.value = "";
    clearCanvas();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Signature Adder</h1>

        {/* File Upload */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF</label>
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={onFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Signature</label>
            <input
              type="file"
              accept="image/*"
              ref={signatureInputRef}
              onChange={onSignatureUpload}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {/* Signature Drawing */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Or Draw Signature</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <canvas
              ref={canvasRef}
              width={300}
              height={150}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              className="border border-gray-300 rounded-md bg-white"
            />
            <button
              onClick={clearCanvas}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaTrash className="mr-2" /> Clear
            </button>
          </div>
        </div>

        {/* Signature Settings */}
        {signature && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature Size ({signatureSize}px)
              </label>
              <input
                type="range"
                min="50"
                max="300"
                value={signatureSize}
                onChange={(e) => setSignatureSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        )}

        {/* PDF Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Preview</h2>
            <div className="relative border p-4 bg-gray-50 rounded-lg">
              <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="flex justify-center">
                <div
                  onMouseMove={signature ? handleSignatureDrag : undefined}
                  className="relative"
                >
                  <Page pageNumber={currentPage} width={Math.min(600, window.innerWidth - 40)} />
                  {signature && (
                    <img
                      src={signature}
                      alt="Signature"
                      className="absolute pointer-events-none"
                      style={{
                        left: signaturePosition.x,
                        top: signaturePosition.y,
                        width: signatureSize,
                        height: "auto",
                        opacity: isProcessing ? 0.5 : 1,
                      }}
                    />
                  )}
                </div>
              </Document>
              {numPages && (
                <div className="mt-4 flex justify-center items-center gap-4">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isProcessing}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {numPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                    disabled={currentPage === numPages || isProcessing}
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
            onClick={addSignatureToPDF}
            disabled={!file || !signature || isProcessing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <FaDownload className="mr-2" />
            )}
            {isProcessing ? "Processing..." : "Add Signature & Download"}
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
            <li>Upload PDF and signature image</li>
            <li>Draw signature directly</li>
            <li>Adjustable signature size and position</li>
            <li>Multi-page PDF navigation</li>
            <li>Actual PDF modification with signature embedding</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFSignatureAdder;