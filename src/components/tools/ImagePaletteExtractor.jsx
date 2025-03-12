"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaCopy } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading palette

const ImagePaletteExtractor = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [colors, setColors] = useState([]);
  const [colorCount, setColorCount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [algorithm, setAlgorithm] = useState("kmeans"); // Added algorithm selection
  const canvasRef = useRef(null);
  const paletteRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setColors([]);
    }
  }, []);

  // Extract color palette
  const extractPalette = useCallback(() => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const maxSize = 100;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let extractedColors = [];
      if (algorithm === "kmeans") {
        // Improved K-means-like clustering
        const colorMap = new Map();
        for (let i = 0; i < data.length; i += 4) {
          const r = Math.round(data[i] / 10) * 10;
          const g = Math.round(data[i + 1] / 10) * 10;
          const b = Math.round(data[i + 2] / 10) * 10;
          const key = `${r},${g},${b}`;
          colorMap.set(key, (colorMap.get(key) || 0) + 1);
        }

        extractedColors = [...colorMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, colorCount)
          .map(([key]) => {
            const [r, g, b] = key.split(",").map(Number);
            return {
              rgb: `rgb(${r}, ${g}, ${b})`,
              hex: `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`,
            };
          });
      } else if (algorithm === "histogram") {
        // Simple histogram-based extraction
        const buckets = {};
        for (let i = 0; i < data.length; i += 4) {
          const r = Math.floor(data[i] / 32) * 32;
          const g = Math.floor(data[i + 1] / 32) * 32;
          const b = Math.floor(data[i + 2] / 32) * 32;
          const key = `${r},${g},${b}`;
          buckets[key] = (buckets[key] || 0) + 1;
        }

        extractedColors = Object.entries(buckets)
          .sort((a, b) => b[1] - a[1])
          .slice(0, colorCount)
          .map(([key]) => {
            const [r, g, b] = key.split(",").map(Number);
            return {
              rgb: `rgb(${r}, ${g}, ${b})`,
              hex: `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`,
            };
          });
      }

      setColors(extractedColors);
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, colorCount, algorithm]);

  // Copy color to clipboard
  const copyToClipboard = (color, type = "hex") => {
    const value = type === "hex" ? color.hex : color.rgb;
    navigator.clipboard.writeText(value);
    alert(`Copied ${value} to clipboard!`);
  };

  // Download palette as image
  const downloadPalette = () => {
    if (paletteRef.current) {
      html2canvas(paletteRef.current, { backgroundColor: "#ffffff" }).then((canvas) => {
        const link = document.createElement("a");
        link.download = `color-palette-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Reset everything
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setColors([]);
    setColorCount(5);
    setAlgorithm("kmeans");
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Palette Extractor
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Image Preview */}
              <div className="lg:col-span-2 relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                />
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Controls and Palette */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Colors ({colorCount})
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    value={colorCount}
                    onChange={(e) => setColorCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Algorithm
                  </label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={isProcessing}
                  >
                    <option value="kmeans">K-Means Clustering</option>
                    <option value="histogram">Histogram</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={extractPalette}
                    disabled={isProcessing}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <FaUpload className="mr-2" /> Extract Palette
                      </>
                    )}
                  </button>
                  <button
                    onClick={downloadPalette}
                    disabled={!colors.length || isProcessing}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <FaDownload className="mr-2" /> Download Palette
                  </button>
                </div>

                {/* Color Palette */}
                {colors.length > 0 && (
                  <div ref={paletteRef} className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Extracted Colors
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex items-center p-2 rounded-md border bg-white hover:shadow-md transition-shadow"
                        >
                          <div
                            className="w-10 h-10 rounded-md mr-3 flex-shrink-0"
                            style={{ backgroundColor: color.rgb }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{color.hex}</p>
                            <p className="text-xs text-gray-500">{color.rgb}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => copyToClipboard(color, "hex")}
                              className="p-1 text-gray-600 hover:text-blue-600"
                              title="Copy HEX"
                            >
                              <FaCopy />
                            </button>
                            <button
                              onClick={() => copyToClipboard(color, "rgb")}
                              className="p-1 text-gray-600 hover:text-blue-600"
                              title="Copy RGB"
                            >
                              <FaCopy />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              <button
                onClick={reset}
                className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to extract its color palette</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Extract dominant colors using K-Means or Histogram algorithms</li>
            <li>Adjustable number of colors (3-12)</li>
            <li>Copy HEX or RGB values to clipboard</li>
            <li>Download palette as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time preview and processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImagePaletteExtractor;