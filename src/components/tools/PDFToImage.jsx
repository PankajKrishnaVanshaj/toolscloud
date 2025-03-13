"use client";

import React, { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack";
import { FaDownload, FaSync, FaUpload, FaSearchPlus, FaSearchMinus } from "react-icons/fa";

const PDFToImage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [imageURL, setImageURL] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);
  const [scale, setScale] = useState(1.5); // Zoom scale
  const [dpi, setDpi] = useState(150); // Resolution control
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setCurrentPage(1);
      generateThumbnails(file);
      renderPDFToCanvas(file, 1);
    } else {
      alert("Please upload a valid PDF file.");
    }
  }, []);

  // Generate thumbnails
  const generateThumbnails = useCallback(async (file) => {
    setLoading(true);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const pdfData = reader.result;
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);

      const thumbnailsArray = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext("2d");
        await page.render({ canvasContext: context, viewport }).promise;
        thumbnailsArray.push(canvas.toDataURL("image/png"));
      }
      setThumbnails(thumbnailsArray);
      setLoading(false);
    };
  }, []);

  // Render PDF page to canvas
  const renderPDFToCanvas = useCallback(
    async (file, pageNumber) => {
      if (isRendering) return;
      setIsRendering(true);
      setLoading(true);

      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        const pdfData = reader.result;
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: scale * (dpi / 72) }); // Adjust scale with DPI

        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: canvas.getContext("2d"),
          viewport: viewport,
        };
        await page.render(renderContext).promise;

        setImageURL(canvas.toDataURL("image/png"));
        setCurrentPage(pageNumber);
        setLoading(false);
        setIsRendering(false);
      };
    },
    [scale, dpi, isRendering]
  );

  // Handle thumbnail click
  const handleThumbnailClick = (pageIndex) => {
    if (!isRendering) {
      setCurrentPage(pageIndex + 1);
      renderPDFToCanvas(pdfFile, pageIndex + 1);
    }
  };

  // Download image
  const downloadImage = () => {
    if (!imageURL) {
      alert("No image generated!");
      return;
    }
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = `converted-page-${currentPage}-dpi${dpi}.png`;
    link.click();
  };

  // Reset everything
  const reset = () => {
    setPdfFile(null);
    setImageURL("");
    setTotalPages(0);
    setCurrentPage(1);
    setThumbnails([]);
    setScale(1.5);
    setDpi(150);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF to Image Converter</h2>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {pdfFile && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Thumbnails */}
            <div className="lg:w-1/4 max-h-[70vh] overflow-y-auto bg-gray-50 rounded-lg p-4">
              {loading && thumbnails.length === 0 ? (
                <p className="text-center text-gray-500">Generating thumbnails...</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {thumbnails.map((thumbnail, index) => (
                    <img
                      key={index}
                      src={thumbnail}
                      alt={`Thumbnail Page ${index + 1}`}
                      className={`cursor-pointer rounded-md border-2 ${
                        currentPage === index + 1 ? "border-blue-500" : "border-gray-300"
                      } hover:border-blue-300 transition-colors`}
                      onClick={() => handleThumbnailClick(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Main Preview */}
            <div className="lg:w-3/4 space-y-6">
              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom ({(scale * 100).toFixed(0)}%)
                  </label>
                  <div className="flex items-center gap-2">
                    <FaSearchMinus
                      className="cursor-pointer text-gray-600 hover:text-blue-500"
                      onClick={() => setScale(Math.max(0.5, scale - 0.25))}
                    />
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.25"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      disabled={isRendering}
                    />
                    <FaSearchPlus
                      className="cursor-pointer text-gray-600 hover:text-blue-500"
                      onClick={() => setScale(Math.min(3, scale + 0.25))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DPI ({dpi})
                  </label>
                  <input
                    type="range"
                    min="72"
                    max="300"
                    step="1"
                    value={dpi}
                    onChange={(e) => setDpi(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    disabled={isRendering}
                  />
                </div>
              </div>

              {/* Image Preview */}
              <div className="relative">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                {imageURL && (
                  <img
                    src={imageURL}
                    alt={`Converted Page ${currentPage}`}
                    className="w-full h-auto rounded-lg shadow-md max-h-[70vh] object-contain"
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Navigation and Actions */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleThumbnailClick(currentPage - 2)}
                    disabled={currentPage <= 1 || isRendering}
                    className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="py-2 px-4 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handleThumbnailClick(currentPage)}
                    disabled={currentPage >= totalPages || isRendering}
                    className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
                <div className="flex gap-2 flex-1 justify-end">
                  <button
                    onClick={downloadImage}
                    disabled={!imageURL || isRendering}
                    className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    <FaDownload className="mr-2" /> Download
                  </button>
                  <button
                    onClick={reset}
                    disabled={isRendering}
                    className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    <FaSync className="mr-2" /> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!pdfFile && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF file to start converting</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert PDF pages to PNG images</li>
            <li>Thumbnail preview for all pages</li>
            <li>Adjustable zoom (50% to 300%)</li>
            <li>Custom DPI (72 to 300) for resolution control</li>
            <li>Download individual pages</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFToImage;