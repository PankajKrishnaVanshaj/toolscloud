"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaBorderStyle } from "react-icons/fa";

const ImageBorderAdder = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [borderWidth, setBorderWidth] = useState(20);
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [cornerRadius, setCornerRadius] = useState(0);
  const [shadow, setShadow] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setIsProcessing(false);
    }
  }, []);

  // Apply border and generate preview
  const applyBorder = useCallback(() => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const newWidth = img.width + borderWidth * 2;
      const newHeight = img.height + borderWidth * 2;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, newWidth, newHeight);

      // Apply shadow if enabled
      if (shadow > 0) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = shadow;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
      }

      // Draw border with rounded corners
      ctx.beginPath();
      ctx.moveTo(borderWidth + cornerRadius, borderWidth);
      ctx.lineTo(newWidth - borderWidth - cornerRadius, borderWidth);
      ctx.quadraticCurveTo(newWidth - borderWidth, borderWidth, newWidth - borderWidth, borderWidth + cornerRadius);
      ctx.lineTo(newWidth - borderWidth, newHeight - borderWidth - cornerRadius);
      ctx.quadraticCurveTo(newWidth - borderWidth, newHeight - borderWidth, newWidth - borderWidth - cornerRadius, newHeight - borderWidth);
      ctx.lineTo(borderWidth + cornerRadius, newHeight - borderWidth);
      ctx.quadraticCurveTo(borderWidth, newHeight - borderWidth, borderWidth, newHeight - borderWidth - cornerRadius);
      ctx.lineTo(borderWidth, borderWidth + cornerRadius);
      ctx.quadraticCurveTo(borderWidth, borderWidth, borderWidth + cornerRadius, borderWidth);
      ctx.closePath();

      ctx.fillStyle = borderColor;
      ctx.fill();

      // Reset shadow for image
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Clip and draw image
      ctx.clip();
      ctx.drawImage(img, borderWidth, borderWidth, img.width, img.height);

      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };

    img.src = URL.createObjectURL(image);
  }, [image, borderWidth, borderColor, cornerRadius, shadow, backgroundColor]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `image-with-border-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset all settings
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setBorderWidth(20);
    setBorderColor("#000000");
    setBorderStyle("solid");
    setCornerRadius(0);
    setShadow(0);
    setBackgroundColor("#ffffff");
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Border Adder
        </h1>

        {/* Upload Section */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {previewUrl && (
          <div className="space-y-6">
            {/* Preview */}
            <div className="relative flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                style={{
                  border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                  borderRadius: `${cornerRadius}px`,
                  boxShadow: shadow > 0 ? `0 5px ${shadow}px rgba(0, 0, 0, 0.5)` : "none",
                }}
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Border Width ({borderWidth}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Border Color
                </label>
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="w-full h-10 rounded-md cursor-pointer"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Border Style
                </label>
                <select
                  value={borderStyle}
                  onChange={(e) => setBorderStyle(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corner Radius ({cornerRadius}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={cornerRadius}
                  onChange={(e) => setCornerRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shadow ({shadow}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={shadow}
                  onChange={(e) => setShadow(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 rounded-md cursor-pointer"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={applyBorder}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaBorderStyle className="mr-2" /> Apply Border
              </button>
              <button
                onClick={downloadImage}
                disabled={!previewUrl || isProcessing}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={reset}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to add a border</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable border width, color, and style</li>
            <li>Adjustable corner radius</li>
            <li>Drop shadow effect</li>
            <li>Background color selection</li>
            <li>Real-time preview with CSS</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageBorderAdder;