// app/components/PDFEncryptionTool.jsx
"use client";
import React, { useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FaDownload, FaSync, FaLock, FaFileUpload } from "react-icons/fa";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFEncryptionTool = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [encryptionSettings, setEncryptionSettings] = useState({
    userPassword: "",
    ownerPassword: "",
    encryptionLevel: "128",
    permissions: {
      printing: true,
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: false,
    },
  });
  const fileInputRef = useRef(null);

  // Handle file upload
  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setPreviewPage(1);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Handle settings changes
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setEncryptionSettings((prev) => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [name]: checked,
        },
      }));
    } else {
      setEncryptionSettings((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Encrypt PDF
  const encryptPDF = async () => {
    if (!file || !encryptionSettings.userPassword) return;

    setIsProcessing(true);
    try {
      const fileReader = new FileReader();
      const pdfData = await new Promise((resolve) => {
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.readAsArrayBuffer(file);
      });

      const pdfDoc = await pdfjs.getDocument(pdfData).promise;

      const pdfBytes = await pdfDoc.save({
        userPassword: encryptionSettings.userPassword,
        ownerPassword: encryptionSettings.ownerPassword || undefined,
        permissions: {
          printing: encryptionSettings.permissions.printing ? "highResolution" : undefined,
          modifying: encryptionSettings.permissions.modifying,
          copying: encryptionSettings.permissions.copying,
          annotating: encryptionSettings.permissions.annotating,
          fillingForms: encryptionSettings.permissions.fillingForms,
          contentAccessibility: encryptionSettings.permissions.contentAccessibility,
        },
        encryptionLevel: parseInt(encryptionSettings.encryptionLevel),
      });

      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `encrypted_${file.name}`;
      link.click();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Encryption failed:", error);
      alert("Error during encryption: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFile(null);
    setNumPages(null);
    setPreviewPage(1);
    setEncryptionSettings({
      userPassword: "",
      ownerPassword: "",
      encryptionLevel: "128",
      permissions: {
        printing: true,
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: false,
      },
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FaLock className="mr-2" /> PDF Encryption Tool
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

        {/* Encryption Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Password (Required)
            </label>
            <input
              type="password"
              name="userPassword"
              value={encryptionSettings.userPassword}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Password to open PDF"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Password (Optional)
            </label>
            <input
              type="password"
              name="ownerPassword"
              value={encryptionSettings.ownerPassword}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Password for permissions"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Encryption Level
            </label>
            <select
              name="encryptionLevel"
              value={encryptionSettings.encryptionLevel}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            >
              <option value="40">40-bit RC4 (Legacy)</option>
              <option value="128">128-bit RC4 (Standard)</option>
              <option value="256">256-bit AES (High Security)</option>
            </select>
          </div>
        </div>

        {/* Permissions */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Permissions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "printing", label: "Allow Printing" },
              { name: "modifying", label: "Allow Modifying" },
              { name: "copying", label: "Allow Copying" },
              { name: "annotating", label: "Allow Annotating" },
              { name: "fillingForms", label: "Allow Form Filling" },
              { name: "contentAccessibility", label: "Allow Content Accessibility" },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center">
                <input
                  type="checkbox"
                  name={name}
                  checked={encryptionSettings.permissions[name]}
                  onChange={handleSettingsChange}
                  className="mr-2 accent-blue-500"
                  disabled={isProcessing}
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-lg shadow-inner">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page
                  pageNumber={previewPage}
                  width={Math.min(400, window.innerWidth - 40)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
              {numPages && (
                <div className="mt-4 flex justify-center items-center gap-4">
                  <button
                    onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                    disabled={previewPage === 1 || isProcessing}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {previewPage} of {numPages}
                  </span>
                  <button
                    onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                    disabled={previewPage === numPages || isProcessing}
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
            onClick={encryptPDF}
            disabled={!file || !encryptionSettings.userPassword || isProcessing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Encrypting...
              </div>
            ) : (
              <>
                <FaDownload className="mr-2" /> Encrypt and Download
              </>
            )}
          </button>
          <button
            onClick={resetForm}
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
            <li>Encrypt PDFs with user and owner passwords</li>
            <li>Multiple encryption levels: 40-bit, 128-bit, 256-bit</li>
            <li>Customizable permissions</li>
            <li>Interactive PDF preview with page navigation</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFEncryptionTool;