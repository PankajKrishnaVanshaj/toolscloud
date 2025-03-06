// components/ImageSketchConverter.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageSketchConverter = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [edgeStrength, setEdgeStrength] = useState(1);
  const [contrast, setContrast] = useState(1);
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

  // Convert to sketch effect
  const convertToSketch = () => {
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
      const width = canvas.width;
      const height = canvas.height;
      const outputData = new Uint8ClampedArray(data.length);

      // Convert to grayscale and detect edges
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;

          // Grayscale conversion
          const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];

          // Sobel edge detection
          let edge = 0;
          if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
            const px = [
              (0.2989 * data[((y-1) * width + (x-1)) * 4] + 0.5870 * data[((y-1) * width + (x-1)) * 4 + 1] + 0.1140 * data[((y-1) * width + (x-1)) * 4 + 2]),
              (0.2989 * data[((y-1) * width + x) * 4] + 0.5870 * data[((y-1) * width + x) * 4 + 1] + 0.1140 * data[((y-1) * width + x) * 4 + 2]),
              (0.2989 * data[((y-1) * width + (x+1)) * 4] + 0.5870 * data[((y-1) * width + (x+1)) * 4 + 1] + 0.1140 * data[((y-1) * width + (x+1)) * 4 + 2]),
              (0.2989 * data[(y * width + (x-1)) * 4] + 0.5870 * data[(y * width + (x-1)) * 4 + 1] + 0.1140 * data[(y * width + (x-1)) * 4 + 2]),
              (0.2989 * data[(y * width + x) * 4] + 0.5870 * data[(y * width + x) * 4 + 1] + 0.1140 * data[(y * width + x) * 4 + 2]),
              (0.2989 * data[(y * width + (x+1)) * 4] + 0.5870 * data[(y * width + (x+1)) * 4 + 1] + 0.1140 * data[(y * width + (x+1)) * 4 + 2]),
              (0.2989 * data[((y+1) * width + (x-1)) * 4] + 0.5870 * data[((y+1) * width + (x-1)) * 4 + 1] + 0.1140 * data[((y+1) * width + (x-1)) * 4 + 2]),
              (0.2989 * data[((y+1) * width + x) * 4] + 0.5870 * data[((y+1) * width + x) * 4 + 1] + 0.1140 * data[((y+1) * width + x) * 4 + 2]),
              (0.2989 * data[((y+1) * width + (x+1)) * 4] + 0.5870 * data[((y+1) * width + (x+1)) * 4 + 1] + 0.1140 * data[((y+1) * width + (x+1)) * 4 + 2])
            ];

            const sobelX = (-px[0] + px[2]) + (-2 * px[3] + 2 * px[5]) + (-px[6] + px[8]);
            const sobelY = (px[0] + 2 * px[1] + px[2]) + (-px[6] - 2 * px[7] - px[8]);
            edge = Math.sqrt(sobelX * sobelX + sobelY * sobelY) * edgeStrength;
          }

          // Apply contrast and create sketch effect
          const value = Math.min(255, Math.max(0, (255 - edge) * contrast));
          outputData[i] = value;
          outputData[i + 1] = value;
          outputData[i + 2] = value;
          outputData[i + 3] = data[i + 3]; // Preserve alpha
        }
      }

      ctx.putImageData(new ImageData(outputData, width, height), 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "sketch.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Sketch Converter
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
                    Edge Strength ({edgeStrength.toFixed(1)})
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={edgeStrength}
                    onChange={(e) => setEdgeStrength(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contrast ({contrast.toFixed(1)})
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={contrast}
                    onChange={(e) => setContrast(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:col-span-1">
                  <button
                    onClick={convertToSketch}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Convert"}
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
                Adjust edge strength and contrast, then click "Convert" to create sketch effect
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSketchConverter;