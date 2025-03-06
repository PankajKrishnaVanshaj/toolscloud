// components/ImagePixelator.jsx
"use client";
import React, { useState, useRef } from "react";

const ImagePixelator = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pixelSize, setPixelSize] = useState(10);
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

  // Apply pixelation effect
  const pixelateImage = () => {
    if (!image || !canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Pixelate
      for (let y = 0; y < canvas.height; y += pixelSize) {
        for (let x = 0; x < canvas.width; x += pixelSize) {
          // Get average color for this pixel block
          let r = 0, g = 0, b = 0, a = 0;
          let count = 0;

          for (let dy = 0; dy < pixelSize && y + dy < canvas.height; dy++) {
            for (let dx = 0; dx < pixelSize && x + dx < canvas.width; dx++) {
              const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
              r += data[idx];
              g += data[idx + 1];
              b += data[idx + 2];
              a += data[idx + 3];
              count++;
            }
          }

          // Calculate average
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          a = Math.floor(a / count);

          // Fill block with average color
          for (let dy = 0; dy < pixelSize && y + dy < canvas.height; dy++) {
            for (let dx = 0; dx < pixelSize && x + dx < canvas.width; dx++) {
              const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = a;
            }
          }
        }
      }

      // Put pixelated data back
      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "pixelated-image.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset to original image
  const resetImage = () => {
    if (image) {
      setPreviewUrl(URL.createObjectURL(image));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Pixelator
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pixel Size ({pixelSize}px)
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    value={pixelSize}
                    onChange={(e) => setPixelSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={pixelateImage}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Pixelate"}
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
                Adjust pixel size and click "Pixelate" to apply the effect
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePixelator;