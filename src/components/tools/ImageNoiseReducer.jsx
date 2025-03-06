// components/ImageNoiseReducer.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageNoiseReducer = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [blurRadius, setBlurRadius] = useState(3);
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

  // Gaussian blur kernel generator
  const getGaussianKernel = (radius, sigma = radius / 3) => {
    const size = radius * 2 + 1;
    const kernel = new Array(size).fill(0).map(() => new Array(size).fill(0));
    let sum = 0;

    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma)) / (2 * Math.PI * sigma * sigma);
        kernel[y + radius][x + radius] = value;
        sum += value;
      }
    }

    // Normalize kernel
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        kernel[y][x] /= sum;
      }
    }

    return kernel;
  };

  // Apply noise reduction
  const reduceNoise = () => {
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
      const kernel = getGaussianKernel(blurRadius);

      // Apply Gaussian blur
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let r = 0, g = 0, b = 0;
          const pos = (y * width + x) * 4;

          for (let ky = 0; ky < kernel.length; ky++) {
            for (let kx = 0; kx < kernel[ky].length; kx++) {
              const ny = y + ky - blurRadius;
              const nx = x + kx - blurRadius;
              
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nPos = (ny * width + nx) * 4;
                const weight = kernel[ky][kx];
                r += data[nPos] * weight;
                g += data[nPos + 1] * weight;
                b += data[nPos + 2] * weight;
              }
            }
          }

          outputData[pos] = r;
          outputData[pos + 1] = g;
          outputData[pos + 2] = b;
          outputData[pos + 3] = data[pos + 3]; // Preserve alpha
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
    link.download = "noise-reduced.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Noise Reducer
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
                    Blur Radius ({blurRadius})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={blurRadius}
                    onChange={(e) => setBlurRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={reduceNoise}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Reduce Noise"}
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
                Adjust blur radius and click "Reduce Noise" to smooth out image noise
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageNoiseReducer;