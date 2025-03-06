// components/ImageFrameAdder.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageFrameAdder = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [frameType, setFrameType] = useState("simple");
  const [frameWidth, setFrameWidth] = useState(20);
  const [frameColor, setFrameColor] = useState("#000000");
  const [shadow, setShadow] = useState(false);
  const canvasRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
    }
  };

  // Add frame and render to canvas
  const addFrame = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const frameSize = frameWidth;
      canvas.width = img.width + frameSize * 2;
      canvas.height = img.height + frameSize * 2;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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
      }

      // Draw image in the center
      ctx.drawImage(img, frameSize, frameSize, img.width, img.height);

      // Add shadow if enabled
      if (shadow) {
        canvas.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.3)";
      } else {
        canvas.style.boxShadow = "none";
      }

      setPreviewUrl(canvas.toDataURL());
    };

    img.src = previewUrl;
  };

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
    link.download = "framed-image.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Frame Adder
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preview and Controls */}
          {previewUrl && (
            <div className="space-y-6">
              <div className="relative max-w-full mx-auto">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frame Type
                  </label>
                  <select
                    value={frameType}
                    onChange={(e) => setFrameType(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="simple">Simple</option>
                    <option value="gradient">Gradient</option>
                    <option value="pattern">Pattern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frame Width ({frameWidth}px)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={frameWidth}
                    onChange={(e) => setFrameWidth(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frame Color
                  </label>
                  <input
                    type="color"
                    value={frameColor}
                    onChange={(e) => setFrameColor(e.target.value)}
                    className="w-full h-10 rounded-md"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={shadow}
                    onChange={(e) => setShadow(e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Add Shadow
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={addFrame}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Apply Frame
                </button>
                <button
                  onClick={downloadImage}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageFrameAdder;