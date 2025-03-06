// components/ImageCartoonizer.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageCartoonizer = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [smoothness, setSmoothness] = useState(5);
  const [edgeStrength, setEdgeStrength] = useState(1);
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

  // Simple bilateral filter approximation
  const applyBilateralFilter = (ctx, width, height, sigma) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const tempData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let rSum = 0, gSum = 0, bSum = 0, weightSum = 0;
        const i = (y * width + x) * 4;

        for (let dy = -sigma; dy <= sigma; dy++) {
          for (let dx = -sigma; dx <= sigma; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const ni = (ny * width + nx) * 4;
              const weight = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
              rSum += tempData[ni] * weight;
              gSum += tempData[ni + 1] * weight;
              bSum += tempData[ni + 2] * weight;
              weightSum += weight;
            }
          }
        }

        data[i] = rSum / weightSum;
        data[i + 1] = gSum / weightSum;
        data[i + 2] = bSum / weightSum;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Edge detection using Sobel operator
  const applyEdgeDetection = (ctx, width, height, strength) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const tempData = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        const gx = 
          -tempData[((y - 1) * width + (x - 1)) * 4] +
          tempData[((y - 1) * width + (x + 1)) * 4] +
          -2 * tempData[(y * width + (x - 1)) * 4] +
          2 * tempData[(y * width + (x + 1)) * 4] +
          -tempData[((y + 1) * width + (x - 1)) * 4] +
          tempData[((y + 1) * width + (x + 1)) * 4];
        
        const gy = 
          -tempData[((y - 1) * width + (x - 1)) * 4] +
          -2 * tempData[((y - 1) * width + x) * 4] +
          -tempData[((y - 1) * width + (x + 1)) * 4] +
          tempData[((y + 1) * width + (x - 1)) * 4] +
          2 * tempData[((y + 1) * width + x) * 4] +
          tempData[((y + 1) * width + (x + 1)) * 4];

        const magnitude = Math.sqrt(gx * gx + gy * gy) * strength;
        if (magnitude > 50) {
          data[i] = data[i + 1] = data[i + 2] = 0; // Black edges
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Cartoonize image
  const cartoonizeImage = () => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Apply bilateral filter for smoothing
      applyBilateralFilter(ctx, canvas.width, canvas.height, smoothness);
      
      // Apply edge detection
      applyEdgeDetection(ctx, canvas.width, canvas.height, edgeStrength);

      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "cartoonized.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Cartoonizer
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Smoothness ({smoothness})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={smoothness}
                    onChange={(e) => setSmoothness(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Edge Strength ({edgeStrength})
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={edgeStrength}
                    onChange={(e) => setEdgeStrength(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={cartoonizeImage}
                  disabled={isProcessing}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? "Processing..." : "Cartoonize"}
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

export default ImageCartoonizer;