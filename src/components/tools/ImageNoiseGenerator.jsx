"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaCog } from "react-icons/fa";

const ImageNoiseGenerator = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [noiseType, setNoiseType] = useState("gaussian");
  const [noiseLevel, setNoiseLevel] = useState(50);
  const [monochrome, setMonochrome] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [isProcessing, setIsProcessing] = useState(false);
  const [frequency, setFrequency] = useState(1); // For Perlin noise
  const [opacity, setOpacity] = useState(1); // Noise layer opacity
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

  // Generate noise
  const generateNoise = useCallback(() => {
    if (!canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const processImage = () => {
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        addNoise(ctx, img.width, img.height);
      };
      img.src = previewUrl;
    };

    const generatePureNoise = () => {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      addNoise(ctx, canvasWidth, canvasHeight);
    };

    image ? processImage() : generatePureNoise();
  }, [image, previewUrl, noiseType, noiseLevel, monochrome, canvasWidth, canvasHeight, frequency, opacity]);

  // Add noise to canvas
  const addNoise = (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let noise;
      switch (noiseType) {
        case "gaussian":
          noise = (Math.random() - 0.5) * noiseLevel * 2;
          break;
        case "salt-pepper":
          const rand = Math.random();
          noise = rand < 0.05 ? -noiseLevel : rand > 0.95 ? noiseLevel : 0;
          break;
        case "uniform":
          noise = (Math.random() * noiseLevel) - noiseLevel / 2;
          break;
        case "perlin":
          // Simplified Perlin noise (basic implementation)
          const x = (i / 4) % width;
          const y = Math.floor((i / 4) / width);
          noise = (perlinNoise(x * frequency / 100, y * frequency / 100) - 0.5) * noiseLevel;
          break;
        default:
          noise = 0;
      }

      if (image) {
        data[i] = Math.min(255, Math.max(0, data[i] + noise * opacity));
        data[i + 1] = monochrome
          ? data[i]
          : Math.min(255, Math.max(0, data[i + 1] + noise * opacity));
        data[i + 2] = monochrome
          ? data[i]
          : Math.min(255, Math.max(0, data[i + 2] + noise * opacity));
      } else {
        const base = Math.random() * 255;
        data[i] = Math.min(255, Math.max(0, base + noise * opacity));
        data[i + 1] = monochrome
          ? data[i]
          : Math.min(255, Math.max(0, base + noise * opacity));
        data[i + 2] = monochrome
          ? data[i]
          : Math.min(255, Math.max(0, base + noise * opacity));
      }
      data[i + 3] = 255; // Full opacity
    }

    ctx.putImageData(imageData, 0, 0);
    setPreviewUrl(canvas.toDataURL());
    setIsProcessing(false);
  };

  // Simplified Perlin noise function (basic approximation)
  const perlinNoise = (x, y) => {
    const n = x + y * 57;
    const noise = Math.sin(n * 12.9898) * 43758.5453;
    return noise - Math.floor(noise); // Return value between 0 and 1
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `noise-image-${noiseType}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset all settings
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setNoiseType("gaussian");
    setNoiseLevel(50);
    setMonochrome(false);
    setCanvasWidth(800);
    setCanvasHeight(600);
    setFrequency(1);
    setOpacity(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Noise Generator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {!image && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Width ({canvasWidth}px)</label>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    value={canvasWidth}
                    onChange={(e) => setCanvasWidth(Math.min(2000, Math.max(100, parseInt(e.target.value))))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height ({canvasHeight}px)</label>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    value={canvasHeight}
                    onChange={(e) => setCanvasHeight(Math.min(2000, Math.max(100, parseInt(e.target.value))))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Noise Type</label>
              <select
                value={noiseType}
                onChange={(e) => setNoiseType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="gaussian">Gaussian</option>
                <option value="salt-pepper">Salt & Pepper</option>
                <option value="uniform">Uniform</option>
                <option value="perlin">Perlin (Basic)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Noise Level ({noiseLevel})</label>
              <input
                type="range"
                min="0"
                max="100"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            {noiseType === "perlin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency ({frequency})</label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={frequency}
                  onChange={(e) => setFrequency(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opacity ({opacity})</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={monochrome}
                  onChange={(e) => setMonochrome(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Monochrome</span>
              </label>
            </div>
          </div>

          {/* Preview and Buttons */}
          {previewUrl && (
            <div className="space-y-6">
              <div className="relative flex justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg shadow-md max-h-[70vh] object-contain"
                />
                <canvas ref={canvasRef} className="hidden" />
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={generateNoise}
                  disabled={isProcessing}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaCog className="mr-2" />
                  {isProcessing ? "Processing..." : image ? "Add Noise" : "Generate Noise"}
                </button>
                <button
                  onClick={downloadImage}
                  disabled={isProcessing}
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
              <p className="text-gray-500 italic">
                Upload an image or click "Generate Noise" to create a noise pattern
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Noise types: Gaussian, Salt & Pepper, Uniform, Perlin</li>
            <li>Adjustable noise level, frequency (Perlin), and opacity</li>
            <li>Monochrome option</li>
            <li>Custom canvas size for pure noise generation</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time processing with preview</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageNoiseGenerator;