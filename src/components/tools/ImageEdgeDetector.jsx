// components/ImageEdgeDetector.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageEdgeDetector = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [threshold, setThreshold] = useState(50);
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

  // Sobel edge detection algorithm
  const detectEdges = () => {
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

      // Convert to grayscale and apply Sobel operator
      const grayscale = new Uint8ClampedArray(canvas.width * canvas.height);
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        grayscale[i / 4] = avg;
      }

      const width = canvas.width;
      const height = canvas.height;
      const edges = new Uint8ClampedArray(width * height);

      // Sobel kernels
      const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
      ];
      const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
      ];

      // Apply Sobel operator
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let pixelX = 0;
          let pixelY = 0;

          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx));
              pixelX += grayscale[idx] * sobelX[ky + 1][kx + 1];
              pixelY += grayscale[idx] * sobelY[ky + 1][kx + 1];
            }
          }

          const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
          edges[y * width + x] = magnitude > threshold ? 255 : 0;
        }
      }

      // Update image data with edges
      for (let i = 0; i < data.length; i += 4) {
        const idx = i / 4;
        const edgeValue = edges[idx];
        data[i] = edgeValue;     // Red
        data[i + 1] = edgeValue; // Green
        data[i + 2] = edgeValue; // Blue
        data[i + 3] = 255;       // Alpha
      }

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
    link.download = "edges-detected.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset to original image
  const resetImage = () => {
    setPreviewUrl(image ? URL.createObjectURL(image) : null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Edge Detector
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Edge Threshold ({threshold})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={detectEdges}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Detect Edges"}
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
                Adjust threshold and click "Detect Edges" to see edge outlines
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEdgeDetector;