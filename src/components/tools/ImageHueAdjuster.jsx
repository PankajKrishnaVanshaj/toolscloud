"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const ImageHueAdjuster = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
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
      resetAdjustments();
    }
  }, []);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState = { hue, saturation, lightness, contrast };
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      return newHistory.slice(-10); // Keep last 10 states
    });
    setHistoryIndex((prev) => prev + 1);
  }, [hue, saturation, lightness, contrast, historyIndex]);

  // Apply HSL and contrast adjustments
  const adjustImage = useCallback(() => {
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

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i] / 255;
        let g = data[i + 1] / 255;
        let b = data[i + 2] / 255;

        // Apply contrast first
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        r = factor * (r - 0.5) + 0.5;
        g = factor * (g - 0.5) + 0.5;
        b = factor * (b - 0.5) + 0.5;

        // Convert RGB to HSL
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
          h = s = 0; // achromatic
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }

        // Apply adjustments
        h = (h * 360 + hue) % 360 / 360;
        s = Math.min(1, Math.max(0, s * (saturation / 100)));
        l = Math.min(1, Math.max(0, l * (lightness / 100)));

        // Convert back to RGB
        let newR, newG, newB;
        if (s === 0) {
          newR = newG = newB = l; // achromatic
        } else {
          const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          };
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          newR = hue2rgb(p, q, h + 1/3);
          newG = hue2rgb(p, q, h);
          newB = hue2rgb(p, q, h - 1/3);
        }

        data[i] = Math.min(255, Math.max(0, newR * 255));
        data[i + 1] = Math.min(255, Math.max(0, newG * 255));
        data[i + 2] = Math.min(255, Math.max(0, newB * 255));
      }

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };

    img.src = URL.createObjectURL(image);
  }, [image, hue, saturation, lightness, contrast]);

  // Update preview when adjustments change
  useEffect(() => {
    if (image) {
      adjustImage();
    }
  }, [image, hue, saturation, lightness, contrast, adjustImage]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `hue-adjusted-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset adjustments
  const resetAdjustments = () => {
    setHue(0);
    setSaturation(100);
    setLightness(100);
    setContrast(100);
    setHistory([]);
    setHistoryIndex(-1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle adjustment change with history
  const handleAdjustChange = (setter) => (e) => {
    saveToHistory();
    setter(parseInt(e.target.value));
  };

  // Undo and Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setHue(prevState.hue);
      setSaturation(prevState.saturation);
      setLightness(prevState.lightness);
      setContrast(prevState.contrast);
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setHue(nextState.hue);
      setSaturation(nextState.saturation);
      setLightness(nextState.lightness);
      setContrast(nextState.contrast);
      setHistoryIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Hue Adjuster</h1>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Hue", value: hue, setter: setHue, min: -180, max: 180, unit: "°" },
                { label: "Saturation", value: saturation, setter: setSaturation, min: 0, max: 200, unit: "%" },
                { label: "Lightness", value: lightness, setter: setLightness, min: 0, max: 200, unit: "%" },
                { label: "Contrast", value: contrast, setter: setContrast, min: 0, max: 200, unit: "%" },
              ].map(({ label, value, setter, min, max, unit }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} ({value}{unit})
                  </label>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={handleAdjustChange(setter)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    disabled={isProcessing}
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0 || isProcessing}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2 rotate-90" /> Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1 || isProcessing}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2 -rotate-90" /> Redo
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
                    <li key={index} className={index === history.length - 1 - historyIndex ? "font-bold" : ""}>
                      Hue: {state.hue}°, Saturation: {state.saturation}%, Lightness: {state.lightness}%, Contrast: {state.contrast}%
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
            <li>Adjust hue, saturation, lightness, and contrast</li>
            <li>Undo/redo functionality with history</li>
            <li>Real-time preview with canvas processing</li>
            <li>Download adjusted image as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageHueAdjuster;