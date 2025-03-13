"use client";
import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib"; // For PDF manipulation
import { FaLock, FaUnlock, FaDownload, FaUpload } from "react-icons/fa";

const PDFPasswordProtector = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError("");
      setSuccess(false);
    } else {
      setError("Please upload a valid PDF file.");
      setPdfFile(null);
    }
  };

  // Encrypt the PDF with a password
  const protectPDF = async () => {
    if (!pdfFile || !password || password !== confirmPassword) {
      setError(
        !pdfFile
          ? "Please upload a PDF file."
          : password !== confirmPassword
          ? "Passwords do not match."
          : "Please enter a password."
      );
      setSuccess(false);
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess(false);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Encrypt the PDF
      pdfDoc.encrypt({
        userPassword: password,
        ownerPassword: password, // Same password for simplicity; owner can have more permissions
        permissions: {
          printing: "highResolution",
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: false,
          documentAssembly: false,
        },
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `protected_${pdfFile.name}`;
      link.click();

      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (err) {
      setError("Failed to protect the PDF. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setPdfFile(null);
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          PDF Password Protector
        </h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF File
          </label>
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Password Fields */}
        {pdfFile && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="Enter password"
                  disabled={isProcessing}
                />
                <FaLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="Confirm password"
                  disabled={isProcessing}
                />
                <FaLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={protectPDF}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaLock className="mr-2" />
                )}
                {isProcessing ? "Protecting..." : "Protect PDF"}
              </button>
              <button
                onClick={resetForm}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUnlock className="mr-2" /> Reset
              </button>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                PDF successfully protected and downloaded!
              </div>
            )}
          </div>
        )}

        {/* Placeholder */}
        {!pdfFile && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to add password protection</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Add password protection to PDFs</li>
            <li>Restrict editing, copying, and printing</li>
            <li>Download encrypted PDF</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time feedback</li>
          </ul>
        </div>

        {/* Note */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> The password will be required to open the protected PDF.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFPasswordProtector;