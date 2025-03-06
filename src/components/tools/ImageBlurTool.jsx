// components/ImageBlurTool.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageBlurTool = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [blurType, setBlurType] = useState("gaussian");
  const [blurRadius, setBlurRadius] = useState(5);
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

  // Apply blur effect
  const applyBlur = () => {
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

      // Simple Gaussian blur implementation
      const gaussianBlur = (data, output, width, height, radius) => {
        const kernelSize = radius * 2 + 1;
        const kernel = Array(kernelSize).fill(1 / kernelSize);

        // Horizontal pass
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            for (let k = -radius; k <= radius; k++) {
              const nx = Math.min(Math.max(x + k, 0), width - 1);
              const pos = (y * width + nx) * 4;
              r += data[pos] * kernel[k + radius];
              g += data[pos + 1] * kernel[k + radius];
              b += data[pos + 2] * kernel[k + radius];
              a += data[pos + 3] * kernel[k + radius];
            }
            const outPos = (y * width + x) * 4;
            output[outPos] = r;
            output[outPos + 1] = g;
            output[outPos + 2] = b;
            output[outPos + 3] = a;
          }
        }

        // Vertical pass
        const tempData = new Uint8ClampedArray(output);
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            let r = 0, g = 0, b = 0, a = 0;
            for (let k = -radius; k <= radius; k++) {
              const ny = Math.min(Math.max(y + k, 0), height - 1);
              const pos = (ny * width + x) * 4;
              r += tempData[pos] * kernel[k + radius];
              g += tempData[pos + 1] * kernel[k + radius];
              b += tempData[pos + 2] * kernel[k + radius];
              a += tempData[pos + 3] * kernel[k + radius];
            }
            const outPos = (y * width + x) * 4;
            output[outPos] = r;
            output[outPos + 1] = g;
            output[outPos + 2] = b;
            output[outPos + 3] = a;
          }
        }
      };

      // Box blur (simple average)
      const boxBlur = (data, output, width, height, radius) => {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0, count = 0;
            for (let dy = -radius; dy <= radius; dy++) {
              for (let dx = -radius; dx <= radius; dx++) {
                const nx = Math.min(Math.max(x + dx, 0), width - 1);
                const ny = Math.min(Math.max(y + dy, 0), height - 1);
                const pos = (ny * width + nx) * 4;
                r += data[pos];
                g += data[pos + 1];
                b += data[pos + 2];
                a += data[pos + 3];
                count++;
              }
            }
            const outPos = (y * width + x) * 4;
            output[outPos] = r / count;
            output[outPos + 1] = g / count;
            output[outPos + 2] = b / count;
            output[outPos + 3] = a / count;
          }
        }
      };

      // Apply selected blur type
      if (blurType === "gaussian") {
        gaussianBlur(data, outputData, width, height, blurRadius);
      } else if (blurType === "box") {
        boxBlur(data, outputData, width, height, blurRadius);
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
    link.download = "blurred-image.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Blur Tool
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
                    Blur Type
                  </label>
                  <select
                    value={blurType}
                    onChange={(e) => setBlurType(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gaussian">Gaussian Blur</option>
                    <option value="box">Box Blur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blur Radius ({blurRadius}px)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={blurRadius}
                    onChange={(e) => setBlurRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:col-span-1">
                  <button
                    onClick={applyBlur}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Apply Blur"}
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
                Select blur type and radius, then click "Apply Blur" to process the image
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageBlurTool;