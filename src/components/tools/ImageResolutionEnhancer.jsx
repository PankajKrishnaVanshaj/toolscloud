"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading

const ImageResolutionEnhancer = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(2);
  const [sharpenLevel, setSharpenLevel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancementMethod, setEnhancementMethod] = useState("basic");
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

  // Enhance resolution
  const enhanceResolution = useCallback(() => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Upscaling
      ctx.imageSmoothingEnabled = enhancementMethod === "high-quality";
      ctx.imageSmoothingQuality = enhancementMethod === "high-quality" ? "high" : "medium";
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Apply sharpening if enabled
      if (sharpenLevel > 0) {
        const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
        const data = imageData.data;
        const sharpenedData = new Uint8ClampedArray(data.length);

        // Adjustable sharpening kernel based on sharpenLevel
        const kernelStrength = sharpenLevel * 2 + 1; // 1 -> 5, 2 -> 7, 3 -> 9
        const kernel = [
          0, -sharpenLevel, 0,
          -sharpenLevel, kernelStrength, -sharpenLevel,
          0, -sharpenLevel, 0,
        ];
        const kernelSum = 1;

        for (let y = 1; y < newHeight - 1; y++) {
          for (let x = 1; x < newWidth - 1; x++) {
            for (let c = 0; c < 3; c++) {
              let sum = 0;
              for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                  const pixelIndex = ((y + ky) * newWidth + (x + kx)) * 4 + c;
                  sum += data[pixelIndex] * kernel[(ky + 1) * 3 + (kx + 1)];
                }
              }
              const index = (y * newWidth + x) * 4 + c;
              sharpenedData[index] = Math.min(255, Math.max(0, sum / kernelSum));
            }
            sharpenedData[(y * newWidth + x) * 4 + 3] = data[(y * newWidth + x) * 4 + 3];
          }
        }

        ctx.putImageData(new ImageData(sharpenedData, newWidth, newHeight), 0, 0);
      }

      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, scaleFactor, sharpenLevel, enhancementMethod]);

  // Download enhanced image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `enhanced-${scaleFactor}x-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset to initial state
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setScaleFactor(2);
    setSharpenLevel(1);
    setEnhancementMethod("basic");
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Resolution Enhancer
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
                className="max-w-full h-auto rounded-lg shadow-md max-h-[70vh] object-contain"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scale Factor ({scaleFactor}x)
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={scaleFactor}
                  onChange={(e) => setScaleFactor(parseInt(e.target.value))}
                  disabled={isProcessing}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sharpen Level ({sharpenLevel})
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={sharpenLevel}
                  onChange={(e) => setSharpenLevel(parseInt(e.target.value))}
                  disabled={isProcessing}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enhancement Method
                </label>
                <select
                  value={enhancementMethod}
                  onChange={(e) => setEnhancementMethod(e.target.value)}
                  disabled={isProcessing}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="high-quality">High Quality</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={enhanceResolution}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUpload className="mr-2" /> {isProcessing ? "Processing..." : "Enhance"}
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
            <p className="text-gray-500 italic">Upload an image to enhance its resolution</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjustable scale factor (2x to 8x)</li>
            <li>Customizable sharpening level</li>
            <li>Basic and High-Quality enhancement methods</li>
            <li>Download enhanced image as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time preview with processing indicator</li>
          </ul>
        </div>

       
      </div>
    </div>
  );
};

export default ImageResolutionEnhancer;