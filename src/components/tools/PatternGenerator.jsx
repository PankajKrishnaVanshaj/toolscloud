"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaDownload, FaTrash, FaHistory, FaUndo, FaSync } from "react-icons/fa";

const PatternGenerator = () => {
  const [patternType, setPatternType] = useState("grid");
  const [size, setSize] = useState(20);
  const [primaryColor, setPrimaryColor] = useState("#4B5EAA");
  const [secondaryColor, setSecondaryColor] = useState("#DCE2F0");
  const [lineWidth, setLineWidth] = useState(2);
  const [rotation, setRotation] = useState(0); // Rotation in degrees
  const [opacity, setOpacity] = useState(1); // Opacity (0-1)
  const [history, setHistory] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    generatePattern();
  }, [patternType, size, primaryColor, secondaryColor, lineWidth, rotation, opacity]);

  const generatePattern = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear and fill background
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(0, 0, width, height);

    // Set drawing properties
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = opacity;

    // Apply rotation
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-width / 2, -height / 2);

    switch (patternType) {
      case "grid":
        for (let x = 0; x <= width; x += size) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y <= height; y += size) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        break;

      case "circles":
        for (let x = size / 2; x <= width; x += size) {
          for (let y = size / 2; y <= height; y += size) {
            ctx.beginPath();
            ctx.arc(x, y, size / 2 - lineWidth, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        break;

      case "waves":
        ctx.beginPath();
        for (let x = 0; x <= width; x += 5) {
          const y = height / 2 + Math.sin(x / size) * (height / 4);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        for (let x = 0; x <= width; x += 5) {
          const y = height / 2 + Math.cos(x / size) * (height / 4);
          ctx.beginPath();
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          ctx.stroke();
        }
        break;

      case "triangles":
        for (let x = 0; x <= width; x += size) {
          for (let y = 0; y <= height; y += size) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size / 2, y + size);
            ctx.lineTo(x - size / 2, y + size);
            ctx.closePath();
            ctx.stroke();
          }
        }
        break;

      case "dots":
        for (let x = size / 2; x <= width; x += size) {
          for (let y = size / 2; y <= height; y += size) {
            ctx.beginPath();
            ctx.arc(x, y, lineWidth, 0, Math.PI * 2);
            ctx.fillStyle = primaryColor;
            ctx.fill();
          }
        }
        break;

      default:
        break;
    }

    ctx.restore(); // Reset transformation
    setHistory((prev) => [
      ...prev,
      { patternType, size, primaryColor, secondaryColor, lineWidth, rotation, opacity },
    ].slice(-5));
  }, [patternType, size, primaryColor, secondaryColor, lineWidth, rotation, opacity]);

  const downloadAsImage = () => {
    const canvas = canvasRef.current;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `pattern-${Date.now()}.png`;
    link.click();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const restoreFromHistory = (entry) => {
    setPatternType(entry.patternType);
    setSize(entry.size);
    setPrimaryColor(entry.primaryColor);
    setSecondaryColor(entry.secondaryColor);
    setLineWidth(entry.lineWidth);
    setRotation(entry.rotation);
    setOpacity(entry.opacity);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Pattern Generator
        </h1>

        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pattern Type
              </label>
              <select
                value={patternType}
                onChange={(e) => setPatternType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="grid">Grid</option>
                <option value="circles">Circles</option>
                <option value="waves">Waves</option>
                <option value="triangles">Triangles</option>
                <option value="dots">Dots</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size (10-100)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={size}
                onChange={(e) => setSize(Math.max(10, Math.min(100, Number(e.target.value) || 10)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Line Width (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={lineWidth}
                onChange={(e) => setLineWidth(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rotation (0-360°)
              </label>
              <input
                type="number"
                min="0"
                max="360"
                value={rotation}
                onChange={(e) => setRotation(Math.max(0, Math.min(360, Number(e.target.value) || 0)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opacity (0-1)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(Math.max(0, Math.min(1, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generatePattern}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" />
              Generate
            </button>
            <button
              onClick={downloadAsImage}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              Download PNG
            </button>
            <button
              onClick={clearCanvas}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaTrash className="mr-2" />
              Clear
            </button>
          </div>

          {/* Canvas Preview */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Pattern Preview:</h2>
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-700 flex items-center">
                <FaHistory className="mr-2" /> Recent Patterns (Last 5)
              </h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-2">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>
                      {entry.patternType} (Size: {entry.size}, Rotation: {entry.rotation}°)
                    </span>
                    <button
                      onClick={() => restoreFromHistory(entry)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaUndo />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features Info */}
          <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
            <h3 className="font-semibold text-blue-700">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm">
              <li>Pattern types: Grid, Circles, Waves, Triangles, Dots</li>
              <li>Customizable size, colors, line width, rotation, and opacity</li>
              <li>Download as PNG and track recent patterns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternGenerator;