// app/components/PDFImageExtractor.jsx
"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { FaDownload, FaSync, FaUpload, FaTrash } from "react-icons/fa";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFImageExtractor = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState({
    minWidth: 100,
    minHeight: 100,
    format: "png",
    quality: 0.8, // For JPEG
    scale: 1.5, // Render scale
  });
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setImages([]);
      setSelectedImages(new Set());
      setNumPages(null);
    }
  }, []);

  const onDocumentLoadSuccess = async ({ numPages }) => {
    setNumPages(numPages);
    await extractImages();
  };

  const extractImages = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    const extractedImages = [];

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const ops = await page.getOperatorList();
        const viewport = page.getViewport({ scale: settings.scale });

        for (let j = 0; j < ops.fnArray.length; j++) {
          if (ops.fnArray[j] === pdfjs.OPS.paintImageXObject) {
            const imgKey = ops.argsArray[j][0];
            const img = await page.objs.get(imgKey);

            if (img && img.width >= settings.minWidth && img.height >= settings.minHeight) {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              ctx.putImageData(img, 0, 0);

              const dataUrl =
                settings.format === "jpeg"
                  ? canvas.toDataURL("image/jpeg", settings.quality)
                  : canvas.toDataURL("image/png");

              extractedImages.push({
                src: dataUrl,
                page: i,
                width: img.width,
                height: img.height,
                id: `${i}-${j}`,
              });
            }
          }
        }
      }

      setImages(extractedImages);
    } catch (error) {
      console.error("Image extraction failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [file, settings]);

  const toggleImageSelection = (id) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedImages(new Set(images.map((img) => img.id)));
  };

  const deselectAll = () => {
    setSelectedImages(new Set());
  };

  const downloadImages = async () => {
    if (!images.length || !selectedImages.size) return;

    setIsProcessing(true);
    const zip = new JSZip();

    images
      .filter((img) => selectedImages.has(img.id))
      .forEach((img, index) => {
        const base64 = img.src.split(",")[1];
        zip.file(`image_page${img.page}_${index}.${settings.format}`, base64, { base64: true });
      });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `pdf_images_${Date.now()}.zip`);
    setIsProcessing(false);
  };

  const downloadSingleImage = (img) => {
    const link = document.createElement("a");
    link.href = img.src;
    link.download = `image_page${img.page}.${settings.format}`;
    link.click();
  };

  const reset = () => {
    setFile(null);
    setImages([]);
    setSelectedImages(new Set());
    setNumPages(null);
    setSettings({
      minWidth: 100,
      minHeight: 100,
      format: "png",
      quality: 0.8,
      scale: 1.5,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === "quality" || name === "scale" ? parseFloat(value) : value,
    }));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Image Extractor</h1>

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

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Width (px)</label>
            <input
              type="number"
              name="minWidth"
              value={settings.minWidth}
              onChange={handleSettingsChange}
              min="10"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Height (px)</label>
            <input
              type="number"
              name="minHeight"
              value={settings.minHeight}
              onChange={handleSettingsChange}
              min="10"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select
              name="format"
              value={settings.format}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quality ({settings.format === "jpeg" ? settings.quality : "N/A"})
            </label>
            <input
              type="range"
              name="quality"
              min="0.1"
              max="1"
              step="0.1"
              value={settings.quality}
              onChange={handleSettingsChange}
              disabled={settings.format !== "jpeg"}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scale ({settings.scale}x)
            </label>
            <input
              type="range"
              name="scale"
              min="1"
              max="3"
              step="0.1"
              value={settings.scale}
              onChange={handleSettingsChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Image Preview */}
        {isProcessing && (
          <div className="text-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Processing PDF...</p>
          </div>
        )}
        {images.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Found {images.length} Images (Selected: {selectedImages.size})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`relative border-2 rounded-md p-2 cursor-pointer transition-all ${
                    selectedImages.has(img.id) ? "border-blue-500 shadow-lg" : "border-gray-200"
                  }`}
                  onClick={() => toggleImageSelection(img.id)}
                >
                  <img src={img.src} alt={`Page ${img.page}`} className="w-full h-auto rounded" />
                  <p className="text-xs text-gray-600 mt-1">
                    Page {img.page} ({img.width}x{img.height})
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSingleImage(img);
                    }}
                    className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5 hover:bg-green-600 transition-colors"
                  >
                    <FaDownload size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {file && (
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={extractImages}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaUpload className="mr-2" /> {isProcessing ? "Processing..." : "Extract Images"}
            </button>
            <button
              onClick={downloadImages}
              disabled={isProcessing || !selectedImages.size}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Selected
            </button>
            <button
              onClick={reset}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        )}

        {!file && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to start extracting images</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Extract images from PDF files</li>
            <li>Customizable minimum size and output format</li>
            <li>JPEG quality adjustment</li>
            <li>Adjustable rendering scale</li>
            <li>Select and download individual or multiple images as ZIP</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFImageExtractor;