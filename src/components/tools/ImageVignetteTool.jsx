// components/ImageVignetteTool.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageVignetteTool = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [vignetteSize, setVignetteSize] = useState(0.5);
  const [vignetteIntensity, setVignetteIntensity] = useState(0.7);
  const [vignetteColor, setVignetteColor] = useState("#000000");
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

  // Apply vignette effect
  const applyVignette = () => {
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
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        maxRadius * (1 - vignetteSize),
        centerX,
        centerY,
        maxRadius
      );

      // Apply vignette effect
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, `${vignetteColor}${Math.floor(vignetteIntensity * 255).toString(16).padStart(2, '0')}`);
      
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "vignette-image.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset to original
  const resetImage = () => {
    setPreviewUrl(image ? URL.createObjectURL(image) : null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Vignette Tool
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

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vignette Size ({vignetteSize.toFixed(2)})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={vignetteSize}
                    onChange={(e) => setVignetteSize(parseFloat(e.target.value))}
                    className="w-full"
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
                    step="0.1"
                    value={vignetteIntensity}
                    onChange={(e) => setVignetteIntensity(parseFloat(e.target.value))}
                    className="w-full"
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
                    className="w-full h-10 rounded-md"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:col-span-1">
                  <button
                    onClick={applyVignette}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Apply Vignette"}
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
              </div>

              <p className="text-sm text-gray-500">
                Adjust size, intensity, and color, then click "Apply Vignette" to see the effect
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageVignetteTool;