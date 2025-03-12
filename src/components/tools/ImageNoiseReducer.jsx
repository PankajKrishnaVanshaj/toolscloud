"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const ImageNoiseReducer = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [blurRadius, setBlurRadius] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [method, setMethod] = useState("gaussian"); // Noise reduction method
  const [intensity, setIntensity] = useState(50); // For median filter strength
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
    }
  }, []);

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

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        kernel[y][x] /= sum;
      }
    }
    return kernel;
  };

  // Median filter helper
  const getMedian = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  // Apply noise reduction
  const reduceNoise = useCallback(() => {
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

      if (method === "gaussian") {
        const kernel = getGaussianKernel(blurRadius);
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
            outputData[pos + 3] = data[pos + 3];
          }
        }
      } else if (method === "median") {
        const radius = Math.floor(blurRadius / 2);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const pos = (y * width + x) * 4;
            const rValues = [], gValues = [], bValues = [];

            for (let ky = -radius; ky <= radius; ky++) {
              for (let kx = -radius; kx <= radius; kx++) {
                const ny = y + ky;
                const nx = x + kx;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const nPos = (ny * width + nx) * 4;
                  rValues.push(data[nPos]);
                  gValues.push(data[nPos + 1]);
                  bValues.push(data[nPos + 2]);
                }
              }
            }

            outputData[pos] = getMedian(rValues);
            outputData[pos + 1] = getMedian(gValues);
            outputData[pos + 2] = getMedian(bValues);
            outputData[pos + 3] = data[pos + 3];
          }
        }
      }

      ctx.putImageData(new ImageData(outputData, width, height), 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, blurRadius, method]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `noise-reduced-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset all settings
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setBlurRadius(3);
    setMethod("gaussian");
    setIntensity(50);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Noise Reducer</h1>

        {/* Upload Section */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {previewUrl && (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="relative flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
              />
              <canvas ref={canvasRef} className="hidden" />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gaussian">Gaussian Blur</option>
                  <option value="median">Median Filter</option>
                </select>
              </div>
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              {method === "median" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intensity ({intensity})
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    disabled={isProcessing}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={reduceNoise}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUpload className="mr-2" /> {isProcessing ? "Processing..." : "Reduce Noise"}
              </button>
              <button
                onClick={downloadImage}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={reset}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Choose a method and adjust settings to reduce image noise. Gaussian blur smooths the image, while median filter preserves edges.
            </p>
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start noise reduction</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Gaussian Blur and Median Filter methods</li>
            <li>Adjustable blur radius</li>
            <li>Intensity control for median filter</li>
            <li>Download processed image as PNG</li>
            <li>Real-time preview with processing indicator</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageNoiseReducer;