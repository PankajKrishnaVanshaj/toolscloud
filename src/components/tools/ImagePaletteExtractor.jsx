// components/ImagePaletteExtractor.jsx
"use client";
import React, { useState, useRef } from "react";

const ImagePaletteExtractor = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [colors, setColors] = useState([]);
  const [colorCount, setColorCount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setColors([]);
    }
  };

  // Extract color palette
  const extractPalette = () => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Scale down image for faster processing
      const maxSize = 100;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Simple k-means clustering for color extraction
      const colorMap = new Map();
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i] / 10) * 10;
        const g = Math.round(data[i + 1] / 10) * 10;
        const b = Math.round(data[i + 2] / 10) * 10;
        const key = `${r},${g},${b}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }

      // Sort by frequency and take top colors
      const sortedColors = [...colorMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, colorCount)
        .map(([key]) => {
          const [r, g, b] = key.split(',').map(Number);
          return {
            rgb: `rgb(${r}, ${g}, ${b})`,
            hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
          };
        });

      setColors(sortedColors);
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Copy color to clipboard
  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    alert(`Copied ${color} to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Palette Extractor
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Image Preview */}
                <div className="lg:col-span-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-auto rounded-md"
                  />
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
                      max="10"
                      value={colorCount}
                      onChange={(e) => setColorCount(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={extractPalette}
                    disabled={isProcessing}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Extract Palette"}
                  </button>

                  {/* Color Palette */}
                  {colors.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Extracted Colors
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {colors.map((color, index) => (
                          <div
                            key={index}
                            className="flex items-center p-2 rounded-md border cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => copyToClipboard(color.hex)}
                          >
                            <div
                              className="w-8 h-8 rounded-full mr-2"
                              style={{ backgroundColor: color.rgb }}
                            />
                            <div>
                              <p className="text-sm font-medium">{color.hex}</p>
                              <p className="text-xs text-gray-500">{color.rgb}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Upload an image and click "Extract Palette" to see dominant colors. Click a color to copy its HEX value.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePaletteExtractor;