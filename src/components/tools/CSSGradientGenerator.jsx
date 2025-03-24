"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaHistory, FaUndo, FaRandom } from "react-icons/fa";

const CSSGradientGenerator = () => {
  const [gradientType, setGradientType] = useState("linear"); // linear, radial
  const [colorCount, setColorCount] = useState(2);
  const [direction, setDirection] = useState("to right"); // For linear gradients
  const [angle, setAngle] = useState(90); // Custom angle in degrees for linear
  const [shape, setShape] = useState("circle"); // For radial gradients
  const [size, setSize] = useState("farthest-corner"); // Radial size
  const [colors, setColors] = useState([
    { value: "#FF6B6B", stop: 0 },
    { value: "#4ECDC4", stop: 100 },
  ]);
  const [gradientCSS, setGradientCSS] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const generateRandomColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
  };

  const generateGradient = useCallback(() => {
    const newColors = Array.from({ length: Math.min(colorCount, 5) }, (_, i) => ({
      value: generateRandomColor(),
      stop: Math.round((i / (Math.min(colorCount, 5) - 1)) * 100) || 0,
    }));
    setColors(newColors);

    let css = "";
    const colorString = newColors.map((c) => `${c.value} ${c.stop}%`).join(", ");
    if (gradientType === "linear") {
      css = `linear-gradient(${direction === "custom" ? `${angle}deg` : direction}, ${colorString})`;
    } else {
      css = `radial-gradient(${shape} ${size}, ${colorString})`;
    }

    setGradientCSS(css);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { css, colors: newColors, gradientType, direction, angle, shape, size },
    ].slice(-5));
  }, [gradientType, colorCount, direction, angle, shape, size]);

  const updateColor = (index, field, value) => {
    const newColors = [...colors];
    newColors[index][field] = field === "stop" ? Math.max(0, Math.min(100, Number(value))) : value;
    setColors(newColors);

    let css = "";
    const colorString = newColors.map((c) => `${c.value} ${c.stop}%`).join(", ");
    if (gradientType === "linear") {
      css = `linear-gradient(${direction === "custom" ? `${angle}deg` : direction}, ${colorString})`;
    } else {
      css = `radial-gradient(${shape} ${size}, ${colorString})`;
    }
    setGradientCSS(css);
  };

  const copyToClipboard = () => {
    if (!gradientCSS) return;
    navigator.clipboard
      .writeText(`background: ${gradientCSS};`)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const clearGradient = () => {
    setColors([{ value: "#FF6B6B", stop: 0 }, { value: "#4ECDC4", stop: 100 }]);
    setGradientCSS("");
    setIsCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setGradientCSS(entry.css);
    setColors(entry.colors);
    setGradientType(entry.gradientType);
    setDirection(entry.direction);
    setAngle(entry.angle);
    setShape(entry.shape);
    setSize(entry.size);
    setColorCount(entry.colors.length);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced CSS Gradient Generator
        </h1>

        <div className="space-y-6">
          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gradient Type
              </label>
              <select
                value={gradientType}
                onChange={(e) => setGradientType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Colors (2-5)
              </label>
              <input
                type="number"
                min="2"
                max="5"
                value={colorCount}
                onChange={(e) => setColorCount(Math.max(2, Math.min(5, Number(e.target.value) || 2)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Gradient Type Specific Options */}
          {gradientType === "linear" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direction
                </label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="to right">To Right</option>
                  <option value="to left">To Left</option>
                  <option value="to bottom">To Bottom</option>
                  <option value="to top">To Top</option>
                  <option value="to bottom right">To Bottom Right</option>
                  <option value="to bottom left">To Bottom Left</option>
                  <option value="to top right">To Top Right</option>
                  <option value="to top left">To Top Left</option>
                  <option value="custom">Custom Angle</option>
                </select>
              </div>
              {direction === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Angle (degrees)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={angle}
                    onChange={(e) => setAngle(Math.max(0, Math.min(360, Number(e.target.value) || 0)))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {gradientType === "radial" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shape
                </label>
                <select
                  value={shape}
                  onChange={(e) => setShape(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="circle">Circle</option>
                  <option value="ellipse">Ellipse</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="farthest-corner">Farthest Corner</option>
                  <option value="closest-side">Closest Side</option>
                  <option value="closest-corner">Closest Corner</option>
                  <option value="farthest-side">Farthest Side</option>
                </select>
              </div>
            </div>
          )}

          {/* Colors with Stops */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colors & Stops
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {colors.map((color, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={color.value}
                    onChange={(e) => updateColor(index, "value", e.target.value)}
                    className="w-12 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={color.stop}
                    onChange={(e) => updateColor(index, "stop", e.target.value)}
                    className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="%"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateGradient}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaRandom className="mr-2" />
              Generate Gradient
            </button>
            {gradientCSS && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy CSS"}
                </button>
                <button
                  onClick={clearGradient}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Preview and CSS */}
        {gradientCSS && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Gradient Preview:
              </h2>
              <div
                className="w-full h-40 rounded-md border border-gray-300"
                style={{ background: gradientCSS }}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                CSS Code:
              </h2>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                  {`background: ${gradientCSS};`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Gradients (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{entry.css.slice(0, 30)}...</span>
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
            <li>Linear and radial gradients with custom directions</li>
            <li>Adjustable color stops (0-100%)</li>
            <li>Custom angle for linear gradients</li>
            <li>Radial shape and size options</li>
            <li>Generate, copy, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CSSGradientGenerator;