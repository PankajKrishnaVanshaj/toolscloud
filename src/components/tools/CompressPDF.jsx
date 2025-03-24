"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
import JSZip from "jszip"; // For zipping multiple files
import { saveAs } from "file-saver"; // For saving the zip file

const CompressPDF = () => {
  const [pdf, setPdf] = useState(null);
  const [originalCanvases, setOriginalCanvases] = useState([]);
  const [compressedImages, setCompressedImages] = useState([]);
  const [compressionQuality, setCompressionQuality] = useState(0.6);
  const [imageFormat, setImageFormat] = useState("jpeg");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1); // New: Resolution scale
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (originalCanvases.length > 0) {
      const debounceRecompress = setTimeout(() => {
        recompressImages();
      }, 500);
      return () => clearTimeout(debounceRecompress);
    }
  }, [compressionQuality, imageFormat, scale]);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    setIsLoading(true);
    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      const pdfData = e.target.result;
      const loadedPdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      setPdf(loadedPdf);
      await renderAllPages(loadedPdf);
      setIsLoading(false);
    };
    fileReader.readAsArrayBuffer(file);
  }, []);

  const renderAllPages = async (pdf) => {
    const canvases = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      canvases.push(canvas);
    }

    setOriginalCanvases(canvases);
    recompressImages(canvases);
  };

  const recompressImages = useCallback((canvases = originalCanvases) => {
    const images = canvases.map((canvas) =>
      canvas.toDataURL(`image/${imageFormat}`, compressionQuality)
    );
    setCompressedImages(images);
  }, [compressionQuality, imageFormat, originalCanvases]);

  const reset = () => {
    setPdf(null);
    setOriginalCanvases([]);
    setCompressedImages([]);
    setCompressionQuality(0.6);
    setImageFormat("jpeg");
    setCurrentPage(1);
    setScale(1);
    setIsLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadPage = () => {
    const compressedImage = compressedImages[currentPage - 1];
    if (!compressedImage) return;

    const link = document.createElement("a");
    link.href = compressedImage;
    link.download = `Compressed_PDF_Page_${currentPage}.${imageFormat}`;
    link.click();
  };

  const handleDownloadAll = async () => {
    if (compressedImages.length === 0) return;

    const zip = new JSZip();
    compressedImages.forEach((image, index) => {
      const base64Data = image.split(",")[1];
      zip.file(`Compressed_PDF_Page_${index + 1}.${imageFormat}`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `Compressed_PDF_Pages_${Date.now()}.zip`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Compressor</h2>

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

        {isLoading && (
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading and compressing... Please wait.</p>
          </div>
        )}

        {!isLoading && originalCanvases.length > 0 && (
          <div className="space-y-6">
            {/* Preview */}
            <div className="flex justify-center">
              <div className="p-3 bg-gray-100 rounded-lg shadow overflow-auto max-h-96">
                <img
                  src={compressedImages[currentPage - 1]}
                  alt={`Compressed Page ${currentPage}`}
                  className="w-full h-auto rounded-lg shadow object-contain"
                />
              </div>
            </div>
            <p className="text-center text-gray-600">
              Page {currentPage} of {originalCanvases.length}
            </p>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compression Quality ({Math.round(compressionQuality * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={compressionQuality}
                  onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image Format</label>
                <select
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Scale ({scale}x)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* Navigation and Download */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleDownloadPage}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download Page
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(originalCanvases.length, prev + 1))}
                disabled={currentPage === originalCanvases.length}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownloadAll}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download All (ZIP)
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        )}

        {!isLoading && originalCanvases.length === 0 && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to start compressing</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Compress PDF pages to JPEG or PNG</li>
            <li>Adjustable compression quality and resolution</li>
            <li>Download individual pages or all as a ZIP</li>
            <li>Real-time preview with page navigation</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompressPDF;