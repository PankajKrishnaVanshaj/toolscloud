// components/ImageVignetteTool.jsx
"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaSpinner } from "react-icons/fa";
import html2canvas from "html2canvas"; // For better download functionality

const ImageVignetteTool = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [vignetteSize, setVignetteSize] = useState(0.5);
  const [vignetteIntensity, setVignetteIntensity] = useState(0.7);
  const [vignetteColor, setVignetteColor] = useState("#000000");
  const [vignetteShape, setVignetteShape] = useState("circular"); // New: Shape option
  const [blur, setBlur] = useState(0); // New: Blur option
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

  // Apply vignette effect
  const applyVignette = useCallback(() => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Create vignette gradient
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

      if (vignetteShape === "circular") {
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          maxRadius * (1 - vignetteSize),
          centerX,
          centerY,
          maxRadius
        );
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, `${vignetteColor}${Math.floor(vignetteIntensity * 255).toString(16).padStart(2, '0')}`);
        ctx.fillStyle = gradient;
      } else {
        // Rectangular vignette
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(vignetteSize, `${vignetteColor}${Math.floor(vignetteIntensity * 255).toString(16).padStart(2, '0')}`);
        ctx.fillStyle = gradient;
      }

      // Apply blur if any
      if (blur > 0) {
        ctx.filter = `blur(${blur}px)`;
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Reset filter after applying
      ctx.filter = "none";

      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, vignetteSize, vignetteIntensity, vignetteColor, vignetteShape, blur]);

  // Download processed image
  const downloadImage = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `vignette-image-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }, []);

  // Reset to original
  const resetImage = useCallback(() => {
    setPreviewUrl(image ? URL.createObjectURL(image) : null);
    setVignetteSize(0.5);
    setVignetteIntensity(0.7);
    setVignetteColor("#000000");
    setVignetteShape("circular");
    setBlur(0);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [image]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Vignette Tool
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
                  <FaSpinner className="animate-spin text-blue-500 text-4xl" />
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vignette Size ({vignetteSize.toFixed(2)})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={vignetteSize}
                  onChange={(e) => setVignetteSize(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intensity ({vignetteIntensity.toFixed(2)})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={vignetteIntensity}
                  onChange={(e) => setVignetteIntensity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vignette Color
                </label>
                <input
                  type="color"
                  value={vignetteColor}
                  onChange={(e) => setVignetteColor(e.target.value)}
                  className="w-full h-10 rounded-md cursor-pointer"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vignette Shape
                </label>
                <select
                  value={vignetteShape}
                  onChange={(e) => setVignetteShape(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value="circular">Circular</option>
                  <option value="rectangular">Rectangular</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blur ({blur}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={blur}
                  onChange={(e) => setBlur(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={applyVignette}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Processing
                  </>
                ) : (
                  "Apply Vignette"
                )}
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
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              Adjust settings and click "Apply Vignette" to see the effect
            </p>
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjustable vignette size, intensity, and color</li>
            <li>Circular or rectangular vignette shapes</li>
            <li>Optional blur effect</li>
            <li>Real-time preview after applying</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageVignetteTool;