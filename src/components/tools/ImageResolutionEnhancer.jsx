// components/ImageResolutionEnhancer.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageResolutionEnhancer = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scaleFactor, setScaleFactor] = useState(2);
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

  // Enhance resolution
  const enhanceResolution = () => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Set canvas size to enhanced resolution
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Step 1: Basic upscaling with smooth interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Step 2: Apply sharpening filter
      const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
      const data = imageData.data;
      const sharpenedData = new Uint8ClampedArray(data.length);

      // Simple sharpening kernel
      const kernel = [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ];
      const kernelSum = 1;

      for (let y = 1; y < newHeight - 1; y++) {
        for (let x = 1; x < newWidth - 1; x++) {
          for (let c = 0; c < 3; c++) { // RGB channels
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
          // Copy alpha channel
          sharpenedData[(y * newWidth + x) * 4 + 3] = data[(y * newWidth + x) * 4 + 3];
        }
      }

      ctx.putImageData(new ImageData(sharpenedData, newWidth, newHeight), 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Download enhanced image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `enhanced-${scaleFactor}x.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Resolution Enhancer
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
              <div className="relative max-w-full mx-auto overflow-auto">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scale Factor ({scaleFactor}x)
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="4"
                    step="1"
                    value={scaleFactor}
                    onChange={(e) => setScaleFactor(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={enhanceResolution}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Enhance Resolution"}
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
                Select scale factor and click "Enhance Resolution" to process
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageResolutionEnhancer;