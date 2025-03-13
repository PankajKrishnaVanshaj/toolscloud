// components/PDFConverter.jsx
"use client";
import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib"; // For PDF creation
import { saveAs } from "file-saver"; // For downloading
import { FaFilePdf, FaUpload, FaSync } from "react-icons/fa";

const PDFConverter = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Supported file types
  const supportedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  // Handle file upload
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) =>
      supportedTypes.includes(file.type)
    );

    if (validFiles.length === 0) {
      setError("No supported files selected. Please upload images or Word documents.");
      setFiles([]);
    } else {
      setFiles(validFiles);
      setError("");
      setSuccess(false);
    }
  };

  // Convert files to PDF
  const convertToPDF = async () => {
    if (files.length === 0) {
      setError("Please upload files to convert.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess(false);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        if (file.type.startsWith("image/")) {
          // Handle image files
          const arrayBuffer = await file.arrayBuffer();
          const image = await (file.type === "image/png"
            ? pdfDoc.embedPng(arrayBuffer)
            : pdfDoc.embedJpg(arrayBuffer));

          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        } else {
          // Handle Word documents (basic placeholder - requires server-side conversion for full support)
          setError(
            "Word document conversion is limited. Full support requires server-side processing."
          );
          const page = pdfDoc.addPage();
          page.drawText("Word document conversion placeholder", {
            x: 50,
            y: page.getHeight() - 100,
            size: 12,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, `converted_${Date.now()}.pdf`);

      setSuccess(true);
    } catch (err) {
      setError("Failed to convert files to PDF. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setFiles([]);
    setError("");
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          PDF Converter
        </h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Files
          </label>
          <input
            type="file"
            multiple
            accept={supportedTypes.join(",")}
            ref={fileInputRef}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-2 text-xs text-gray-500">
            Supported: JPEG, PNG, GIF, Word (.doc, .docx)
          </p>
        </div>

        {/* File Preview */}
        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 max-h-32 overflow-y-auto">
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={convertToPDF}
            disabled={isProcessing || files.length === 0}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <FaFilePdf className="mr-2" />
            )}
            {isProcessing ? "Converting..." : "Convert to PDF"}
          </button>
          <button
            onClick={resetForm}
            disabled={isProcessing}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            Files successfully converted and downloaded as PDF!
          </div>
        )}

        {/* Placeholder */}
        {files.length === 0 && !error && !success && (
          <div className="mt-6 text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload files to convert to PDF</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert images (JPEG, PNG, GIF) to PDF</li>
            <li>Basic support for Word documents</li>
            <li>Multiple file conversion</li>
            <li>Download as a single PDF</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>

        {/* Note */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> Word document conversion is limited client-side. For full support, consider server-side processing (e.g., using LibreOffice or a conversion API).
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFConverter;