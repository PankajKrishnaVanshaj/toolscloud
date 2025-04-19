"use client";

import { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { FaDownload, FaSync, FaUpload, FaFont, FaImage } from "react-icons/fa";

const PDFToWord = () => {
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [textSize, setTextSize] = useState(16);
  const [images, setImages] = useState([]);
  const [showPreview, setShowPreview] = useState(true);
  const [fileName, setFileName] = useState("");
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file?.type === "application/pdf") {
      setFileName(file.name.replace(".pdf", ""));
      convertPDFToText(file);
      convertPDFToImages(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  }, []);

  // Convert PDF to text
  const convertPDFToText = useCallback(async (file) => {
    setLoading(true);
    setExtractedText([]);
    setCurrentPage(1);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async () => {
      const loadingTask = pdfjsLib.getDocument({ data: reader.result });
      try {
        const pdf = await loadingTask.promise;
        const pagesText = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          pagesText.push(textContent.items.map((item) => item.str).join(" "));
          if (pageNum === 1) renderPagePreview(page);
        }
        setExtractedText(pagesText);
      } catch (error) {
        console.error("Error extracting text:", error);
        alert("Failed to process PDF. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  }, []);

  // Render page preview
  const renderPagePreview = async (page) => {
    const canvas = previewCanvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      const viewport = page.getViewport({ scale: 0.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
    }
  };

  // Convert PDF to images
  const convertPDFToImages = useCallback(async (file) => {
    setImages([]);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const loadingTask = pdfjsLib.getDocument({ data: reader.result });
      const pdf = await loadingTask.promise;
      const imagesArray = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        imagesArray.push(canvas.toDataURL("image/png"));
      }
      setImages(imagesArray);
    };
  }, []);

  // Download as Word document
  const downloadWordDocument = () => {
    if (!extractedText.length) return alert("No text to download.");
    const fullText = extractedText
      .map((text, i) => `--- Page ${i + 1} ---\n\n${text}`)
      .join("\n\n");
    const blob = new Blob([fullText], { type: "text/plain" }); // Changed to text/plain for simplicity
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName || "converted"}-document.txt`; // Changed to .txt for better compatibility
    link.click();
  };

  // Download current page as image
  const downloadImage = () => {
    if (images.length && images[currentPage - 1]) {
      const link = document.createElement("a");
      link.href = images[currentPage - 1];
      link.download = `${fileName || "page"}-${currentPage}.png`;
      link.click();
    }
  };

  // Reset everything
  const reset = () => {
    setExtractedText([]);
    setImages([]);
    setCurrentPage(1);
    setTextSize(16);
    setShowPreview(true);
    setFileName("");
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF to Word Converter</h2>

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

        {loading && (
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Processing PDF, please wait...</p>
          </div>
        )}

        {extractedText.length > 0 && !loading && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setTextSize((size) => Math.max(size - 2, 12))}
                  className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <FaFont /> -
                </button>
                <button
                  onClick={() => setTextSize((size) => Math.min(size + 2, 32))}
                  className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <FaFont /> +
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <FaImage /> {showPreview ? "Hide" : "Show"} Preview
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadWordDocument}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaDownload className="mr-2" /> Download Text
                </button>
                <button
                  onClick={downloadImage}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="mr-2" /> Download Image
                </button>
                <button
                  onClick={reset}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Image Preview */}
              {showPreview && images.length > 0 && (
                <div className="w-full lg:w-1/3">
                  <img
                    src={images[currentPage - 1]}
                    alt={`Page ${currentPage}`}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                  <canvas ref={previewCanvasRef} className="hidden" />
                </div>
              )}

              {/* Text Display */}
              <div className={`w-full ${showPreview ? "lg:w-2/3" : "w-full"}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Page {currentPage} of {extractedText.length}
                  </h3>
                  <span className="text-sm text-gray-600">Text Size: {textSize}px</span>
                </div>
                <div
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto max-h-96"
                  style={{ whiteSpace: "pre-wrap", fontSize: `${textSize}px` }}
                >
                  {extractedText[currentPage - 1]}
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setCurrentPage((page) => page - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((page) => page + 1)}
                    disabled={currentPage === extractedText.length}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!extractedText.length && !loading && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to start converting</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Extract text from PDF pages</li>
            <li>Preview PDF pages as images</li>
            <li>Adjustable text size (12-32px)</li>
            <li>Download as text file or per-page images</li>
            <li>Toggleable image preview</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFToWord;