// components/ImageTransparencyAdjuster.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageTransparencyAdjuster = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [globalOpacity, setGlobalOpacity] = useState(1);
  const [colorRange, setColorRange] = useState({
    r: 255,
    g: 255,
    b: 255,
    tolerance: 50,
    opacity: 0,
  });
  const [mode, setMode] = useState("global"); // "global" or "color"
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

  // Process transparency adjustment
  const adjustTransparency = () => {
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

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (mode === "global") {
          // Apply global opacity
          data[i + 3] = Math.floor(data[i + 3] * globalOpacity);
        } else {
          // Apply color range transparency
          const rDiff = Math.abs(r - colorRange.r);
          const gDiff = Math.abs(g - colorRange.g);
          const bDiff = Math.abs(b - colorRange.b);
          
          if (rDiff <= colorRange.tolerance && 
              gDiff <= colorRange.tolerance && 
              bDiff <= colorRange.tolerance) {
            data[i + 3] = Math.floor(data[i + 3] * colorRange.opacity);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "transparent-image.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset to original
  const resetImage = () => {
    setPreviewUrl(image ? URL.createObjectURL(image) : null);
    setGlobalOpacity(1);
    setColorRange({ r: 255, g: 255, b: 255, tolerance: 50, opacity: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Transparency Adjuster
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

              {/* Mode Selection */}
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setMode("global")}
                  className={`px-4 py-2 rounded-md ${mode === "global" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                  Global Opacity
                </button>
                <button
                  onClick={() => setMode("color")}
                  className={`px-4 py-2 rounded-md ${mode === "color" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                  Color Range
                </button>
              </div>

              {/* Controls */}
              {mode === "global" ? (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opacity ({globalOpacity.toFixed(2)})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={globalOpacity}
                      onChange={(e) => setGlobalOpacity(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Color
                    </label>
                    <input
                      type="color"
                      value={`#${((1 << 24) + (colorRange.r << 16) + (colorRange.g << 8) + colorRange.b).toString(16).slice(1)}`}
                      onChange={(e) => {
                        const hex = e.target.value.slice(1);
                        const r = parseInt(hex.slice(0, 2), 16);
                        const g = parseInt(hex.slice(2, 4), 16);
                        const b = parseInt(hex.slice(4, 6), 16);
                        setColorRange({ ...colorRange, r, g, b });
                      }}
                      className="w-full h-10 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tolerance ({colorRange.tolerance})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={colorRange.tolerance}
                      onChange={(e) => setColorRange({ ...colorRange, tolerance: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opacity ({colorRange.opacity.toFixed(2)})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={colorRange.opacity}
                      onChange={(e) => setColorRange({ ...colorRange, opacity: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={adjustTransparency}
                  disabled={isProcessing}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? "Processing..." : "Apply"}
                </button>
                <button
                  onClick={resetImage}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={downloadImage}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Download
                </button>
              </div>

              <p className="text-sm text-gray-500">
                {mode === "global" 
                  ? "Adjust overall image opacity" 
                  : "Select a color range to make transparent"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageTransparencyAdjuster;