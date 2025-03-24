"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const ImageWatercolorConverter = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [colorSaturation, setColorSaturation] = useState(1.2);
  const [edgeDarkness, setEdgeDarkness] = useState(0.95);
  const [blurLevel, setBlurLevel] = useState(2);
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

  // Apply watercolor effect
  const applyWatercolorEffect = useCallback(() => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply watercolor-like effect
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;

          // Average nearby pixels for watercolor softness
          let r = 0, g = 0, b = 0, count = 0;
          for (let dy = -intensity; dy <= intensity; dy++) {
            for (let dx = -intensity; dx <= intensity; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                const ni = (ny * canvas.width + nx) * 4;
                r += data[ni];
                g += data[ni + 1];
                b += data[ni + 2];
                count++;
              }
            }
          }

          // Apply softened colors with saturation and randomization
          const avgR = (r / count) * colorSaturation * (0.9 + Math.random() * 0.2);
          const avgG = (g / count) * colorSaturation * (0.9 + Math.random() * 0.2);
          const avgB = (b / count) * colorSaturation * (0.9 + Math.random() * 0.2);

          data[i] = Math.min(255, avgR);
          data[i + 1] = Math.min(255, avgG);
          data[i + 2] = Math.min(255, avgB);

          // Edge detection and darkening
          const rightPixel = i + 4 < data.length ? data[i + 4] : data[i];
          const belowPixel = i + canvas.width * 4 < data.length ? data[i + canvas.width * 4] : data[i];
          if (
            Math.abs(data[i] - rightPixel) > 30 ||
            Math.abs(data[i] - belowPixel) > 30
          ) {
            data[i] *= edgeDarkness;
            data[i + 1] *= edgeDarkness;
            data[i + 2] *= edgeDarkness;
          }
        }
      }

      // Apply final softening and blur
      ctx.putImageData(imageData, 0, 0);
      ctx.filter = `blur(${blurLevel}px)`;
      ctx.drawImage(canvas, 0, 0);

      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, intensity, colorSaturation, edgeDarkness, blurLevel]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `watercolor-image-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset all settings
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setIntensity(5);
    setColorSaturation(1.2);
    setEdgeDarkness(0.95);
    setBlurLevel(2);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Watercolor Image Converter
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
            {/* Image Preview */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effect Intensity ({intensity})
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Saturation ({colorSaturation.toFixed(1)})
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={colorSaturation}
                  onChange={(e) => setColorSaturation(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edge Darkness ({edgeDarkness.toFixed(2)})
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="1"
                  step="0.01"
                  value={edgeDarkness}
                  onChange={(e) => setEdgeDarkness(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blur Level ({blurLevel}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={blurLevel}
                  onChange={(e) => setBlurLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={applyWatercolorEffect}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUpload className="mr-2" /> {isProcessing ? "Processing..." : "Apply Watercolor"}
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
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable watercolor effect with intensity control</li>
            <li>Adjustable color saturation and edge darkness</li>
            <li>Fine-tune blur level for softness</li>
            <li>Real-time preview with processing indicator</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default ImageWatercolorConverter;