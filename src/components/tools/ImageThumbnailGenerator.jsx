"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaPlus } from "react-icons/fa";
import JSZip from "jszip"; // For ZIP downloads
import { saveAs } from "file-saver"; // For saving the ZIP file

const ImageThumbnailGenerator = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(200);
  const [keepAspect, setKeepAspect] = useState(true);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("jpeg");
  const [isProcessing, setIsProcessing] = useState(false);
  const [customSizes, setCustomSizes] = useState([]); // For preset sizes
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setThumbnails([]);
    }
  }, []);

  // Generate thumbnail
  const generateThumbnail = useCallback(
    (customWidth, customHeight) => {
      if (!image || !canvasRef.current) return;

      setIsProcessing(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        let targetWidth = customWidth || parseInt(width);
        let targetHeight = customHeight || parseInt(height);

        if (keepAspect && !customWidth) {
          const aspectRatio = img.width / img.height;
          targetHeight = targetWidth / aspectRatio;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        const thumbnailUrl = canvas.toDataURL(mimeType, quality / 100);
        const sizeInKB = Math.round((thumbnailUrl.length * 3) / 4 / 1024);

        setThumbnails((prev) => [
          ...prev,
          { url: thumbnailUrl, width: targetWidth, height: targetHeight, size: sizeInKB, format },
        ]);
        setIsProcessing(false);
      };

      img.src = previewUrl;
    },
    [image, previewUrl, width, height, keepAspect, quality, format]
  );

  // Add custom size preset
  const addCustomSize = () => {
    setCustomSizes((prev) => [...prev, { width: parseInt(width), height: parseInt(height) }]);
  };

  // Generate thumbnails for all custom sizes
  const generateAllCustomSizes = () => {
    customSizes.forEach((size) => generateThumbnail(size.width, size.height));
  };

  // Download all thumbnails as ZIP
  const downloadAll = useCallback(() => {
    if (thumbnails.length === 0) return;

    const zip = new JSZip();
    thumbnails.forEach((thumb, index) => {
      const base64Data = thumb.url.split(",")[1];
      zip.file(`thumbnail-${index + 1}-${thumb.width}x${thumb.height}.${thumb.format}`, base64Data, {
        base64: true,
      });
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `thumbnails-${Date.now()}.zip`);
    });
  }, [thumbnails]);

  // Reset all settings
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setThumbnails([]);
    setWidth(200);
    setHeight(200);
    setKeepAspect(true);
    setQuality(80);
    setFormat("jpeg");
    setCustomSizes([]);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
          Image Thumbnail Generator
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Upload and Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {previewUrl && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={width}
                        onChange={(e) => setWidth(Math.max(1, e.target.value))}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={height}
                        onChange={(e) => setHeight(Math.max(1, e.target.value))}
                        disabled={keepAspect}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={keepAspect}
                        onChange={(e) => setKeepAspect(e.target.checked)}
                        className="rounded text-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Maintain Aspect Ratio
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quality ({quality}%)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format
                    </label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => generateThumbnail()}
                      disabled={isProcessing}
                      className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaPlus className="mr-2" />
                      {isProcessing ? "Generating..." : "Generate Thumbnail"}
                    </button>
                    <button
                      onClick={addCustomSize}
                      className="w-full flex items-center justify-center py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <FaPlus className="mr-2" /> Add to Presets
                    </button>
                    {customSizes.length > 0 && (
                      <>
                        <button
                          onClick={generateAllCustomSizes}
                          disabled={isProcessing}
                          className="w-full flex items-center justify-center py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          <FaPlus className="mr-2" /> Generate All Presets
                        </button>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">
                            Custom Presets
                          </h3>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {customSizes.map((size, index) => (
                              <li key={index}>
                                {size.width}x{size.height}px
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    {thumbnails.length > 0 && (
                      <button
                        onClick={downloadAll}
                        className="w-full flex items-center justify-center py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <FaDownload className="mr-2" /> Download All (ZIP)
                      </button>
                    )}
                    <button
                      onClick={reset}
                      className="w-full flex items-center justify-center py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <FaSync className="mr-2" /> Reset
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Preview and Results */}
            <div className="lg:col-span-2 space-y-6">
              {previewUrl && (
                <div>
                  <h2 className="text-lg font-semibold mb-2 text-gray-700">Original</h2>
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                  />
                </div>
              )}

              {thumbnails.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-2 text-gray-700">Thumbnails</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {thumbnails.map((thumb, index) => (
                      <div key={index} className="space-y-2">
                        <img
                          src={thumb.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-auto rounded-md border shadow-sm"
                        />
                        <p className="text-sm text-gray-600 text-center">
                          {thumb.width}x{thumb.height} - ~{thumb.size}KB ({thumb.format})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          {/* Features */}
          {previewUrl && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
              <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
                <li>Custom width, height, and quality settings</li>
                <li>Option to maintain aspect ratio</li>
                <li>Support for JPEG and PNG formats</li>
                <li>Custom size presets</li>
                <li>Batch generation and ZIP download</li>
                <li>Responsive design with Tailwind CSS</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageThumbnailGenerator;