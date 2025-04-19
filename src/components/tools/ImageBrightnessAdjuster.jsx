"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const ImageBrightnessAdjuster = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [brightness, setBrightness] = useState(100); // 100% is original
  const [contrast, setContrast] = useState(100);     // 100% is original
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef(null);
  const originalCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setBrightness(100);
      setContrast(100);
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, []);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState = { brightness, contrast };
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      return newHistory.slice(-10); // Keep last 10 states
    });
    setHistoryIndex((prev) => prev + 1);
  }, [brightness, contrast, historyIndex]);

  // Apply brightness and contrast adjustments
  const adjustImage = useCallback(() => {
    if (!image || !canvasRef.current || !originalCanvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const originalCanvas = originalCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const originalCtx = originalCanvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      originalCanvas.width = img.width;
      originalCanvas.height = img.height;

      // Draw original image to hidden canvas
      originalCtx.drawImage(img, 0, 0);

      // Get image data
      const imageData = originalCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Adjust brightness and contrast
      const brightnessFactor = brightness / 100;
      const contrastFactor = (contrast / 100) * 2 - 1; // Map 0-200% to -1 to 3

      for (let i = 0; i < data.length; i += 4) {
        // Brightness
        let r = Math.min(255, Math.max(0, data[i] * brightnessFactor));
        let g = Math.min(255, Math.max(0, data[i + 1] * brightnessFactor));
        let b = Math.min(255, Math.max(0, data[i + 2] * brightnessFactor));

        // Contrast
        r = Math.min(255, Math.max(0, ((r / 255 - 0.5) * (contrastFactor + 1) + 0.5) * 255));
        g = Math.min(255, Math.max(0, ((g / 255 - 0.5) * (contrastFactor + 1) + 0.5) * 255));
        b = Math.min(255, Math.max(0, ((b / 255 - 0.5) * (contrastFactor + 1) + 0.5) * 255));

        data[i] = r;     // Red
        data[i + 1] = g; // Green
        data[i + 2] = b; // Blue
      }

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };
    img.src = URL.createObjectURL(image);
  }, [image, brightness, contrast]);

  // Update preview when adjustments change
  useEffect(() => {
    if (image) {
      adjustImage();
    }
  }, [brightness, contrast, adjustImage]);

  // Handle adjustment changes with history
  const handleAdjustChange = (setter, value) => {
    saveToHistory();
    setter(value);
  };

  // Undo and Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setBrightness(prevState.brightness);
      setContrast(prevState.contrast);
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setBrightness(nextState.brightness);
      setContrast(nextState.contrast);
      setHistoryIndex((prev) => prev + 1);
    }
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `adjusted-b${brightness}-c${contrast}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset to original
  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setHistory([]);
    setHistoryIndex(-1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Brightness & Contrast Adjuster</h1>

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
              <canvas ref={originalCanvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brightness ({brightness}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => handleAdjustChange(setBrightness, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contrast ({contrast}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => handleAdjustChange(setContrast, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0 || isProcessing}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2 rotate-180" /> Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1 || isProcessing}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Redo
              </button>
              <button
                onClick={resetAdjustments}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadImage}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Adjustment History</h3>
                <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                  {history.slice().reverse().map((state, index) => (
                    <li
                      key={index}
                      className={index === history.length - 1 - historyIndex ? "font-bold" : ""}
                    >
                      Brightness: {state.brightness}%, Contrast: {state.contrast}%
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start adjusting</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjust brightness and contrast (0-200%)</li>
            <li>Real-time preview</li>
            <li>Undo/redo functionality with history</li>
            <li>Download adjusted image as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageBrightnessAdjuster;