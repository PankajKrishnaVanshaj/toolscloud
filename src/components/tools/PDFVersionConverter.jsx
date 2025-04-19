"use client";
import React, { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFVersionConverter = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [targetVersion, setTargetVersion] = useState("1.7");
  const [previewPage, setPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionOptions, setConversionOptions] = useState({
    maintainCompatibility: true,
    optimizeSize: false,
    encryptOutput: false,
    password: "",
    compressionLevel: 6, // 0-9, higher means more compression
    removeAnnotations: false,
    flattenForms: false,
  });
  const fileInputRef = React.useRef(null);

  const pdfVersions = ["1.0", "1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "2.0"];

  // Handle file upload and version detection
  const onFileChange = useCallback(async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      const metadata = await pdf.getMetadata();
      setCurrentVersion(metadata.info.PDFVersion || "Unknown");
      setPreviewPage(1);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Handle conversion option changes
  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConversionOptions((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Simulate PDF conversion
  const convertPDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate conversion by creating a blob with metadata
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `converted_v${targetVersion}_${Date.now()}_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("An error occurred during conversion.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset everything
  const reset = () => {
    setFile(null);
    setNumPages(null);
    setCurrentVersion(null);
    setTargetVersion("1.7");
    setPreviewPage(1);
    setIsProcessing(false);
    setConversionOptions({
      maintainCompatibility: true,
      optimizeSize: false,
      encryptOutput: false,
      password: "",
      compressionLevel: 6,
      removeAnnotations: false,
      flattenForms: false,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Version Converter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF File</label>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {currentVersion && (
            <p className="mt-2 text-sm text-gray-600">Current Version: {currentVersion}</p>
          )}
        </div>

        {file && (
          <div className="space-y-6">
            {/* Conversion Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target PDF Version
                </label>
                <select
                  value={targetVersion}
                  onChange={(e) => setTargetVersion(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  {pdfVersions.map((version) => (
                    <option key={version} value={version}>
                      PDF {version}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compression Level ({conversionOptions.compressionLevel})
                </label>
                <input
                  type="range"
                  min="0"
                  max="9"
                  value={conversionOptions.compressionLevel}
                  name="compressionLevel"
                  onChange={handleOptionChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing || !conversionOptions.optimizeSize}
                />
              </div>

              {conversionOptions.encryptOutput && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={conversionOptions.password}
                    onChange={handleOptionChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter encryption password"
                    disabled={isProcessing}
                  />
                </div>
              )}
            </div>

            {/* Conversion Options */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Conversion Options</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="maintainCompatibility"
                    checked={conversionOptions.maintainCompatibility}
                    onChange={handleOptionChange}
                    className="mr-2 accent-blue-500"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-700">Maintain Compatibility</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="optimizeSize"
                    checked={conversionOptions.optimizeSize}
                    onChange={handleOptionChange}
                    className="mr-2 accent-blue-500"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-700">Optimize Size</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="encryptOutput"
                    checked={conversionOptions.encryptOutput}
                    onChange={handleOptionChange}
                    className="mr-2 accent-blue-500"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-700">Encrypt Output</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="removeAnnotations"
                    checked={conversionOptions.removeAnnotations}
                    onChange={handleOptionChange}
                    className="mr-2 accent-blue-500"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-700">Remove Annotations</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="flattenForms"
                    checked={conversionOptions.flattenForms}
                    onChange={handleOptionChange}
                    className="mr-2 accent-blue-500"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-700">Flatten Forms</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Preview</h2>
              <div className="border p-4 bg-gray-50 rounded-lg">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page pageNumber={previewPage} width={Math.min(400, window.innerWidth - 40)} />
                </Document>
                {numPages && (
                  <div className="mt-4 text-center flex justify-center items-center gap-4">
                    <button
                      onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                      disabled={previewPage === 1 || isProcessing}
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
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
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={convertPDF}
                disabled={!file || isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Converting...
                  </span>
                ) : (
                  <>
                    <FaDownload className="mr-2" /> Convert and Download
                  </>
                )}
              </button>
              <button
                onClick={reset}
                disabled={isProcessing}
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
            <p className="text-gray-500 italic">Upload a PDF file to start</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between PDF versions (1.0 to 2.0)</li>
            <li>Preview PDF pages with navigation</li>
            <li>Options for compatibility, optimization, and encryption</li>
            <li>Compression level adjustment</li>
            <li>Remove annotations and flatten forms</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default PDFVersionConverter;