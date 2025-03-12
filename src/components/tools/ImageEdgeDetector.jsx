// components/ImageEdgeDetector.jsx
"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaCog } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading

const ImageEdgeDetector = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [threshold, setThreshold] = useState(50);
  const [edgeType, setEdgeType] = useState("sobel"); // Sobel or Canny-like
  const [blurRadius, setBlurRadius] = useState(1); // For noise reduction
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

  // Edge detection function
  const detectEdges = useCallback(() => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Convert to grayscale
      const grayscale = new Uint8ClampedArray(width * height);
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        grayscale[i / 4] = avg;
      }

      // Apply Gaussian blur for noise reduction
      const blurred = applyGaussianBlur(grayscale, width, height, blurRadius);

      // Edge detection
      const edges = new Uint8ClampedArray(width * height);
      if (edgeType === "sobel") {
        applySobel(blurred, edges, width, height);
      } else {
        applyCanny(blurred, edges, width, height);
      }

      // Update image data with edges
      for (let i = 0; i < data.length; i += 4) {
        const edgeValue = edges[i / 4];
        data[i] = edgeValue;     // Red
        data[i + 1] = edgeValue; // Green
        data[i + 2] = edgeValue; // Blue
        data[i + 3] = 255;       // Alpha
      }

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, threshold, edgeType, blurRadius]);

  // Gaussian blur function
  const applyGaussianBlur = (data, width, height, radius) => {
    const output = new Uint8ClampedArray(data.length);
    const kernelSize = Math.max(1, Math.round(radius) * 2 + 1);
    const sigma = radius / 3;
    const kernel = createGaussianKernel(kernelSize, sigma);

    // Horizontal pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let weightSum = 0;
        for (let k = -radius; k <= radius; k++) {
          const idx = Math.min(Math.max(x + k, 0), width - 1) + y * width;
          const weight = kernel[k + radius];
          sum += data[idx] * weight;
          weightSum += weight;
        }
        output[y * width + x] = sum / weightSum;
      }
    }

    // Vertical pass
    const temp = new Uint8ClampedArray(output);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let weightSum = 0;
        for (let k = -radius; k <= radius; k++) {
          const idx = x + Math.min(Math.max(y + k, 0), height - 1) * width;
          const weight = kernel[k + radius];
          sum += temp[idx] * weight;
          weightSum += weight;
        }
        output[y * width + x] = sum / weightSum;
      }
    }
    return output;
  };

  const createGaussianKernel = (size, sigma) => {
    const kernel = new Array(size);
    const mean = Math.floor(size / 2);
    let sum = 0;
    for (let x = 0; x < size; x++) {
      const val = Math.exp(-((x - mean) ** 2) / (2 * sigma ** 2));
      kernel[x] = val;
      sum += val;
    }
    return kernel.map((val) => val / sum);
  };

  // Sobel edge detection
  const applySobel = (data, edges, width, height) => {
    const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let pixelX = 0;
        let pixelY = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = (y + ky) * width + (x + kx);
            pixelX += data[idx] * sobelX[ky + 1][kx + 1];
            pixelY += data[idx] * sobelY[ky + 1][kx + 1];
          }
        }
        const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
        edges[y * width + x] = magnitude > threshold ? 255 : 0;
      }
    }
  };

  // Simplified Canny-like edge detection
  const applyCanny = (data, edges, width, height) => {
    const lowThreshold = threshold * 0.4;
    const highThreshold = threshold;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let pixelX = 0;
        let pixelY = 0;
        const idx = y * width + x;
        pixelX = data[idx + 1] - data[idx - 1];
        pixelY = data[idx + width] - data[idx - width];
        const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
        edges[idx] = magnitude > highThreshold ? 255 : magnitude > lowThreshold ? 128 : 0;
      }
    }
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `edges-detected-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset to original image
  const resetImage = () => {
    setPreviewUrl(image ? URL.createObjectURL(image) : null);
    setThreshold(50);
    setBlurRadius(1);
    setEdgeType("sobel");
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Edge Detector
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
            {/* Image Preview */}
            <div className="flex justify-center relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain select-none"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Threshold ({threshold})
                </label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edge Detection Type
                </label>
                <select
                  value={edgeType}
                  onChange={(e) => setEdgeType(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value="sobel">Sobel</option>
                  <option value="canny">Canny-like</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blur Radius ({blurRadius})
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={blurRadius}
                  onChange={(e) => setBlurRadius(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={detectEdges}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaCog className="mr-2" /> {isProcessing ? "Processing..." : "Detect Edges"}
              </button>
              <button
                onClick={downloadImage}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={resetImage}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Adjust settings and click "Detect Edges" to outline image edges
            </p>
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start edge detection</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Sobel and Canny-like edge detection</li>
            <li>Adjustable threshold and blur radius</li>
            <li>Real-time preview</li>
            <li>Download processed image as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageEdgeDetector;