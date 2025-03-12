"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const ImageSharpener = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sharpness, setSharpness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setSharpness(1);
      setContrast(1);
    }
  }, []);

  // Sharpen and adjust image
  const processImage = useCallback(() => {
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

      // Sharpening kernel
      const weight = sharpness;
      const kernel = [
        0, -weight, 0,
        -weight, 1 + 4 * weight, -weight,
        0, -weight, 0,
      ];
      const kernelSum = kernel.reduce((a, b) => a + b, 0);

      const outputData = new Uint8ClampedArray(data.length);

      // Apply sharpening convolution
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let r = 0, g = 0, b = 0;

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
          outputData[pos + 3] = data[pos + 3];
        }
      }

      // Copy edges
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

      // Apply contrast adjustment
      for (let i = 0; i < outputData.length; i += 4) {
        outputData[i] = Math.min(255, Math.max(0, ((outputData[i] - 128) * contrast) + 128));     // Red
        outputData[i + 1] = Math.min(255, Math.max(0, ((outputData[i + 1] - 128) * contrast) + 128)); // Green
        outputData[i + 2] = Math.min(255, Math.max(0, ((outputData[i + 2] - 128) * contrast) + 128)); // Blue
      }

      ctx.putImageData(new ImageData(outputData, width, height), 0, 0);
      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };

    img.src = URL.createObjectURL(image);
  }, [image, sharpness, contrast]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `sharpened-image-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset to original state
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setSharpness(1);
    setContrast(1);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Sharpener</h1>

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
            {/* Preview */}
            <div className="flex justify-center relative">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sharpness ({sharpness.toFixed(1)})
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={sharpness}
                  onChange={(e) => setSharpness(parseFloat(e.target.value))}
                  disabled={isProcessing}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
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
                  disabled={isProcessing}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={processImage}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUpload className="mr-2" /> {isProcessing ? "Processing..." : "Sharpen"}
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
              Adjust sharpness and contrast, then click "Sharpen" to enhance image details
            </p>
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start sharpening</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Sharpen images using convolution</li>
            <li>Adjustable sharpness and contrast</li>
            <li>Real-time preview</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageSharpener;