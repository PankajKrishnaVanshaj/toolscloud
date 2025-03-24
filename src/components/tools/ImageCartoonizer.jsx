"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const ImageCartoonizer = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [smoothness, setSmoothness] = useState(5);
  const [edgeStrength, setEdgeStrength] = useState(1);
  const [colorIntensity, setColorIntensity] = useState(1.5);
  const [posterizeLevels, setPosterizeLevels] = useState(8);
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

  // Enhanced bilateral filter with color consideration
  const applyBilateralFilter = (ctx, width, height, sigma) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const tempData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let rSum = 0, gSum = 0, bSum = 0, weightSum = 0;
        const i = (y * width + x) * 4;
        const r0 = tempData[i], g0 = tempData[i + 1], b0 = tempData[i + 2];

        for (let dy = -sigma; dy <= sigma; dy++) {
          for (let dx = -sigma; dx <= sigma; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const ni = (ny * width + nx) * 4;
              const r1 = tempData[ni], g1 = tempData[ni + 1], b1 = tempData[ni + 2];
              const colorDist = Math.sqrt((r1 - r0) ** 2 + (g1 - g0) ** 2 + (b1 - b0) ** 2);
              const spatialWeight = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
              const colorWeight = Math.exp(-colorDist / (2 * sigma * sigma));
              const weight = spatialWeight * colorWeight;
              rSum += r1 * weight;
              gSum += g1 * weight;
              bSum += b1 * weight;
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

  // Improved edge detection with Sobel operator
  const applyEdgeDetection = (ctx, width, height, strength) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const tempData = new Uint8ClampedArray(data);
    const grayscale = new Uint8ClampedArray(width * height);

    // Convert to grayscale for edge detection
    for (let i = 0; i < data.length; i += 4) {
      grayscale[i / 4] = 0.3 * tempData[i] + 0.59 * tempData[i + 1] + 0.11 * tempData[i + 2];
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        const gx =
          -grayscale[(y - 1) * width + (x - 1)] +
          grayscale[(y - 1) * width + (x + 1)] +
          -2 * grayscale[y * width + (x - 1)] +
          2 * grayscale[y * width + (x + 1)] +
          -grayscale[(y + 1) * width + (x - 1)] +
          grayscale[(y + 1) * width + (x + 1)];

        const gy =
          -grayscale[(y - 1) * width + (x - 1)] +
          -2 * grayscale[(y - 1) * width + x] +
          -grayscale[(y - 1) * width + (x + 1)] +
          grayscale[(y + 1) * width + (x - 1)] +
          2 * grayscale[(y + 1) * width + x] +
          grayscale[(y + 1) * width + (x + 1)];

        const magnitude = Math.sqrt(gx * gx + gy * gy) * strength;
        if (magnitude > 50) {
          data[i] = data[i + 1] = data[i + 2] = 0; // Black edges
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Posterize effect to reduce color palette
  const applyPosterize = (ctx, width, height, levels) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const levelSize = 255 / levels;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.floor(data[i] / levelSize) * levelSize * colorIntensity;
      data[i + 1] = Math.floor(data[i + 1] / levelSize) * levelSize * colorIntensity;
      data[i + 2] = Math.floor(data[i + 2] / levelSize) * levelSize * colorIntensity;
      data[i] = Math.min(data[i], 255);
      data[i + 1] = Math.min(data[i + 1], 255);
      data[i + 2] = Math.min(data[i + 2], 255);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Cartoonize image
  const cartoonizeImage = useCallback(() => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Apply effects
      applyBilateralFilter(ctx, canvas.width, canvas.height, smoothness);
      applyPosterize(ctx, canvas.width, canvas.height, posterizeLevels);
      applyEdgeDetection(ctx, canvas.width, canvas.height, edgeStrength);

      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, smoothness, edgeStrength, posterizeLevels, colorIntensity]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `cartoonized-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset all settings
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setSmoothness(5);
    setEdgeStrength(1);
    setColorIntensity(1.5);
    setPosterizeLevels(8);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Cartoonizer</h1>

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
            {/* Image Preview */}
            <div className="relative flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
              />
              <canvas ref={canvasRef} className="hidden" />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Intensity ({colorIntensity})
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={colorIntensity}
                  onChange={(e) => setColorIntensity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posterize Levels ({posterizeLevels})
                </label>
                <input
                  type="range"
                  min="4"
                  max="16"
                  value={posterizeLevels}
                  onChange={(e) => setPosterizeLevels(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={cartoonizeImage}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUpload className="mr-2" /> {isProcessing ? "Processing..." : "Cartoonize"}
              </button>
              <button
                onClick={downloadImage}
                disabled={isProcessing || !previewUrl}
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
            <p className="text-gray-500 italic">Upload an image to start cartoonizing</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjustable smoothness, edge strength, color intensity, and posterize levels</li>
            <li>Enhanced bilateral filter with color consideration</li>
            <li>Improved edge detection with Sobel operator</li>
            <li>Posterize effect for cartoon-like colors</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time preview with processing indicator</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default ImageCartoonizer;