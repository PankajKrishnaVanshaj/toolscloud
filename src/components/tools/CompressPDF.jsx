"use client";

import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack";

const CompressPDF = () => {
  const [pdf, setPdf] = useState(null);
  const [originalCanvases, setOriginalCanvases] = useState([]);
  const [compressedImages, setCompressedImages] = useState([]);
  const [compressionQuality, setCompressionQuality] = useState(0.6);
  const [imageFormat, setImageFormat] = useState("jpeg");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (originalCanvases.length > 0) {
      const debounceRecompress = setTimeout(() => {
        recompressImages(); // Apply changes to all pages
      }, 500); // Debounce to prevent excessive recompression
      return () => clearTimeout(debounceRecompress);
    }
  }, [compressionQuality, imageFormat]);

  const handleFileUpload = async (event) => {
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
  };

  const renderAllPages = async (pdf) => {
    const canvases = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
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
    recompressImages(canvases); // Initial compression
  };

  const recompressImages = (canvases = originalCanvases) => {
    const images = canvases.map((canvas) =>
      canvas.toDataURL(`image/${imageFormat}`, compressionQuality)
    );
    setCompressedImages(images);
  };

  const getCompressedImage = () => {
    if (compressedImages.length === 0) return null;
    return compressedImages[currentPage - 1];
  };

  const handleQualityChange = (e) => {
    setCompressionQuality(parseFloat(e.target.value));
  };

  const handleFormatChange = (e) => {
    setImageFormat(e.target.value);
  };

  const handleNextPage = () => {
    if (currentPage < originalCanvases.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDownloadPage = () => {
    const compressedImage = getCompressedImage();
    if (!compressedImage) return;

    const link = document.createElement("a");
    link.href = compressedImage;
    link.download = `Compressed_PDF_Page_${currentPage}.${imageFormat}`;
    link.click();
  };

  const handleDownloadAll = () => {
    compressedImages.forEach((image, index) => {
      const link = document.createElement("a");
      link.href = image;
      link.download = `Compressed_PDF_Page_${index + 1}.${imageFormat}`;
      link.click();
    });
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-2xl max-w-7xl">
    <input
      type="file"
      accept="application/pdf"
      className="w-full p-2 border rounded-lg mb-4"
      onChange={handleFileUpload}
    />
    {isLoading && (
      <p className="text-center text-primary">
        Loading and compressing... Please wait.
      </p>
    )}
    <div className="flex flex-col md:flex-row h-full items-center justify-center gap-5">
      {/* Left Section */}
      <div className="flex-1 w-full">
        {originalCanvases.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-center md:text-left">
              Compressed Page {currentPage} of {originalCanvases.length}
            </h3>
            <div className="p-3 bg-gray-100 rounded-lg shadow overflow-auto">
              <img
                src={getCompressedImage()}
                alt={`Compressed Page ${currentPage}`}
                className="w-full h-auto rounded-lg shadow object-contain"
              />
            </div>
          </div>
        )}
      </div>
  
      {/* Right Section */}
      <div className="flex-1 w-full">
        <label className="block mb-2 font-medium text-gray-700">
          Compression Quality: {Math.round(compressionQuality * 100)}%
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={compressionQuality}
          onChange={handleQualityChange}
          className="w-full mb-4 accent-primary"
        />
  
        <label className="block mb-2 font-medium text-gray-700">Image Format:</label>
        <select
          value={imageFormat}
          onChange={handleFormatChange}
          className="w-full p-2 border rounded-lg mb-4"
        >
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
        </select>
  
        <button
          onClick={handleDownloadAll}
          className="w-full font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border hover:border-secondary p-2 rounded-lg"
          >
          Download All Pages
        </button>
  
        <div className="flex flex-wrap justify-between items-center gap-3 mt-3">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`w-full md:w-auto py-2 px-4 rounded-lg text-white ${
              currentPage === 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleDownloadPage}
            className="w-full md:w-auto bg-primary text-white py-2 px-4 rounded-lg text-center hover:bg-primary/90"
          >
            Download Page {currentPage}
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === originalCanvases.length}
            className={`w-full md:w-auto py-2 px-4 rounded-lg text-white ${
              currentPage === originalCanvases.length
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
  
  );
};

export default CompressPDF;
