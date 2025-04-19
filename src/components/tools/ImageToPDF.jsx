"use client";
import React, { useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FaUpload, FaDownload, FaSync, FaTrash } from "react-icons/fa";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ImageToPDF = () => {
  const [images, setImages] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [settings, setSettings] = useState({
    pageSize: "A4",
    orientation: "portrait",
    quality: 80,
    margin: 10,
    fitMode: "fit", // New: fit or fill
    backgroundColor: "#ffffff", // New: background color
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Optimized image upload
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024 // 10MB limit
    );

    Promise.all(
      validImages.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ file, preview: e.target.result });
            reader.readAsDataURL(file);
          })
      )
    ).then((newImages) => {
      setImages((prev) => [...prev, ...newImages]);
    });
  }, []);

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setImages([]);
    setPdfUrl(null);
    setSettings({
      pageSize: "A4",
      orientation: "portrait",
      quality: 80,
      margin: 10,
      fitMode: "fit",
      backgroundColor: "#ffffff",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const convertToPDF = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();

      for (const image of images) {
        const imgBuffer = await image.file.arrayBuffer();
        let pdfImage;

        if (image.file.type === "image/jpeg") {
          pdfImage = await pdfDoc.embedJpg(imgBuffer);
        } else if (image.file.type === "image/png") {
          pdfImage = await pdfDoc.embedPng(imgBuffer);
        } else {
          continue; // Skip unsupported formats
        }

        const page = pdfDoc.addPage();
        const { width, height } = getPageDimensions();

        const imgDims = scaleDimensions(
          pdfImage.width,
          pdfImage.height,
          width - settings.margin * 2,
          height - settings.margin * 2,
          settings.fitMode
        );

        // Set background color
        page.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: hexToRgb(settings.backgroundColor),
        });

        page.drawImage(pdfImage, {
          x: settings.margin + (width - imgDims.width - settings.margin * 2) / 2,
          y: settings.margin + (height - imgDims.height - settings.margin * 2) / 2,
          width: imgDims.width,
          height: imgDims.height,
        });
      }

      const pdfBytes = await pdfDoc.save({ jpegQuality: settings.quality / 100 });
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      const link = document.createElement("a");
      link.href = url;
      link.download = `converted-images-${Date.now()}.pdf`;
      link.click();
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("Failed to convert images to PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getPageDimensions = () => {
    const sizes = {
      A4: settings.orientation === "portrait" ? [595.28, 841.89] : [841.89, 595.28],
      Letter: settings.orientation === "portrait" ? [612, 792] : [792, 612],
      Legal: settings.orientation === "portrait" ? [612, 1008] : [1008, 612],
    };
    return { width: sizes[settings.pageSize][0], height: sizes[settings.pageSize][1] };
  };

  const scaleDimensions = (width, height, maxWidth, maxHeight, fitMode) => {
    if (fitMode === "fill") {
      const ratio = Math.max(maxWidth / width, maxHeight / height);
      return { width: width * ratio, height: height * ratio };
    }
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    return { width: width * ratio, height: height * ratio };
  };

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image to PDF Converter</h1>

        {/* Upload and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaUpload className="mr-2" /> Upload Images
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={convertToPDF}
            disabled={images.length === 0 || isProcessing}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> {isProcessing ? "Converting..." : "Convert to PDF"}
          </button>
          <button
            onClick={clearAll}
            disabled={isProcessing || images.length === 0}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 max-h-64 overflow-y-auto">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md shadow-sm"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Size</label>
            <select
              name="pageSize"
              value={settings.pageSize}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
            <select
              name="orientation"
              value={settings.orientation}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fit Mode</label>
            <select
              name="fitMode"
              value={settings.fitMode}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="fit">Fit (Maintain Aspect)</option>
              <option value="fill">Fill (Crop to Fit)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quality (%)</label>
            <input
              type="range"
              name="quality"
              value={settings.quality}
              onChange={handleSettingsChange}
              min="10"
              max="100"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-sm text-gray-600">{settings.quality}%</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Margin (mm)</label>
            <input
              type="range"
              name="margin"
              value={settings.margin}
              onChange={handleSettingsChange}
              min="0"
              max="50"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-sm text-gray-600">{settings.margin}mm</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
            <input
              type="color"
              name="backgroundColor"
              value={settings.backgroundColor}
              onChange={handleSettingsChange}
              className="w-full h-10 rounded-md border-0 cursor-pointer"
            />
          </div>
        </div>

        {/* PDF Preview */}
        {pdfUrl && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">PDF Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-lg overflow-auto max-h-96">
              <Document file={pdfUrl}>
                <Page pageNumber={1} width={Math.min(400, window.innerWidth - 80)} />
              </Document>
            </div>
          </div>
        )}

        {!images.length && !pdfUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload images to start converting</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert multiple images to PDF</li>
            <li>Customizable page size, orientation, and margins</li>
            <li>Fit or fill image placement options</li>
            <li>Adjustable quality and background color</li>
            <li>Real-time preview and auto-download</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageToPDF;