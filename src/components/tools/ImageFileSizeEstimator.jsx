"use client";
import React, { useState, useCallback } from "react";
import { FaInfoCircle, FaSync } from "react-icons/fa";

const AdvancedImageFileSizeEstimator = () => {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [bitDepth, setBitDepth] = useState(24);
  const [format, setFormat] = useState("png");
  const [compression, setCompression] = useState(80);
  const [complexity, setComplexity] = useState("medium");
  const [colorMode, setColorMode] = useState("rgb"); // rgb, grayscale, cmyk
  const [dpi, setDpi] = useState(72); // Dots per inch for print estimation
  const [gifFrames, setGifFrames] = useState(1); // Number of frames for GIF

  // Calculate estimated file sizes
  const calculateSizes = useCallback(() => {
    const pixelCount = width * height;
    const baseBitDepth = bitDepth * (colorMode === "cmyk" ? 4 : colorMode === "grayscale" ? 1 : 3);
    const rawSize = (pixelCount * baseBitDepth) / 8; // bytes
    const complexityFactors = { low: 0.7, medium: 1, high: 1.3 };
    const complexityFactor = complexityFactors[complexity];
    const compressionFactor = compression / 100;

    const estimates = {
      raw: rawSize,
      png: rawSize * (format === "png" ? 0.6 : 0.5) * complexityFactor * (colorMode === "grayscale" ? 0.8 : 1),
      jpg: rawSize * compressionFactor * 0.3 * complexityFactor * (colorMode === "cmyk" ? 1.2 : 1),
      webp: rawSize * compressionFactor * 0.25 * complexityFactor * (colorMode === "grayscale" ? 0.9 : 1),
      gif: rawSize * 0.8 * complexityFactor * gifFrames * (colorMode === "grayscale" ? 0.7 : 1),
    };

    return estimates;
  }, [width, height, bitDepth, format, compression, complexity, colorMode, gifFrames]);

  // Format bytes to human-readable string
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes.toFixed(1)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Reset to default values
  const reset = () => {
    setWidth(1920);
    setHeight(1080);
    setBitDepth(24);
    setFormat("png");
    setCompression(80);
    setComplexity("medium");
    setColorMode("rgb");
    setDpi(72);
    setGifFrames(1);
  };

  const sizes = calculateSizes();

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Advanced Image File Size Estimator
        </h1>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bit Depth</label>
            <select
              value={bitDepth}
              onChange={(e) => setBitDepth(parseInt(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={8}>8-bit</option>
              <option value={16}>16-bit</option>
              <option value={24}>24-bit</option>
              <option value={32}>32-bit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color Mode</label>
            <select
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="grayscale">Grayscale</option>
              <option value="rgb">RGB</option>
              <option value="cmyk">CMYK</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Format</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DPI</label>
            <input
              type="number"
              value={dpi}
              onChange={(e) => setDpi(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(format === "jpg" || format === "webp") && (
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compression Quality ({compression}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={compression}
                onChange={(e) => setCompression(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          )}

          {format === "gif" && (
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Frames ({gifFrames})
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={gifFrames}
                onChange={(e) => setGifFrames(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          )}

          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Complexity</label>
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
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Size Estimates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Raw (Uncompressed):</p>
              <p className="font-medium text-gray-800">{formatSize(sizes.raw)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">PNG:</p>
              <p className="font-medium text-gray-800">{formatSize(sizes.png)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">JPG/JPEG:</p>
              <p className="font-medium text-gray-800">{formatSize(sizes.jpg)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">WEBP:</p>
              <p className="font-medium text-gray-800">{formatSize(sizes.webp)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">GIF:</p>
              <p className="font-medium text-gray-800">{formatSize(sizes.gif)}</p>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={reset}
          className="w-full sm:w-auto py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center mx-auto"
        >
          <FaSync className="mr-2" /> Reset to Defaults
        </button>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
            <FaInfoCircle className="mr-2" /> About Estimates
          </h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Raw size based on width, height, bit depth, and color mode.</li>
            <li>Compressed sizes adjusted for format, compression, complexity, and GIF frames.</li>
            <li>DPI affects print quality but not file size directly.</li>
            <li>Actual sizes may vary due to specific compression algorithms and content.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdvancedImageFileSizeEstimator;