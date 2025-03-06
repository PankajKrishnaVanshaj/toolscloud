// components/ImageNoiseGenerator.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageNoiseGenerator = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [noiseType, setNoiseType] = useState("gaussian");
  const [noiseLevel, setNoiseLevel] = useState(50);
  const [monochrome, setMonochrome] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
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

  // Generate noise
  const generateNoise = () => {
    if (!canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (image) {
      // Process uploaded image
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        addNoise(ctx, img.width, img.height);
      };
      img.src = previewUrl;
    } else {
      // Generate pure noise
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      addNoise(ctx, canvasWidth, canvasHeight);
    }
  };

  // Add noise to canvas
  const addNoise = (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let noise;
      switch (noiseType) {
        case "gaussian":
          // Simple Gaussian noise approximation
          noise = (Math.random() - 0.5) * noiseLevel * 2;
          break;
        case "salt-pepper":
          // Salt and pepper noise
          const rand = Math.random();
          noise = rand < 0.05 ? -noiseLevel : (rand > 0.95 ? noiseLevel : 0);
          break;
        case "uniform":
          // Uniform noise
          noise = (Math.random() * noiseLevel) - (noiseLevel / 2);
          break;
        default:
          noise = 0;
      }

      if (image) {
        // Add noise to existing image
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = monochrome 
          ? data[i] 
          : Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = monochrome 
          ? data[i] 
          : Math.min(255, Math.max(0, data[i + 2] + noise));
      } else {
        // Generate pure noise pattern
        const base = Math.random() * 255;
        data[i] = Math.min(255, Math.max(0, base + noise));
        data[i + 1] = monochrome 
          ? data[i] 
          : Math.min(255, Math.max(0, base + noise));
        data[i + 2] = monochrome 
          ? data[i] 
          : Math.min(255, Math.max(0, base + noise));
      }
      data[i + 3] = 255; // Full opacity
    }

    ctx.putImageData(imageData, 0, 0);
    setPreviewUrl(canvas.toDataURL());
    setIsProcessing(false);
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `noise-image-${noiseType}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Noise Generator
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {!image && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width ({canvasWidth}px)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    value={canvasWidth}
                    onChange={(e) => setCanvasWidth(Math.min(2000, Math.max(100, parseInt(e.target.value))))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height ({canvasHeight}px)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    value={canvasHeight}
                    onChange={(e) => setCanvasHeight(Math.min(2000, Math.max(100, parseInt(e.target.value))))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </>
            )}
            {image && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Noise Type
              </label>
              <select
                value={noiseType}
                onChange={(e) => setNoiseType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="gaussian">Gaussian</option>
                <option value="salt-pepper">Salt & Pepper</option>
                <option value="uniform">Uniform</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Noise Level ({noiseLevel})
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={monochrome}
                  onChange={(e) => setMonochrome(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Monochrome</span>
              </label>
            </div>
          </div>

          {/* Preview and Buttons */}
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

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={generateNoise}
                  disabled={isProcessing}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? "Processing..." : image ? "Add Noise" : "Generate Noise"}
                </button>
                <button
                  onClick={downloadImage}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Download
                </button>
                {image && (
                  <button
                    onClick={() => {
                      setImage(null);
                      setPreviewUrl(null);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Clear Image
                  </button>
                )}
              </div>
            </div>
          )}

          {!previewUrl && (
            <div className="text-center text-gray-500">
              Upload an image or click "Generate Noise" to create a noise pattern
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageNoiseGenerator;