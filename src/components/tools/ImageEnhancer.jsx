"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaUndo, FaRedo } from "react-icons/fa";

const ImageEnhancer = () => {
  const [image, setImage] = useState(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sharpen: 0,
    hueRotate: 0,
    grayscale: 0,
    invert: 0,
    blur: 0,
    sepia: 0,
    opacity: 100,
    dropShadowSize: 0,
    dropShadowColor: "#000000",
    vignette: 0,
    pixelate: 0,
    noise: 0,
  });
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target.result);
      reader.readAsDataURL(file);
    }
  }, []);

  // Load image dimensions
  useEffect(() => {
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        setOriginalSize({ width: img.width, height: img.height });
        setHistory([]);
        setHistoryIndex(-1);
        applyEnhancements();
      };
    }
  }, [image]);

  // Apply enhancements when filters change
  useEffect(() => {
    applyEnhancements();
  }, [filters]);

  const applyEnhancements = useCallback(() => {
    if (!canvasRef.current || !imgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;

    canvas.width = originalSize.width;
    canvas.height = originalSize.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply CSS filters
    ctx.filter = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      hue-rotate(${filters.hueRotate}deg)
      grayscale(${filters.grayscale}%)
      invert(${filters.invert}%)
      blur(${filters.blur}px)
      sepia(${filters.sepia}%)
      opacity(${filters.opacity / 100})
      drop-shadow(${filters.dropShadowSize}px ${filters.dropShadowSize}px ${filters.dropShadowSize}px ${filters.dropShadowColor})
    `;
    ctx.drawImage(img, 0, 0, originalSize.width, originalSize.height);

    // Apply vignette
    if (filters.vignette > 0) {
      const gradient = ctx.createRadialGradient(
        originalSize.width / 2,
        originalSize.height / 2,
        0,
        originalSize.width / 2,
        originalSize.height / 2,
        Math.max(originalSize.width, originalSize.height) / 2
      );
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, `rgba(0, 0, 0, ${filters.vignette / 100})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Apply pixelation
    if (filters.pixelate > 0) {
      const pixelSize = Math.max(1, Math.round(filters.pixelate));
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx.drawImage(canvas, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        tempCanvas,
        0,
        0,
        canvas.width / pixelSize,
        canvas.height / pixelSize
      );
      ctx.drawImage(
        canvas,
        0,
        0,
        canvas.width / pixelSize,
        canvas.height / pixelSize,
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    // Apply noise
    if (filters.noise > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const noiseLevel = filters.noise / 100;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * noiseLevel * 255;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);
    }
  }, [filters, originalSize]);

  // History management
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...filters });
    setHistory(newHistory.slice(-10)); // Keep last 10 states
    setHistoryIndex(newHistory.length - 1);
  }, [filters, history, historyIndex]);

  const handleFilterChange = (filter, value) => {
    saveToHistory();
    setFilters((prev) => ({ ...prev, [filter]: value }));
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setFilters(history[historyIndex - 1]);
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setFilters(history[historyIndex + 1]);
      setHistoryIndex((prev) => prev + 1);
    }
  };

  // Reset filters
  const resetFilters = () => {
    saveToHistory();
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      sharpen: 0,
      hueRotate: 0,
      grayscale: 0,
      invert: 0,
      blur: 0,
      sepia: 0,
      opacity: 100,
      dropShadowSize: 0,
      dropShadowColor: "#000000",
      vignette: 0,
      pixelate: 0,
      noise: 0,
    });
  };

  // Download enhanced image
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = `enhanced-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Enhancer</h2>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {image && (
          <div className="space-y-6">
            {/* Image Previews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Original Image</h3>
                <img
                  ref={imgRef}
                  src={image}
                  alt="Uploaded"
                  className="w-full max-h-80 object-contain rounded-lg shadow-md"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Size: {originalSize.width} x {originalSize.height}px
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Enhanced Image</h3>
                <canvas
                  ref={canvasRef}
                  className="w-full max-h-80 object-contain rounded-lg shadow-md"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "brightness", min: 0, max: 200, unit: "%" },
                { name: "contrast", min: 0, max: 200, unit: "%" },
                { name: "saturation", min: 0, max: 200, unit: "%" },
                { name: "hueRotate", min: -180, max: 180, unit: "deg" },
                { name: "grayscale", min: 0, max: 100, unit: "%" },
                { name: "invert", min: 0, max: 100, unit: "%" },
                { name: "blur", min: 0, max: 10, step: 0.1, unit: "px" },
                { name: "sepia", min: 0, max: 100, unit: "%" },
                { name: "opacity", min: 0, max: 100, unit: "%" },
                { name: "dropShadowSize", min: 0, max: 20, unit: "px" },
                { name: "vignette", min: 0, max: 100, unit: "%" },
                { name: "pixelate", min: 0, max: 20, unit: "px" },
                { name: "noise", min: 0, max: 100, unit: "%" },
              ].map(({ name, min, max, step = 1, unit }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {name.replace(/([A-Z])/g, " $1")} ({filters[name]}
                    {unit})
                  </label>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={filters[name]}
                    onChange={(e) => handleFilterChange(name, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  {name === "dropShadowColor" && (
                    <input
                      type="color"
                      value={filters.dropShadowColor}
                      onChange={(e) => handleFilterChange("dropShadowColor", e.target.value)}
                      className="w-full h-8 mt-2 rounded-md cursor-pointer"
                    />
                  )}
                </div>
              ))}
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
                onClick={resetFilters}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={handleDownload}
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
                      {Object.entries(state)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!image && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start enhancing</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple enhancement filters (brightness, contrast, etc.)</li>
            <li>Special effects: vignette, pixelate, noise</li>
            <li>Undo/redo functionality with history</li>
            <li>Real-time preview with original comparison</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageEnhancer;