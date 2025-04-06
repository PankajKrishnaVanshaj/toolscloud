"use client";

import React, { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

// Set up the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const SplitPDF = () => {
  const [pageImages, setPageImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1.5);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }
    setLoading(true);
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = async () => {
      const pdfData = new Uint8Array(fileReader.result);
      await splitPDF(pdfData);
      setLoading(false);
    };
  }, []);

  // Split PDF into images
  const splitPDF = async (pdfData) => {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdfDocument = await loadingTask.promise;
      const images = [];

      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        images.push(canvas.toDataURL("image/png"));
      }

      setPageImages(images);
      setCurrentPage(0);
      setSelectedPages(new Set());
    } catch (error) {
      console.error("Error splitting PDF:", error);
      alert("Failed to process PDF. Please try again.");
      setLoading(false);
    }
  };

  // Navigation
  const handleNextPage = () => {
    if (currentPage < pageImages.length - 1) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  const handlePageClick = (index) => {
    setCurrentPage(index);
  };

  // Toggle page selection
  const togglePageSelection = (index) => {
    setSelectedPages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  // Download selected pages
  const downloadSelectedPages = () => {
    const pagesToDownload = selectedPages.size > 0 ? Array.from(selectedPages) : [currentPage];
    pagesToDownload.forEach((index) => {
      const link = document.createElement("a");
      link.href = pageImages[index];
      link.download = `PDF_Page_${index + 1}.png`;
      link.click();
    });
  };

  // Reset everything
  const reset = () => {
    setPageImages([]);
    setCurrentPage(0);
    setSelectedPages(new Set());
    setScale(1.5);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Splitter</h2>

        {/* File Upload and Controls */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={loading}
              className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:file:bg-gray-200 disabled:cursor-not-allowed"
            />
            <div className="flex gap-2">
              <button
                onClick={downloadSelectedPages}
                disabled={pageImages.length === 0 || loading}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaDownload className="mr-2" /> Download {selectedPages.size > 0 ? "Selected" : "Current"}
              </button>
              <button
                onClick={reset}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Scale Control */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preview Scale ({scale.toFixed(1)}x)
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                disabled={loading || pageImages.length > 0}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Adjust before uploading (higher scale = better quality)
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Processing your PDF, please wait...</p>
            </div>
          )}

          {/* PDF Pages */}
          {pageImages.length > 0 && !loading && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Thumbnails */}
              <div className="w-full lg:w-1/3 flex-shrink-0 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                  {pageImages.map((image, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer rounded-lg border-2 p-1 ${
                        index === currentPage ? "border-blue-500" : "border-gray-300 hover:border-gray-500"
                      } ${selectedPages.has(index) ? "bg-blue-50" : ""}`}
                      onClick={() => handlePageClick(index)}
                    >
                      <img src={image} alt={`Page ${index + 1}`} className="w-full h-auto rounded" />
                      <input
                        type="checkbox"
                        checked={selectedPages.has(index)}
                        onChange={() => togglePageSelection(index)}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 right-2 accent-blue-500"
                      />
                      <span className="text-xs text-gray-600 block text-center mt-1">
                        Page {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Preview */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Page {currentPage + 1} of {pageImages.length}
                </h3>
                <img
                  src={pageImages[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full h-auto rounded-lg shadow-md max-h-[70vh] object-contain"
                />
                <div className="flex justify-between mt-4">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === pageImages.length - 1}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No PDF Uploaded */}
          {!pageImages.length && !loading && (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-gray-500 italic">Upload a PDF to start splitting</p>
            </div>
          )}
        </div>

         {/* How it works Section */}
         <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Upload a PDF document using the input above.</li>
            <li>
              Adjust the desired output quality/scale{" "}
              <span className="font-bold">before</span> uploading.
            </li>
            <li>
              The tool processes the PDF entirely{" "}
              <span className="font-bold">in your browser</span>. Your files are
              not sent to any server.
            </li>
            <li>
              Preview each page in the main viewer and use thumbnails for
              navigation.
            </li>
            <li>
              Use checkboxes on thumbnails (or click "Download Current") to
              select pages for download.
            </li>
            <li>
              Click "Download" to save the selected page(s) as individual PNG
              images.
            </li>
            <li>
              Click "Reset" to clear everything and upload a new file or change
              the scale.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SplitPDF;