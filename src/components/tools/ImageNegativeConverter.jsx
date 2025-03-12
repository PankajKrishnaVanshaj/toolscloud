"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaCog } from "react-icons/fa";
import html2canvas from "html2canvas"; // For better download quality

const ImageNegativeConverter = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isConverted, setIsConverted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invertMode, setInvertMode] = useState("full"); // Full, RGB selective
  const [invertR, setInvertR] = useState(true);
  const [invertG, setInvertG] = useState(true);
  const [invertB, setInvertB] = useState(true);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setIsConverted(false);
    }
  }, []);

  // Convert to negative with options
  const convertToNegative = useCallback(() => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (invertMode === "full" || (invertMode === "selective" && invertR)) {
          data[i] = 255 - data[i]; // Red
        }
        if (invertMode === "full" || (invertMode === "selective" && invertG)) {
          data[i + 1] = 255 - data[i + 1]; // Green
        }
        if (invertMode === "full" || (invertMode === "selective" && invertB)) {
          data[i + 2] = 255 - data[i + 2]; // Blue
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsConverted(true);
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, invertMode, invertR, invertG, invertB]);

  // Reset to original
  const resetImage = () => {
    if (image) {
      setPreviewUrl(URL.createObjectURL(image));
      setIsConverted(false);
      setInvertMode("full");
      setInvertR(true);
      setInvertG(true);
      setInvertB(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Download converted image
  const downloadImage = useCallback(() => {
    if (!canvasRef.current || !isConverted) return;

    const link = document.createElement("a");
    link.download = `negative-image-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }, [isConverted]);

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Negative Converter
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
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain select-none"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invert Mode</label>
                <select
                  value={invertMode}
                  onChange={(e) => setInvertMode(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value="full">Full Color Invert</option>
                  <option value="selective">Selective RGB Invert</option>
                </select>
              </div>

              {invertMode === "selective" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Channels</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={invertR}
                        onChange={(e) => setInvertR(e.target.checked)}
                        className="mr-2 accent-red-500"
                        disabled={isProcessing}
                      />
                      Red
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={invertG}
                        onChange={(e) => setInvertG(e.target.checked)}
                        className="mr-2 accent-green-500"
                        disabled={isProcessing}
                      />
                      Green
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={invertB}
                        onChange={(e) => setInvertB(e.target.checked)}
                        className="mr-2 accent-blue-500"
                        disabled={isProcessing}
                      />
                      Blue
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={convertToNegative}
                disabled={isProcessing || (isConverted && invertMode === "full") || (invertMode === "selective" && !invertR && !invertG && !invertB)}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaCog className="mr-2" /> {isProcessing ? "Processing..." : "Convert"}
              </button>
              <button
                onClick={resetImage}
                disabled={!isConverted || isProcessing}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadImage}
                disabled={!isConverted || isProcessing}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start converting</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Full color inversion</li>
            <li>Selective RGB channel inversion</li>
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

export default ImageNegativeConverter;