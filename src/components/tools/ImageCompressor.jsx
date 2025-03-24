"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const ImageCompressor = () => {
  const [image, setImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(0.7);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [outputFormat, setOutputFormat] = useState("image/jpeg");
  const [aspectRatio, setAspectRatio] = useState(true);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);
  const [applyGrayscale, setApplyGrayscale] = useState(false);
  const [applyInvert, setApplyInvert] = useState(false);
  const [compressionMode, setCompressionMode] = useState("balanced"); // New: fast, balanced, quality
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalSize(file.size);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          setWidth(img.width);
          setHeight(img.height);
          setOriginalAspectRatio(img.width / img.height);
          compressImage(img, img.width, img.height, quality);
        };
      };
      reader.readAsDataURL(file);
    }
  }, [quality]);

  // Compress image with options
  const compressImage = useCallback((img, newWidth, newHeight, newQuality) => {
    if (!canvasRef.current) return;
    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // Apply filters based on options
    if (applyGrayscale) {
      const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        imageData.data[i] = avg;
        imageData.data[i + 1] = avg;
        imageData.data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    if (applyInvert) {
      const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 255 - imageData.data[i];
        imageData.data[i + 1] = 255 - imageData.data[i + 1];
        imageData.data[i + 2] = 255 - imageData.data[i + 2];
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Adjust quality based on compression mode
    let adjustedQuality = newQuality;
    if (compressionMode === "fast") adjustedQuality = Math.max(0.3, newQuality - 0.2);
    if (compressionMode === "quality") adjustedQuality = Math.min(1.0, newQuality + 0.2);

    const compressedBase64 = canvas.toDataURL(outputFormat, adjustedQuality);
    setCompressedImage(compressedBase64);

    const base64Length = compressedBase64.length - `data:${outputFormat};base64,`.length;
    setCompressedSize(Math.floor((base64Length * 3) / 4));
    setIsProcessing(false);
  }, [outputFormat, applyGrayscale, applyInvert, compressionMode]);

  // Update compression on changes
  useEffect(() => {
    if (!image) return;
    const img = new Image();
    img.src = image;
    img.onload = () => compressImage(img, width, height, quality);
  }, [image, width, height, quality, outputFormat, applyGrayscale, applyInvert, compressionMode, compressImage]);

  // Handle width and height changes with aspect ratio
  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value, 10) || 0;
    if (aspectRatio && newWidth > 0) {
      setHeight(Math.round(newWidth / originalAspectRatio));
    }
    setWidth(newWidth);
  };

  const handleHeightChange = (e) => {
    const newHeight = parseInt(e.target.value, 10) || 0;
    if (aspectRatio && newHeight > 0) {
      setWidth(Math.round(newHeight * originalAspectRatio));
    }
    setHeight(newHeight);
  };

  // Download compressed image
  const handleDownload = () => {
    if (!compressedImage) return;
    const link = document.createElement("a");
    link.href = compressedImage;
    link.download = `compressed-image-${Date.now()}.${outputFormat.split("/")[1]}`;
    link.click();
  };

  // Reset to defaults
  const handleReset = () => {
    setImage(null);
    setCompressedImage(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setQuality(0.7);
    setWidth(0);
    setHeight(0);
    setOutputFormat("image/jpeg");
    setAspectRatio(true);
    setApplyGrayscale(false);
    setApplyInvert(false);
    setCompressionMode("balanced");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Format file size
  const formatSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1048576) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${(sizeInBytes / 1048576).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Compressor</h2>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {image && (
          <div className="space-y-6">
            {/* Image Previews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
              <div>
                <p className="text-sm text-gray-600 mb-2">Original ({formatSize(originalSize)})</p>
                <img
                  src={image}
                  alt="Original"
                  className="w-full h-auto max-h-64 object-contain rounded-lg shadow-md"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Compressed ({formatSize(compressedSize)})</p>
                <img
                  src={compressedImage}
                  alt="Compressed"
                  className="w-full h-auto max-h-64 object-contain rounded-lg shadow-md"
                />
              </div>
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality ({quality})</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                <input
                  type="number"
                  min="1"
                  value={width}
                  onChange={handleWidthChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
                <input
                  type="number"
                  min="1"
                  value={height}
                  onChange={handleHeightChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing || aspectRatio}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WEBP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compression Mode</label>
                <select
                  value={compressionMode}
                  onChange={(e) => setCompressionMode(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value="fast">Fast (Lower Quality)</option>
                  <option value="balanced">Balanced</option>
                  <option value="quality">High Quality</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={aspectRatio}
                  onChange={() => setAspectRatio(!aspectRatio)}
                  className="accent-blue-500"
                  disabled={isProcessing}
                />
                <span className="text-sm text-gray-700">Maintain Aspect Ratio</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={applyGrayscale}
                  onChange={() => setApplyGrayscale(!applyGrayscale)}
                  className="accent-blue-500"
                  disabled={isProcessing}
                />
                <span className="text-sm text-gray-700">Grayscale</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={applyInvert}
                  onChange={() => setApplyInvert(!applyInvert)}
                  className="accent-blue-500"
                  disabled={isProcessing}
                />
                <span className="text-sm text-gray-700">Invert Colors</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={handleDownload}
                disabled={!compressedImage || isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>
        )}

        {!image && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start compressing</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjustable compression quality and dimensions</li>
            <li>Multiple output formats (JPEG, PNG, WEBP)</li>
            <li>Aspect ratio preservation option</li>
            <li>Grayscale and invert filters</li>
            <li>Compression mode selection (Fast, Balanced, Quality)</li>
            <li>Real-time size comparison</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;