"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFFileSizeEstimator = () => {
  const [file, setFile] = useState(null);
  const [pdfStats, setPdfStats] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState(50);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      analyzePDF(selectedFile);
    }
  }, []);

  const analyzePDF = async (pdfFile) => {
    setIsAnalyzing(true);
    try {
      const fileSizeMB = (pdfFile.size / (1024 * 1024)).toFixed(2);
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      const numPages = pdf.numPages;

      // Enhanced content analysis
      let imageSize = 0;
      let textSize = 0;
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const operatorList = await page.getOperatorList();

        // Rough estimation of image and text content
        imageSize += operatorList.fnArray.filter((fn) => fn === pdfjs.OPS.paintImageXObject).length * 0.5;
        textSize += content.items.length * 0.01;
      }

      const metadataSize = Math.min(fileSizeMB * 0.1, 10);
      const totalEstimated = imageSize + textSize + metadataSize;
      const scaleFactor = fileSizeMB / totalEstimated;

      const estimatedStats = {
        originalSize: fileSizeMB,
        pageCount: numPages,
        images: (imageSize * scaleFactor).toFixed(2),
        text: (textSize * scaleFactor).toFixed(2),
        metadata: metadataSize.toFixed(2),
        estimatedCompressedSize: (fileSizeMB * (1 - compressionLevel / 100)).toFixed(2),
      };

      setPdfStats(estimatedStats);
    } catch (error) {
      console.error("PDF analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPdfStats(null);
    setCompressionLevel(50);
    setPreviewPage(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadStats = () => {
    if (!pdfStats) return;
    const statsText = `
PDF Analysis Report
------------------
Original Size: ${formatSize(pdfStats.originalSize)}
Estimated Compressed Size: ${formatSize(pdfStats.estimatedCompressedSize)}
Page Count: ${pdfStats.pageCount}
Images: ${formatSize(pdfStats.images)} (~${Math.round((pdfStats.images / pdfStats.originalSize) * 100)}%)
Text: ${formatSize(pdfStats.text)} (~${Math.round((pdfStats.text / pdfStats.originalSize) * 100)}%)
Metadata: ${formatSize(pdfStats.metadata)} (~${Math.round((pdfStats.metadata / pdfStats.originalSize) * 100)}%)
Compression Level: ${compressionLevel}%
    `.trim();
    const blob = new Blob([statsText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pdf-stats-${Date.now()}.txt`;
    link.click();
  };

  const formatSize = (size) => `${size} MB`;

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF File Size Estimator</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF File</label>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            disabled={isAnalyzing}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:file:bg-gray-200 disabled:cursor-not-allowed"
          />
        </div>

        {file && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compression Level: {compressionLevel}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={compressionLevel}
                  onChange={(e) => {
                    setCompressionLevel(e.target.value);
                    if (pdfStats) {
                      setPdfStats((prev) => ({
                        ...prev,
                        estimatedCompressedSize: (prev.originalSize * (1 - e.target.value / 100)).toFixed(2),
                      }));
                    }
                  }}
                  disabled={isAnalyzing}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              {pdfStats && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview Page: {previewPage}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max={pdfStats.pageCount}
                    value={previewPage}
                    onChange={(e) => setPreviewPage(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={downloadStats}
                disabled={!pdfStats || isAnalyzing}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download Stats
              </button>
              <button
                onClick={reset}
                disabled={isAnalyzing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>

            {/* Analysis Results */}
            {isAnalyzing && (
              <div className="text-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">Analyzing PDF...</p>
              </div>
            )}

            {pdfStats && !isAnalyzing && (
              <div className="space-y-6">
                {/* PDF Preview */}
                <div className="flex justify-center">
                  <Document file={file}>
                    <Page
                      pageNumber={previewPage}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="shadow-md rounded-lg max-h-96 overflow-hidden"
                    />
                  </Document>
                </div>

                {/* Size Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800">Original Size</h3>
                    <p className="text-2xl font-bold text-blue-900">{formatSize(pdfStats.originalSize)}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800">Estimated Compressed Size</h3>
                    <p className="text-2xl font-bold text-green-900">{formatSize(pdfStats.estimatedCompressedSize)}</p>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Content Breakdown</h2>
                  <div className="space-y-2">
                    {[
                      { label: "Pages", value: pdfStats.pageCount },
                      { label: "Images", value: formatSize(pdfStats.images), percent: (pdfStats.images / pdfStats.originalSize) * 100 },
                      { label: "Text", value: formatSize(pdfStats.text), percent: (pdfStats.text / pdfStats.originalSize) * 100 },
                      { label: "Metadata", value: formatSize(pdfStats.metadata), percent: (pdfStats.metadata / pdfStats.originalSize) * 100 },
                    ].map(({ label, value, percent }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {label} {percent ? `(~${Math.round(percent)}%)` : ""}
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size Visualization */}
                <div>
                  <h2 className="text-lg font-semibold mb-2">Size Visualization</h2>
                  <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${(pdfStats.images / pdfStats.originalSize) * 100}%` }}
                      className="h-full bg-blue-500 transition-all duration-300"
                      title={`Images: ${formatSize(pdfStats.images)}`}
                    ></div>
                    <div
                      style={{ width: `${(pdfStats.text / pdfStats.originalSize) * 100}%` }}
                      className="h-full bg-green-500 transition-all duration-300"
                      title={`Text: ${formatSize(pdfStats.text)}`}
                    ></div>
                    <div
                      style={{ width: `${(pdfStats.metadata / pdfStats.originalSize) * 100}%` }}
                      className="h-full bg-yellow-500 transition-all duration-300"
                      title={`Metadata: ${formatSize(pdfStats.metadata)}`}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-600">
                    <span>Images</span>
                    <span>Text</span>
                    <span>Metadata</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!file && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to analyze</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Analyze PDF size and content breakdown</li>
            <li>Estimate compressed size with adjustable compression level</li>
            <li>Preview PDF pages</li>
            <li>Download analysis report</li>
            <li>Visual size breakdown</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFFileSizeEstimator;