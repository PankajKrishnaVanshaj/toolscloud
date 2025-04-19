"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFFontEmbedder = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [embeddingSettings, setEmbeddingSettings] = useState({
    embedAll: true,
    customFonts: [],
    subsetFonts: true,
    compressionLevel: "medium",
    optimizeForPrint: false,
    addFontFallback: true,
  });
  const [availableFonts, setAvailableFonts] = useState([
    "Arial",
    "Times New Roman",
    "Helvetica",
    "Courier",
    "Verdana",
    "Georgia",
    "Palatino",
    "Garamond",
    "Bookman",
    "Trebuchet MS",
  ]);
  const fileInputRef = useRef(null);

  // Handle file upload
  const onFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
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
    setEmbeddingSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFontSelection = (font) => {
    setEmbeddingSettings((prev) => ({
      ...prev,
      customFonts: prev.customFonts.includes(font)
        ? prev.customFonts.filter((f) => f !== font)
        : [...prev.customFonts, font],
    }));
  };

  // Simulate font embedding
  const embedFonts = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate adding metadata or modifications
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `font_embedded_${embeddingSettings.compressionLevel}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Font embedding failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset everything
  const reset = () => {
    setFile(null);
    setNumPages(null);
    setPreviewPage(1);
    setEmbeddingSettings({
      embedAll: true,
      customFonts: [],
      subsetFonts: true,
      compressionLevel: "medium",
      optimizeForPrint: false,
      addFontFallback: true,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Font Embedder</h1>

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
        </div>

        {file && (
          <div className="space-y-6">
            {/* Embedding Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compression Level</label>
                <select
                  name="compressionLevel"
                  value={embeddingSettings.compressionLevel}
                  onChange={handleSettingsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value="low">Low (Best Quality)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Smallest Size)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="embedAll"
                    checked={embeddingSettings.embedAll}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-700">Embed All Fonts</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="subsetFonts"
                    checked={embeddingSettings.subsetFonts}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-700">Subset Fonts</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="optimizeForPrint"
                    checked={embeddingSettings.optimizeForPrint}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-700">Optimize for Print</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="addFontFallback"
                    checked={embeddingSettings.addFontFallback}
                    onChange={handleSettingsChange}
                    className="mr-2 accent-blue-500"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-700">Add Font Fallback</span>
                </label>
              </div>

              {!embeddingSettings.embedAll && (
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Fonts to Embed
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-2 rounded-md bg-gray-50">
                    {availableFonts.map((font) => (
                      <label key={font} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={embeddingSettings.customFonts.includes(font)}
                          onChange={() => handleFontSelection(font)}
                          className="mr-2 accent-blue-500"
                          disabled={isProcessing}
                        />
                        <span className="text-sm text-gray-600">{font}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Preview</h2>
              <div className="border p-4 bg-gray-50 rounded-lg relative">
                <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="flex justify-center">
                  <Page pageNumber={previewPage} width={Math.min(400, window.innerWidth - 80)} />
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
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={embedFonts}
                disabled={!file || isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                {isProcessing ? "Processing..." : "Embed Fonts & Download"}
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
            <p className="text-gray-500 italic">Upload a PDF to start embedding fonts</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Embed all or specific fonts</li>
            <li>Font subsetting option</li>
            <li>Customizable compression levels</li>
            <li>Print optimization and font fallback options</li>
            <li>Interactive PDF preview with page navigation</li>
            <li>Responsive design</li>
          </ul>
        </div>

       
      </div>
    </div>
  );
};

export default PDFFontEmbedder;