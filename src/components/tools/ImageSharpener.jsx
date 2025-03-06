// components/ImageSharpener.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageSharpener = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sharpness, setSharpness] = useState(1);
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

  // Sharpen image using convolution
  const sharpenImage = () => {
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

      // Sharpening kernel (Laplacian + original)
      const weight = sharpness;
      const kernel = [
        0, -weight, 0,
        -weight, 1 + 4 * weight, -weight,
        0, -weight, 0
      ];
      const kernelSum = kernel.reduce((a, b) => a + b, 0);

      const outputData = new Uint8ClampedArray(data.length);

      // Apply convolution
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let r = 0, g = 0, b = 0;

          // Apply kernel to surrounding pixels
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const pixelPos = ((y + ky) * width + (x + kx)) * 4;
              const kernelPos = (ky + 1) * 3 + (kx + 1);
              const weight = kernel[kernelPos];

              r += data[pixelPos] * weight;
              g += data[pixelPos + 1] * weight;
              b += data[pixelPos + 2] * weight;
            }
          }

          const pos = (y * width + x) * 4;
          outputData[pos] = Math.min(255, Math.max(0, r / kernelSum));
          outputData[pos + 1] = Math.min(255, Math.max(0, g / kernelSum));
          outputData[pos + 2] = Math.min(255, Math.max(0, b / kernelSum));
          outputData[pos + 3] = data[pos + 3]; // Preserve alpha
        }
      }

      // Copy edges unchanged
      for (let x = 0; x < width; x++) {
        const top = x * 4;
        const bottom = ((height - 1) * width + x) * 4;
        for (let i = 0; i < 4; i++) {
          outputData[top + i] = data[top + i];
          outputData[bottom + i] = data[bottom + i];
        }
      }
      for (let y = 0; y < height; y++) {
        const left = (y * width) * 4;
        const right = (y * width + width - 1) * 4;
        for (let i = 0; i < 4; i++) {
          outputData[left + i] = data[left + i];
          outputData[right + i] = data[right + i];
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
    link.download = "sharpened-image.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Sharpener
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
                    Sharpness ({sharpness.toFixed(1)})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={sharpness}
                    onChange={(e) => setSharpness(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:col-span-2">
                  <button
                    onClick={sharpenImage}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Sharpen"}
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
                Adjust sharpness and click "Sharpen" to enhance image details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSharpener;