// components/ImageDistortionTool.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageDistortionTool = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [distortionType, setDistortionType] = useState("wave");
  const [strength, setStrength] = useState(20);
  const [frequency, setFrequency] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
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

  // Apply distortion effect
  const applyDistortion = () => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;
      const outputData = new Uint8ClampedArray(data.length);

      // Copy original data
      for (let i = 0; i < data.length; i++) {
        outputData[i] = data[i];
      }

      // Apply distortion
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let newX = x;
          let newY = y;

          switch (distortionType) {
            case "wave":
              newX = x + Math.sin(y / frequency) * strength;
              newY = y + Math.cos(x / frequency) * strength;
              break;
            case "pinch":
              const centerX = width / 2;
              const centerY = height / 2;
              const dx = x - centerX;
              const dy = y - centerY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx);
              const pinchAmount = Math.exp(-distance / (strength * 10)) * frequency;
              newX = centerX + Math.cos(angle) * (distance - pinchAmount);
              newY = centerY + Math.sin(angle) * (distance - pinchAmount);
              break;
            case "bulge":
              const bulgeCenterX = width / 2;
              const bulgeCenterY = height / 2;
              const bdx = x - bulgeCenterX;
              const bdy = y - bulgeCenterY;
              const bulgeDistance = Math.sqrt(bdx * bdx + bdy * bdy);
              const bulgeAngle = Math.atan2(bdy, bdx);
              const bulgeAmount = (bulgeDistance / (strength * 10)) * frequency;
              newX = bulgeCenterX + Math.cos(bulgeAngle) * (bulgeDistance + bulgeAmount);
              newY = bulgeCenterY + Math.sin(bulgeAngle) * (bulgeDistance + bulgeAmount);
              break;
          }

          // Ensure new coordinates are within bounds
          newX = Math.max(0, Math.min(width - 1, Math.floor(newX)));
          newY = Math.max(0, Math.min(height - 1, Math.floor(newY)));

          // Copy pixel data
          const srcIndex = (y * width + x) * 4;
          const dstIndex = (newY * width + newX) * 4;
          outputData[srcIndex] = data[dstIndex];
          outputData[srcIndex + 1] = data[dstIndex + 1];
          outputData[srcIndex + 2] = data[dstIndex + 2];
          outputData[srcIndex + 3] = data[dstIndex + 3];
        }
      }

      ctx.putImageData(new ImageData(outputData, width, height), 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `distorted-${distortionType}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Distortion Tool
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

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distortion Type
                  </label>
                  <select
                    value={distortionType}
                    onChange={(e) => setDistortionType(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="wave">Wave</option>
                    <option value="pinch">Pinch</option>
                    <option value="bulge">Bulge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strength ({strength})
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={strength}
                    onChange={(e) => setStrength(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency ({frequency})
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={frequency}
                    onChange={(e) => setFrequency(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={applyDistortion}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Apply"}
                  </button>
                  <button
                    onClick={downloadImage}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Select distortion type and adjust parameters, then click "Apply"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageDistortionTool;