"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaUndo, FaRedo } from "react-icons/fa";

const ImageContrastAdjuster = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(0);
  const [saturation, setSaturation] = useState(100); // New: Saturation control
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef(null);
  const originalCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState = { contrast, brightness, saturation };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      return newHistory.slice(-10); // Keep last 10 states
    });
    setHistoryIndex(prev => prev + 1);
  }, [contrast, brightness, saturation, historyIndex]);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setContrast(100);
      setBrightness(0);
      setSaturation(100);
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, []);

  // Apply adjustments
  const adjustImage = useCallback(() => {
    if (!image || !canvasRef.current || !originalCanvasRef.current) return;

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

      originalCtx.drawImage(img, 0, 0);
      const imageData = originalCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Contrast factor
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      // Saturation factor (0-200%, where 100% is original)
      const saturationFactor = saturation / 100;

      for (let i = 0; i < data.length; i += 4) {
        // Contrast and brightness
        let r = factor * (data[i] - 128) + 128 + brightness;
        let g = factor * (data[i + 1] - 128) + 128 + brightness;
        let b = factor * (data[i + 2] - 128) + 128 + brightness;

        // Saturation (convert to grayscale then interpolate)
        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        r = gray + (r - gray) * saturationFactor;
        g = gray + (g - gray) * saturationFactor;
        b = gray + (b - gray) * saturationFactor;

        // Clamp values
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL("image/png"));
    };
    img.src = URL.createObjectURL(image);
  }, [image, contrast, brightness, saturation]);

  // Update preview on changes
  useEffect(() => {
    if (image) adjustImage();
  }, [contrast, brightness, saturation, image, adjustImage]);

  // Handle adjustment changes with history
  const handleAdjustChange = (setter) => (e) => {
    saveToHistory();
    setter(parseInt(e.target.value));
  };

  // Undo/Redo functionality
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setContrast(prevState.contrast);
      setBrightness(prevState.brightness);
      setSaturation(prevState.saturation);
      setHistoryIndex(prev => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setContrast(nextState.contrast);
      setBrightness(nextState.brightness);
      setSaturation(nextState.saturation);
      setHistoryIndex(prev => prev + 1);
    }
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `adjusted-image-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset to original
  const resetAdjustments = () => {
    setContrast(100);
    setBrightness(0);
    setSaturation(100);
    setHistory([]);
    setHistoryIndex(-1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Contrast Adjuster</h1>

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
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
              />
              <canvas ref={canvasRef} className="hidden" />
              <canvas ref={originalCanvasRef} className="hidden" />
            </div>

            {/* Adjustment Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contrast ({contrast}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={handleAdjustChange(setContrast)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brightness ({brightness})
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={brightness}
                  onChange={handleAdjustChange(setBrightness)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saturation ({saturation}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={handleAdjustChange(setSaturation)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUndo className="mr-2" /> Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaRedo className="mr-2" /> Redo
              </button>
              <button
                onClick={resetAdjustments}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadImage}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
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
                    <li key={index} className={index === history.length - 1 - historyIndex ? 'font-bold' : ''}>
                      {`Contrast: ${state.contrast}%, Brightness: ${state.brightness}, Saturation: ${state.saturation}%`}
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
            <li>Adjust contrast (0-200%), brightness (-100 to 100), and saturation (0-200%)</li>
            <li>Undo/redo functionality with history</li>
            <li>Real-time image preview</li>
            <li>Download adjusted image as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageContrastAdjuster;