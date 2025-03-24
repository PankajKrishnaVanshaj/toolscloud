// components/ImageFrameAdder.jsx
"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaBorderAll } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const ImageFrameAdder = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [frameType, setFrameType] = useState("simple");
  const [frameWidth, setFrameWidth] = useState(20);
  const [frameColor, setFrameColor] = useState("#000000");
  const [shadow, setShadow] = useState(false);
  const [cornerStyle, setCornerStyle] = useState("square"); // New: corner style
  const [borderRadius, setBorderRadius] = useState(0); // New: border radius for rounded corners
  const [innerPadding, setInnerPadding] = useState(10); // New: padding between image and frame
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
    }
  }, []);

  // Add frame and render to canvas
  const addFrame = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const totalFrameWidth = frameWidth + innerPadding;
      canvas.width = img.width + totalFrameWidth * 2;
      canvas.height = img.height + totalFrameWidth * 2;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply corner style
      if (cornerStyle === "rounded" && borderRadius > 0) {
        ctx.beginPath();
        ctx.moveTo(borderRadius, 0);
        ctx.lineTo(canvas.width - borderRadius, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, borderRadius);
        ctx.lineTo(canvas.width, canvas.height - borderRadius);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - borderRadius, canvas.height);
        ctx.lineTo(borderRadius, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - borderRadius);
        ctx.lineTo(0, borderRadius);
        ctx.quadraticCurveTo(0, 0, borderRadius, 0);
        ctx.closePath();
        ctx.clip();
      }

      // Draw frame based on type
      switch (frameType) {
        case "simple":
          ctx.fillStyle = frameColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          break;
        case "gradient":
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, frameColor);
          gradient.addColorStop(1, adjustColor(frameColor, 50));
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          break;
        case "pattern":
          ctx.fillStyle = createPattern(ctx, frameColor);
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          break;
        case "double":
          ctx.fillStyle = frameColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = adjustColor(frameColor, -50);
          ctx.fillRect(frameWidth / 2, frameWidth / 2, canvas.width - frameWidth, canvas.height - frameWidth);
          break;
      }

      // Draw image with padding
      ctx.drawImage(img, totalFrameWidth, totalFrameWidth, img.width, img.height);

      // Update preview
      setPreviewUrl(canvas.toDataURL("image/png"));
    };

    img.src = previewUrl;
  }, [image, previewUrl, frameType, frameWidth, frameColor, cornerStyle, borderRadius, innerPadding]);

  // Helper function to adjust color lightness
  const adjustColor = (color, amount) => {
    const hex = color.replace("#", "");
    const r = Math.min(255, Math.max(0, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.min(255, Math.max(0, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.min(255, Math.max(0, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  // Helper function to create a simple pattern
  const createPattern = (ctx, color) => {
    const patternCanvas = document.createElement("canvas");
    const pctx = patternCanvas.getContext("2d");
    patternCanvas.width = 20;
    patternCanvas.height = 20;

    pctx.fillStyle = color;
    pctx.fillRect(0, 0, 10, 10);
    pctx.fillRect(10, 10, 10, 10);

    return ctx.createPattern(patternCanvas, "repeat");
  };

  // Download framed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `framed-image-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset all settings
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setFrameType("simple");
    setFrameWidth(20);
    setFrameColor("#000000");
    setShadow(false);
    setCornerStyle("square");
    setBorderRadius(0);
    setInnerPadding(10);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Frame Adder
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
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                style={{ boxShadow: shadow ? "0 4px 15px rgba(0, 0, 0, 0.3)" : "none" }}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frame Type</label>
                <select
                  value={frameType}
                  onChange={(e) => setFrameType(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="simple">Simple</option>
                  <option value="gradient">Gradient</option>
                  <option value="pattern">Pattern</option>
                  <option value="double">Double Layer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frame Width ({frameWidth}px)</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={frameWidth}
                  onChange={(e) => setFrameWidth(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frame Color</label>
                <input
                  type="color"
                  value={frameColor}
                  onChange={(e) => setFrameColor(e.target.value)}
                  className="w-full h-10 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corner Style</label>
                <select
                  value={cornerStyle}
                  onChange={(e) => setCornerStyle(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="square">Square</option>
                  <option value="rounded">Rounded</option>
                </select>
              </div>
              {cornerStyle === "rounded" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius ({borderRadius}px)</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inner Padding ({innerPadding}px)</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={innerPadding}
                  onChange={(e) => setInnerPadding(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={shadow}
                  onChange={(e) => setShadow(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Add Shadow</label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={addFrame}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaBorderAll className="mr-2" /> Apply Frame
              </button>
              <button
                onClick={downloadImage}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
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

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start adding a frame</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple frame types: Simple, Gradient, Pattern, Double Layer</li>
            <li>Customizable width, color, and inner padding</li>
            <li>Corner style options: Square or Rounded</li>
            <li>Optional shadow effect</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageFrameAdder;