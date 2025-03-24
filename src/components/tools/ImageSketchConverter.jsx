"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const ImageSketchConverter = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [edgeStrength, setEdgeStrength] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [blurRadius, setBlurRadius] = useState(1);
  const [invert, setInvert] = useState(false);
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
      setIsProcessing(false);
    }
  }, []);

  // Convert to sketch effect
  const convertToSketch = useCallback(() => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply Gaussian blur first
      ctx.filter = `blur(${blurRadius}px)`;
      ctx.drawImage(img, 0, 0);
      ctx.filter = "none";

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;
      const outputData = new Uint8ClampedArray(data.length);

      // Edge detection with Sobel filter
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];

          let edge = 0;
          if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
            const px = [
              (0.2989 * data[((y-1) * width + (x-1)) * 4] + 0.5870 * data[((y-1) * width + (x-1)) * 4 + 1] + 0.1140 * data[((y-1) * width + (x-1)) * 4 + 2]),
              (0.2989 * data[((y-1) * width + x) * 4] + 0.5870 * data[((y-1) * width + x) * 4 + 1] + 0.1140 * data[((y-1) * width + x) * 4 + 2]),
              (0.2989 * data[((y-1) * width + (x+1)) * 4] + 0.5870 * data[((y-1) * width + (x+1)) * 4 + 1] + 0.1140 * data[((y-1) * width + (x+1)) * 4 + 2]),
              (0.2989 * data[(y * width + (x-1)) * 4] + 0.5870 * data[(y * width + (x-1)) * 4 + 1] + 0.1140 * data[(y * width + (x-1)) * 4 + 2]),
              gray,
              (0.2989 * data[(y * width + (x+1)) * 4] + 0.5870 * data[(y * width + (x+1)) * 4 + 1] + 0.1140 * data[(y * width + (x+1)) * 4 + 2]),
              (0.2989 * data[((y+1) * width + (x-1)) * 4] + 0.5870 * data[((y+1) * width + (x-1)) * 4 + 1] + 0.1140 * data[((y+1) * width + (x-1)) * 4 + 2]),
              (0.2989 * data[((y+1) * width + x) * 4] + 0.5870 * data[((y+1) * width + x) * 4 + 1] + 0.1140 * data[((y+1) * width + x) * 4 + 2]),
              (0.2989 * data[((y+1) * width + (x+1)) * 4] + 0.5870 * data[((y+1) * width + (x+1)) * 4 + 1] + 0.1140 * data[((y+1) * width + (x+1)) * 4 + 2])
            ];

            const sobelX = (-px[0] + px[2]) + (-2 * px[3] + 2 * px[5]) + (-px[6] + px[8]);
            const sobelY = (px[0] + 2 * px[1] + px[2]) + (-px[6] - 2 * px[7] - px[8]);
            edge = Math.sqrt(sobelX * sobelX + sobelY * sobelY) * edgeStrength;
          }

          const value = invert 
            ? Math.min(255, Math.max(0, edge * contrast))
            : Math.min(255, Math.max(0, (255 - edge) * contrast));
          
          outputData[i] = value;
          outputData[i + 1] = value;
          outputData[i + 2] = value;
          outputData[i + 3] = data[i + 3];
        }
      }

      ctx.putImageData(new ImageData(outputData, width, height), 0, 0);
      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, edgeStrength, contrast, blurRadius, invert]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `sketch-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset all settings
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setEdgeStrength(1);
    setContrast(1);
    setBlurRadius(1);
    setInvert(false);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Sketch Converter
        </h1>

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
            <div className="relative flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edge Strength ({edgeStrength.toFixed(1)})
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={edgeStrength}
                  onChange={(e) => setEdgeStrength(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contrast ({contrast.toFixed(1)})
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={contrast}
                  onChange={(e) => setContrast(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blur Radius ({blurRadius}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={blurRadius}
                  onChange={(e) => setBlurRadius(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invert Colors
                </label>
                <input
                  type="checkbox"
                  checked={invert}
                  onChange={(e) => setInvert(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={convertToSketch}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>Convert to Sketch</>
                )}
              </button>
              <button
                onClick={downloadImage}
                disabled={isProcessing || !previewUrl}
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
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start converting to sketch</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert images to pencil sketch effect</li>
            <li>Adjustable edge strength, contrast, and blur radius</li>
            <li>Invert colors option</li>
            <li>Real-time preview and download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageSketchConverter;