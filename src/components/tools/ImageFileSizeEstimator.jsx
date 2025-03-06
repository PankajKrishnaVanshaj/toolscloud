// components/AdvancedImageFileSizeEstimator.jsx
"use client";
import React, { useState } from "react";

const AdvancedImageFileSizeEstimator = () => {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [bitDepth, setBitDepth] = useState(24);
  const [format, setFormat] = useState("png");
  const [compression, setCompression] = useState(80);
  const [complexity, setComplexity] = useState("medium"); // low, medium, high

  // Calculate estimated file sizes
  const calculateSizes = () => {
    const rawSize = (width * height * bitDepth) / 8; // bytes
    const complexityFactors = { low: 0.7, medium: 1, high: 1.3 };

    const estimates = {
      raw: rawSize,
      png: rawSize * (format === "png" ? 0.6 : 0.5) * complexityFactors[complexity],
      jpg: rawSize * (compression / 100) * 0.3 * complexityFactors[complexity],
      webp: rawSize * (compression / 100) * 0.25 * complexityFactors[complexity],
      gif: rawSize * 0.8 * complexityFactors[complexity], // Assuming simple animation or static
    };

    return estimates;
  };

  // Format bytes to human-readable string
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes.toFixed(1)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const sizes = calculateSizes();

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Advanced Image File Size Estimator
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Input Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value)))}
                min="1"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value)))}
                min="1"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Depth
              </label>
              <select
                value={bitDepth}
                onChange={(e) => setBitDepth(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={8}>8-bit (Grayscale)</option>
                <option value={24}>24-bit (RGB)</option>
                <option value={32}>32-bit (RGBA)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG/JPEG</option>
                <option value="webp">WEBP</option>
                <option value="gif">GIF</option>
              </select>
            </div>

            {(format === "jpg" || format === "webp") && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compression Quality ({compression}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={compression}
                  onChange={(e) => setCompression(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Complexity
              </label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low (Simple graphics)</option>
                <option value="medium">Medium (Typical photos)</option>
                <option value="high">High (Detailed images)</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Size Estimates
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Raw (Uncompressed):</p>
                <p className="font-medium">{formatSize(sizes.raw)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">PNG:</p>
                <p className="font-medium">{formatSize(sizes.png)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">JPG/JPEG:</p>
                <p className="font-medium">{formatSize(sizes.jpg)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">WEBP:</p>
                <p className="font-medium">{formatSize(sizes.webp)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">GIF:</p>
                <p className="font-medium">{formatSize(sizes.gif)}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Note: Estimates are approximate. Actual sizes vary based on content and compression algorithms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedImageFileSizeEstimator;