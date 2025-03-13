"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { FaDownload, FaSync, FaTrash, FaUpload, FaArrowUp, FaArrowDown } from "react-icons/fa";

const MergePDFs = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [mergedPdfURL, setMergedPdfURL] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Clean up URLs on unmount or when new merge occurs
  useEffect(() => {
    return () => {
      filePreviews.forEach((url) => URL.revokeObjectURL(url));
      if (mergedPdfURL) URL.revokeObjectURL(mergedPdfURL);
    };
  }, [filePreviews, mergedPdfURL]);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.type === "application/pdf");

    if (validFiles.length === 0) {
      alert("Please upload valid PDF files.");
      return;
    }

    setPdfFiles((prevFiles) => [...prevFiles, ...validFiles]);
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  }, []);

  // Merge PDFs
  const mergePDFs = useCallback(async () => {
    if (pdfFiles.length < 2) {
      alert("Please upload at least two PDF files to merge.");
      return;
    }

    setIsProcessing(true);
    const mergedPdf = await PDFDocument.create();

    try {
      for (const file of pdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const mergedPdfBlob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const newMergedPdfURL = URL.createObjectURL(mergedPdfBlob);
      
      if (mergedPdfURL) URL.revokeObjectURL(mergedPdfURL);
      setMergedPdfURL(newMergedPdfURL);
    } catch (error) {
      alert("Error merging PDFs: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  }, [pdfFiles, mergedPdfURL]);

  // Reorder files
  const moveUp = (index) => {
    if (index === 0 || isProcessing) return;
    setPdfFiles((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
    setFilePreviews((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
  };

  const moveDown = (index) => {
    if (index === pdfFiles.length - 1 || isProcessing) return;
    setPdfFiles((prev) => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated;
    });
    setFilePreviews((prev) => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated;
    });
  };

  // Remove file
  const removeFile = (index) => {
    if (isProcessing) return;
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return updated;
    });
  };

  // Reset everything
  const reset = () => {
    if (isProcessing) return;
    setPdfFiles([]);
    setFilePreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    if (mergedPdfURL) {
      URL.revokeObjectURL(mergedPdfURL);
      setMergedPdfURL("");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Download merged PDF
  const downloadMergedPDF = () => {
    if (!mergedPdfURL || isProcessing) return;
    const link = document.createElement("a");
    link.href = mergedPdfURL;
    link.download = `merged-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Merger</h2>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept="application/pdf"
            multiple
            ref={fileInputRef}
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:file:bg-gray-300 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Uploaded Files */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Uploaded PDFs</h3>
            {pdfFiles.length > 0 ? (
              <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
                {pdfFiles.map((file, index) => (
                  <li key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <span className="block truncate text-sm font-medium text-gray-800 mb-2">
                      {file.name}
                    </span>
                    <iframe
                      src={filePreviews[index]}
                      title={`Preview ${file.name}`}
                      className="w-full h-32 border rounded-md"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0 || isProcessing}
                        className="flex-1 py-1 px-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === pdfFiles.length - 1 || isProcessing}
                        className="flex-1 py-1 px-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaArrowDown />
                      </button>
                      <button
                        onClick={() => removeFile(index)}
                        disabled={isProcessing}
                        className="flex-1 py-1 px-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                <p className="text-gray-500 italic">Upload PDFs to start merging</p>
              </div>
            )}
            <button
              onClick={mergePDFs}
              disabled={pdfFiles.length < 2 || isProcessing}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <FaUpload className="mr-2" />
              )}
              {isProcessing ? "Merging..." : "Merge PDFs"}
            </button>
          </div>

          {/* Right Column: Merged PDF Preview */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Merged PDF Preview</h3>
            {mergedPdfURL ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <iframe
                  src={mergedPdfURL}
                  title="Merged PDF"
                  className="w-full h-[60vh] border rounded-md"
                />
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={downloadMergedPDF}
                    disabled={isProcessing}
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
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500 italic">
                  Merge PDFs to see a preview here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Merge multiple PDFs into one</li>
            <li>Reorder PDFs with up/down buttons</li>
            <li>Remove individual PDFs</li>
            <li>Preview uploaded and merged PDFs</li>
            <li>Download merged PDF</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MergePDFs;