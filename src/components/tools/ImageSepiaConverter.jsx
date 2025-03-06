// components/ImageSepiaConverter.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageSepiaConverter = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sepiaIntensity, setSepiaIntensity] = useState(100);
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

  // Convert to sepia effect
  const convertToSepia = () => {
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

        // Calculate sepia values
        const tr = 0.393 * r + 0.769 * g + 0.189 * b;
        const tg = 0.349 * r + 0.686 * g + 0.168 * b;
        const tb = 0.272 * r + 0.534 * g + 0.131 * b;

        // Apply intensity and clamp values
        const intensity = sepiaIntensity / 100;
        data[i] = Math.min(255, r + (tr - r) * intensity);     // Red
        data[i + 1] = Math.min(255, g + (tg - g) * intensity); // Green
        data[i + 2] = Math.min(255, b + (tb - b) * intensity); // Blue
        // Alpha (data[i + 3]) remains unchanged
      }

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Reset to original image
  const resetImage = () => {
    if (image) {
      setPreviewUrl(URL.createObjectURL(image));
    }
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "sepia-image.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Sepia Image Converter
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sepia Intensity ({sepiaIntensity}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sepiaIntensity}
                    onChange={(e) => setSepiaIntensity(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={convertToSepia}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Apply Sepia"}
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
                Adjust sepia intensity and click "Apply Sepia" to convert the image
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSepiaConverter;