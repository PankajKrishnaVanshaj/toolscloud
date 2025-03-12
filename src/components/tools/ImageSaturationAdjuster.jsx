"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const ImageSaturationAdjuster = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saturation, setSaturation] = useState(100); // 100% = original
  const [brightness, setBrightness] = useState(100); // New: Brightness adjustment
  const [contrast, setContrast] = useState(100);    // New: Contrast adjustment
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef(null);
  const originalImageData = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setSaturation(100);
      setBrightness(100);
      setContrast(100);
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, []);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState = { saturation, brightness, contrast };
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      return newHistory.slice(-10); // Keep last 10 states
    });
    setHistoryIndex((prev) => prev + 1);
  }, [saturation, brightness, contrast, historyIndex]);

  // Adjust image properties (saturation, brightness, contrast)
  const adjustImage = (data, satLevel, brightLevel, contLevel) => {
    const newData = new Uint8ClampedArray(data.length);

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Apply contrast
      const contrastFactor = (259 * (contLevel + 255)) / (255 * (259 - contLevel));
      r = clamp((contrastFactor * (r - 128) + 128));
      g = clamp((contrastFactor * (g - 128) + 128));
      b = clamp((contrastFactor * (b - 128) + 128));

      // Apply brightness
      r = clamp(r * (brightLevel / 100));
      g = clamp(g * (brightLevel / 100));
      b = clamp(b * (brightLevel / 100));

      // Convert to HSL for saturation
      const max = Math.max(r, g, b) / 255;
      const min = Math.min(r, g, b) / 255;
      const l = (max + min) / 2;
      let s = 0;

      if (max !== min) {
        s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
      }

      // Adjust saturation
      s *= satLevel / 100;
      s = Math.min(1, Math.max(0, s));

      // Convert back to RGB
      let rNew, gNew, bNew;
      if (s === 0) {
        rNew = gNew = bNew = l * 255;
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        rNew = hueToRGB(p, q, (r / 255 + 1 / 3)) * 255;
        gNew = hueToRGB(p, q, (g / 255)) * 255;
        bNew = hueToRGB(p, q, (b / 255 - 1 / 3)) * 255;
      }

      newData[i] = rNew;
      newData[i + 1] = gNew;
      newData[i + 2] = bNew;
      newData[i + 3] = data[i + 3]; // Preserve alpha
    }

    return newData;
  };

  // Helper functions
  const hueToRGB = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const clamp = (value) => Math.max(0, Math.min(255, value));

  // Update canvas when adjustments change
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (!originalImageData.current) {
        originalImageData.current = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const adjustedData = adjustImage(originalImageData.current, saturation, brightness, contrast);
      ctx.putImageData(new ImageData(adjustedData, canvas.width, canvas.height), 0, 0);
      setPreviewUrl(canvas.toDataURL());
    };

    img.src = URL.createObjectURL(image);
  }, [image, saturation, brightness, contrast]);

  // Handle adjustment changes with history
  const handleAdjustChange = (setter) => (e) => {
    saveToHistory();
    setter(parseInt(e.target.value));
  };

  // Undo and Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setSaturation(prevState.saturation);
      setBrightness(prevState.brightness);
      setContrast(prevState.contrast);
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setSaturation(nextState.saturation);
      setBrightness(nextState.brightness);
      setContrast(nextState.contrast);
      setHistoryIndex((prev) => prev + 1);
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

  // Reset all adjustments
  const reset = () => {
    setSaturation(100);
    setBrightness(100);
    setContrast(100);
    setHistory([]);
    setHistoryIndex(-1);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setImage(null);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Saturation Adjuster</h1>

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
            </div>

            {/* Adjustment Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brightness ({brightness}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={handleAdjustChange(setBrightness)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
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
                  onChange={handleAdjustChange(setContrast)}
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
                <FaSync className="mr-2 rotate-180" /> Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Redo
              </button>
              <button
                onClick={reset}
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
                    <li
                      key={index}
                      className={index === history.length - 1 - historyIndex ? "font-bold" : ""}
                    >
                      {`Saturation: ${state.saturation}%, Brightness: ${state.brightness}%, Contrast: ${state.contrast}%`}
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
            <li>Adjust saturation, brightness, and contrast</li>
            <li>Undo/redo functionality with history</li>
            <li>Real-time preview</li>
            <li>Download adjusted image as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageSaturationAdjuster;