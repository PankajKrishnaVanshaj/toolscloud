// components/ImageNegativeConverter.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageNegativeConverter = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isConverted, setIsConverted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setIsConverted(false);
    }
  };

  // Convert to negative
  const convertToNegative = () => {
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

      // Invert colors
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];         // Red
        data[i + 1] = 255 - data[i + 1]; // Green
        data[i + 2] = 255 - data[i + 2]; // Blue
        // Alpha (data[i + 3]) remains unchanged
      }

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setIsConverted(true);
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Reset to original
  const resetImage = () => {
    if (image) {
      setPreviewUrl(URL.createObjectURL(image));
      setIsConverted(false);
    }
  };

  // Download converted image
  const downloadImage = () => {
    if (!canvasRef.current || !isConverted) return;
    const link = document.createElement("a");
    link.download = "negative-image.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Negative Converter
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
                  className="max-w-full h-auto rounded-md select-none"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={convertToNegative}
                  disabled={isProcessing || isConverted}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? "Processing..." : "Convert to Negative"}
                </button>
                <button
                  onClick={resetImage}
                  disabled={!isConverted}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                >
                  Reset to Original
                </button>
                <button
                  onClick={downloadImage}
                  disabled={!isConverted}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                >
                  Download
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Convert your image to its negative version by inverting all colors
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageNegativeConverter;