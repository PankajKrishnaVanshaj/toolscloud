"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaCrop } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const ImageResizer = () => {
  const [image, setImage] = useState(null);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [quality, setQuality] = useState(0.8); // JPEG quality
  const [format, setFormat] = useState("png"); // Output format
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [resizedImage, setResizedImage] = useState(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Render the image with transformations
  const renderImage = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const img = new Image();
    img.src = image;

    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
      `;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      setResizedImage(canvas.toDataURL(`image/${format}`, quality));
    };
  }, [
    image,
    width,
    height,
    brightness,
    contrast,
    saturation,
    rotation,
    flipHorizontal,
    flipVertical,
    format,
    quality,
  ]);

  useEffect(() => {
    renderImage();
  }, [renderImage]);

  // Handle width change with aspect ratio
  const handleWidthChange = (e) => {
    const newWidth = Math.max(10, parseInt(e.target.value) || 10);
    setWidth(newWidth);
    if (keepAspectRatio && originalWidth && originalHeight) {
      setHeight(Math.round((newWidth * originalHeight) / originalWidth));
    }
  };

  // Handle height change with aspect ratio
  const handleHeightChange = (e) => {
    const newHeight = Math.max(10, parseInt(e.target.value) || 10);
    setHeight(newHeight);
    if (keepAspectRatio && originalWidth && originalHeight) {
      setWidth(Math.round((newHeight * originalWidth) / originalHeight));
    }
  };

  // Download the resized image
  const handleDownload = () => {
    if (resizedImage) {
      const link = document.createElement("a");
      link.download = `resized-image-${Date.now()}.${format}`;
      link.href = resizedImage;
      link.click();
    }
  };

  // Reset all settings
  const handleReset = () => {
    setImage(null);
    setWidth(300);
    setHeight(300);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setQuality(0.8);
    setFormat("png");
    setResizedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Resizer & Editor</h1>

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
            {/* Image Preview */}
            <div className="flex justify-center">
              <img
                src={resizedImage}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                <input
                  type="number"
                  min="10"
                  value={width}
                  onChange={handleWidthChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
                <input
                  type="number"
                  min="10"
                  value={height}
                  onChange={handleHeightChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brightness ({brightness}%)</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contrast ({contrast}%)</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Saturation ({saturation}%)</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rotation ({rotation}°)</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality ({quality})</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={format === "png"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={keepAspectRatio}
                  onChange={() => setKeepAspectRatio(!keepAspectRatio)}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Keep Aspect Ratio</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={flipHorizontal}
                  onChange={() => setFlipHorizontal(!flipHorizontal)}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Flip Horizontal</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={flipVertical}
                  onChange={() => setFlipVertical(!flipVertical)}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Flip Vertical</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={handleDownload}
                disabled={!resizedImage}
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
            <p className="text-gray-500 italic">Upload an image to start resizing</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Resize with custom width and height</li>
            <li>Keep aspect ratio option</li>
            <li>Adjust brightness, contrast, and saturation</li>
            <li>Rotate and flip (horizontal/vertical)</li>
            <li>Choose output format (PNG/JPEG) and quality</li>
            <li>Real-time preview</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageResizer;