"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaFileImage } from "react-icons/fa";
import html2canvas from "html2canvas"; // For fallback download method

const ImageConverter = () => {
  const [image, setImage] = useState(null);
  const [convertedImage, setConvertedImage] = useState(null);
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(0.8);
  const [resizeWidth, setResizeWidth] = useState("");
  const [resizeHeight, setResizeHeight] = useState("");
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [convertedSize, setConvertedSize] = useState(0);
  const canvasRef = useRef(null);
  const imgRef = useRef(new Image());
  const fileInputRef = useRef(null);

  const supportedFormats = {
    png: "image/png",
    jpg: "image/jpeg",
    webp: "image/webp",
    bmp: "image/bmp",
    gif: "image/gif",
    tiff: "image/tiff",
    ico: "image/x-icon",
  };

  // Handle image upload
  const handleImageUpload = useCallback((file) => {
    if (!file) return;

    setIsLoading(true);
    setError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setOriginalSize(file.size);
      setResizeWidth("");
      setResizeHeight("");
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError("Error reading image file");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInputChange = (e) => {
    handleImageUpload(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    } else {
      setError("Please drop a valid image file");
    }
  };

  // Convert image with resizing
  useEffect(() => {
    if (!image) return;

    const img = imgRef.current;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      let width = img.width;
      let height = img.height;

      // Apply resizing if specified
      if (resizeWidth || resizeHeight) {
        if (maintainAspect) {
          if (resizeWidth && !resizeHeight) {
            width = parseInt(resizeWidth);
            height = (img.height / img.width) * width;
          } else if (resizeHeight && !resizeWidth) {
            height = parseInt(resizeHeight);
            width = (img.width / img.height) * height;
          } else {
            width = parseInt(resizeWidth) || img.width;
            height = parseInt(resizeHeight) || img.height;
          }
        } else {
          width = parseInt(resizeWidth) || img.width;
          height = parseInt(resizeHeight) || img.height;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = supportedFormats[format] || "image/png";
      try {
        const convertedDataUrl = canvas.toDataURL(mimeType, quality);
        setConvertedImage(convertedDataUrl);

        fetch(convertedDataUrl)
          .then((res) => res.blob())
          .then((blob) => setConvertedSize(blob.size));
      } catch (err) {
        setError(`Conversion to ${format.toUpperCase()} failed: ${err.message}`);
        setConvertedImage(null);
      }
    };
    img.onerror = () => {
      setError("Error loading image for conversion");
      setConvertedImage(null);
    };
    img.src = image;
  }, [image, format, quality, resizeWidth, resizeHeight, maintainAspect]);

  // Handle download
  const handleDownload = () => {
    if (!convertedImage) return;

    const link = document.createElement("a");
    link.href = convertedImage;
    link.download = `converted-image-${Date.now()}.${format}`;
    link.click();
  };

  // Reset  Clear all
  const clearAll = () => {
    setImage(null);
    setConvertedImage(null);
    setFormat("png");
    setQuality(0.8);
    setResizeWidth("");
    setResizeHeight("");
    setMaintainAspect(true);
    setError("");
    setOriginalSize(0);
    setConvertedSize(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Converter</h2>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        )}

        {/* File Upload */}
        <div
          className={`mb-6 border-2 rounded-lg p-4 ${
            isDragging ? "border-dashed border-blue-500 bg-blue-50" : "border-gray-200"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            disabled={isLoading}
          />
          <p className="text-sm text-gray-600 mt-2">
            Drag and drop an image here or click to upload
          </p>
        </div>

        {image && (
          <div className="space-y-6">
            {/* Preview */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-2">Original</h3>
                <img
                  src={image}
                  alt="Original"
                  className="w-full max-h-60 object-contain rounded-lg border"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Size: {(originalSize / 1024).toFixed(2)} KB
                </p>
              </div>
              {convertedImage && (
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-2">Converted</h3>
                  <img
                    src={convertedImage}
                    alt="Converted"
                    className="w-full max-h-60 object-contain rounded-lg border"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Size: {(convertedSize / 1024).toFixed(2)} KB
                    {convertedSize < originalSize && (
                      <> (Reduced by {((1 - convertedSize / originalSize) * 100).toFixed(2)}%)</>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {Object.keys(supportedFormats).map((fmt) => (
                    <option key={fmt} value={fmt}>
                      {fmt.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              {(format === "jpg" || format === "webp") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quality ({Math.round(quality * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
                    disabled={isLoading}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                <input
                  type="number"
                  min="1"
                  value={resizeWidth}
                  onChange={(e) => setResizeWidth(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Original"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
                <input
                  type="number"
                  min="1"
                  value={resizeHeight}
                  onChange={(e) => setResizeHeight(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Original"
                  disabled={isLoading}
                />
                <label className="flex items-center mt-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={maintainAspect}
                    onChange={(e) => setMaintainAspect(e.target.checked)}
                    className="mr-2 accent-blue-500"
                    disabled={isLoading}
                  />
                  Maintain Aspect Ratio
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownload}
                disabled={!convertedImage || isLoading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={clearAll}
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        )}

        {!image && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start converting</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between multiple formats (PNG, JPG, WebP, etc.)</li>
            <li>Adjustable quality for JPG and WebP</li>
            <li>Resize with aspect ratio option</li>
            <li>Drag and drop support</li>
            <li>Size comparison</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default ImageConverter;