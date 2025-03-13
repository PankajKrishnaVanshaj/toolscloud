// app/components/PDFDecryptionTool.jsx
"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FaDownload, FaSync, FaUpload, FaEye, FaEyeSlash } from "react-icons/fa";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFDecryptionTool = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [decryptionStatus, setDecryptionStatus] = useState("");
  const [decryptedFile, setDecryptedFile] = useState(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [zoom, setZoom] = useState(1.0); // Zoom level for preview
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setDecryptedFile(null);
      setDecryptionStatus("");
      setError("");
      setPassword("");
      setPreviewPage(1);
      setZoom(1.0);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const decryptPDF = useCallback(async () => {
    if (!file || !password) {
      setError("Please upload a PDF and enter a password");
      return;
    }

    setIsProcessing(true);
    setError("");
    setDecryptionStatus("Decrypting...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({
        data: arrayBuffer,
        password: password,
      }).promise;

      setDecryptionStatus("Decryption successful!");
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const decryptedFile = new File([blob], `decrypted_${file.name}`, {
        type: "application/pdf",
      });
      setDecryptedFile(decryptedFile);
    } catch (error) {
      if (error.name === "PasswordException") {
        setError("Incorrect password or PDF is not encrypted");
      } else {
        setError("Failed to process PDF: " + error.message);
      }
      setDecryptionStatus("");
    } finally {
      setIsProcessing(false);
    }
  }, [file, password]);

  const downloadDecryptedFile = () => {
    if (!decryptedFile) return;
    const url = URL.createObjectURL(decryptedFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = decryptedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setPassword("");
    setNumPages(null);
    setPreviewPage(1);
    setIsProcessing(false);
    setDecryptionStatus("");
    setDecryptedFile(null);
    setError("");
    setZoom(1.0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Decryption Tool</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Encrypted PDF</label>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isProcessing}
          />
        </div>

        {/* Password Input */}
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter PDF password"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            disabled={isProcessing}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Status Messages */}
        {decryptionStatus && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{decryptionStatus}</div>
        )}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-md relative overflow-auto max-h-96">
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onPassword={(callback) => callback(password)}
                className="flex justify-center"
              >
                <Page pageNumber={previewPage} scale={zoom} width={400} />
              </Document>
            </div>
            {numPages && (
              <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                    disabled={previewPage === 1 || isProcessing}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
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
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Zoom:</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-600">{(zoom * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={decryptPDF}
            disabled={!file || !password || isProcessing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaUpload className="mr-2" />
            {isProcessing ? "Decrypting..." : "Decrypt PDF"}
          </button>
          <button
            onClick={downloadDecryptedFile}
            disabled={!decryptedFile || isProcessing}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
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
            <li>Decrypt password-protected PDFs</li>
            <li>Preview with page navigation and zoom</li>
            <li>Show/hide password option</li>
            <li>Download decrypted PDF</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFDecryptionTool;