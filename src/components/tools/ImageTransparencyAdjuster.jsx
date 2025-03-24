"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaAdjust } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

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
  const [invertColorRange, setInvertColorRange] = useState(false); // New feature: invert selection
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

  // Process transparency adjustment
  const adjustTransparency = useCallback(() => {
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

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (mode === "global") {
          data[i + 3] = Math.floor(a * globalOpacity);
        } else {
          const rDiff = Math.abs(r - colorRange.r);
          const gDiff = Math.abs(g - colorRange.g);
          const bDiff = Math.abs(b - colorRange.b);
          const inRange = rDiff <= colorRange.tolerance && gDiff <= colorRange.tolerance && bDiff <= colorRange.tolerance;

          if (invertColorRange ? !inRange : inRange) {
            data[i + 3] = Math.floor(a * colorRange.opacity);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, mode, globalOpacity, colorRange, invertColorRange]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `transparent-image-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset to original
  const resetImage = () => {
    setPreviewUrl(image ? URL.createObjectURL(image) : null);
    setGlobalOpacity(1);
    setColorRange({ r: 255, g: 255, b: 255, tolerance: 50, opacity: 0 });
    setMode("global");
    setInvertColorRange(false);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Transparency Adjuster
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
            <div className="relative flex justify-center">
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

            {/* Mode Selection */}
            <div className="flex flex-wrap gap-4 mb-4 justify-center">
              <button
                onClick={() => setMode("global")}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  mode === "global" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaAdjust className="mr-2" /> Global Opacity
              </button>
              <button
                onClick={() => setMode("color")}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  mode === "color" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaAdjust className="mr-2" /> Color Range
              </button>
            </div>

            {/* Controls */}
            {mode === "global" ? (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Global Opacity ({globalOpacity.toFixed(2)})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={globalOpacity}
                    onChange={(e) => setGlobalOpacity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Color</label>
                  <input
                    type="color"
                    value={`#${((1 << 24) + (colorRange.r << 16) + (colorRange.g << 8) + colorRange.b)
                      .toString(16)
                      .slice(1)}`}
                    onChange={(e) => {
                      const hex = e.target.value.slice(1);
                      const r = parseInt(hex.slice(0, 2), 16);
                      const g = parseInt(hex.slice(2, 4), 16);
                      const b = parseInt(hex.slice(4, 6), 16);
                      setColorRange({ ...colorRange, r, g, b });
                    }}
                    className="w-full h-10 rounded-md cursor-pointer"
                    disabled={isProcessing}
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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    disabled={isProcessing}
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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invert Selection</label>
                  <input
                    type="checkbox"
                    checked={invertColorRange}
                    onChange={(e) => setInvertColorRange(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    disabled={isProcessing}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {invertColorRange ? "Affect outside range" : "Affect within range"}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={adjustTransparency}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaAdjust className="mr-2" /> {isProcessing ? "Processing..." : "Apply"}
              </button>
              <button
                onClick={resetImage}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadImage}
                disabled={isProcessing || !previewUrl}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              {mode === "global"
                ? "Adjust the overall transparency of the image"
                : "Make a specific color range transparent or semi-transparent"}
            </p>
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to adjust its transparency</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Global opacity adjustment</li>
            <li>Color range transparency with tolerance control</li>
            <li>Invert color range selection</li>
            <li>Real-time preview and download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageTransparencyAdjuster;