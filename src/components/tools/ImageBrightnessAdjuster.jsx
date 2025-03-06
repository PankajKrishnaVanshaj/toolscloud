// components/ImageBrightnessAdjuster.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";

const ImageBrightnessAdjuster = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [brightness, setBrightness] = useState(100); // 100% is original
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const originalCanvasRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setBrightness(100); // Reset brightness on new image
    }
  };

  // Apply brightness adjustment
  const adjustBrightness = () => {
    if (!image || !canvasRef.current || !originalCanvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const originalCanvas = originalCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const originalCtx = originalCanvas.getContext("2d");
    
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      originalCanvas.width = img.width;
      originalCanvas.height = img.height;

      // Draw original image to hidden canvas
      originalCtx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = originalCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Adjust brightness
      const factor = brightness / 100;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i] * factor));     // Red
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor)); // Green
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor)); // Blue
        // Alpha (data[i + 3]) remains unchanged
      }

      // Put adjusted data back
      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };
    
    img.src = URL.createObjectURL(image);
  };

  // Update preview when brightness changes
  useEffect(() => {
    if (image) {
      adjustBrightness();
    }
  }, [brightness]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `brightness-adjusted-${brightness}%.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset to original
  const resetBrightness = () => {
    setBrightness(100);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Brightness Adjuster
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
                <canvas ref={originalCanvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brightness ({brightness}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full"
                    disabled={isProcessing}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={resetBrightness}
                    disabled={isProcessing}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={downloadImage}
                    disabled={isProcessing}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Slide to adjust brightness (0-200%, where 100% is original)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageBrightnessAdjuster;