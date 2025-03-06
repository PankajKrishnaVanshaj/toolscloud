// components/ImageOilPaintingConverter.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageOilPaintingConverter = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [brushSize, setBrushSize] = useState(4);
  const [intensity, setIntensity] = useState(20);
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

  // Convert to oil painting effect
  const convertToOilPainting = () => {
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

      // Create output image data (fixed typo here)
      const outputData = new Uint8ClampedArray(data.length);

      // Oil painting effect algorithm
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const intensities = new Array(256).fill(0);
          const rValues = new Array(256).fill(0);
          const gValues = new Array(256).fill(0);
          const bValues = new Array(256).fill(0);

          // Sample surrounding pixels
          for (let dy = -brushSize; dy <= brushSize; dy++) {
            for (let dx = -brushSize; dx <= brushSize; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const pos = (ny * width + nx) * 4;
                const r = data[pos];
                const g = data[pos + 1];
                const b = data[pos + 2];

                // Calculate intensity
                const intensityBin = Math.floor(((r + g + b) / 3) * intensity / 255);
                intensities[intensityBin]++;
                rValues[intensityBin] += r;
                gValues[intensityBin] += g;
                bValues[intensityBin] += b;
              }
            }
          }

          // Find most frequent intensity
          let maxIntensity = 0;
          let maxCount = 0;
          for (let i = 0; i < intensities.length; i++) {
            if (intensities[i] > maxCount) {
              maxCount = intensities[i];
              maxIntensity = i;
            }
          }

          // Set output pixel
          const pos = (y * width + x) * 4;
          outputData[pos] = rValues[maxIntensity] / maxCount;
          outputData[pos + 1] = gValues[maxIntensity] / maxCount;
          outputData[pos + 2] = bValues[maxIntensity] / maxCount;
          outputData[pos + 3] = data[pos + 3]; // Preserve alpha
        }
      }

      // Put processed data back
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
    link.download = "oil-painting.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Oil Painting Converter
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
                    Brush Size ({brushSize})
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intensity ({intensity})
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:col-span-1">
                  <button
                    onClick={convertToOilPainting}
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
                Adjust brush size and intensity, then click "Convert" to apply the oil painting effect
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageOilPaintingConverter;