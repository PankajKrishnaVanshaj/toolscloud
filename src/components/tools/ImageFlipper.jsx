// components/ImageFlipper.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageFlipper = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setFlipHorizontal(false);
      setFlipVertical(false);
    }
  };

  // Flip the image
  const flipImage = () => {
    if (!image || !canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Reset the canvas transformation
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Apply flipping transformations
      if (flipHorizontal && flipVertical) {
        ctx.scale(-1, -1);
        ctx.translate(-img.width, -img.height);
      } else if (flipHorizontal) {
        ctx.scale(-1, 1);
        ctx.translate(-img.width, 0);
      } else if (flipVertical) {
        ctx.scale(1, -1);
        ctx.translate(0, -img.height);
      }

      // Draw the image
      ctx.drawImage(img, 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Reset to original image
  const resetImage = () => {
    if (image) {
      setPreviewUrl(URL.createObjectURL(image));
      setFlipHorizontal(false);
      setFlipVertical(false);
    }
  };

  // Download flipped image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "flipped-image.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Flipper
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
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="flipHorizontal"
                      checked={flipHorizontal}
                      onChange={(e) => setFlipHorizontal(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="flipHorizontal" className="text-sm font-medium text-gray-700">
                      Flip Horizontal
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="flipVertical"
                      checked={flipVertical}
                      onChange={(e) => setFlipVertical(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="flipVertical" className="text-sm font-medium text-gray-700">
                      Flip Vertical
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={flipImage}
                    disabled={isProcessing || (!flipHorizontal && !flipVertical)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Apply Flip"}
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
                Select flip options and click "Apply Flip" to transform the image
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageFlipper;