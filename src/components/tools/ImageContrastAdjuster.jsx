// components/ImageContrastAdjuster.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";

const ImageContrastAdjuster = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [contrast, setContrast] = useState(100); // 100% = original
  const [brightness, setBrightness] = useState(0); // 0 = original
  const canvasRef = useRef(null);
  const originalCanvasRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setContrast(100);
      setBrightness(0);
    }
  };

  // Apply contrast and brightness adjustments
  const adjustImage = () => {
    if (!image || !canvasRef.current || !originalCanvasRef.current) return;

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

      // Calculate contrast factor (contrast: 0-200%, where 100% is original)
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      
      // Apply contrast and brightness to each pixel
      for (let i = 0; i < data.length; i += 4) {
        // Contrast adjustment
        data[i] = factor * (data[i] - 128) + 128 + brightness;     // Red
        data[i + 1] = factor * (data[i + 1] - 128) + 128 + brightness; // Green
        data[i + 2] = factor * (data[i + 2] - 128) + 128 + brightness; // Blue
        
        // Clamp values to 0-255
        data[i] = Math.max(0, Math.min(255, data[i]));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
      }

      // Put adjusted data back
      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL());
    };
    
    img.src = URL.createObjectURL(image);
  };

  // Update preview when contrast or brightness changes
  useEffect(() => {
    if (image) {
      adjustImage();
    }
  }, [contrast, brightness, image]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "contrast-adjusted.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset to original values
  const resetAdjustments = () => {
    setContrast(100);
    setBrightness(0);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Contrast Adjuster
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contrast ({contrast}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brightness ({brightness})
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:col-span-1">
                  <button
                    onClick={resetAdjustments}
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
                Adjust contrast (0-200%) and brightness (-100 to 100) sliders to modify the image
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageContrastAdjuster;