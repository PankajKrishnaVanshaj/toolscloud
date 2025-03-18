"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaTrash, FaCopy, FaSync } from "react-icons/fa";

const ColorGradientInterpolator = () => {
  const [colors, setColors] = useState(["#FF6B6B", "#4ECDC4"]);
  const [steps, setSteps] = useState(5);
  const [gradient, setGradient] = useState([]);
  const [direction, setDirection] = useState("to right");
  const [gradientType, setGradientType] = useState("linear");

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
        .toUpperCase()
    );
  };

  // Interpolate between two colors
  const interpolateColor = useCallback((color1, color2, factor) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const r = rgb1.r + (rgb2.r - rgb1.r) * factor;
    const g = rgb1.g + (rgb2.g - rgb1.g) * factor;
    const b = rgb1.b + (rgb2.b - rgb1.b) * factor;
    return rgbToHex(r, g, b);
  }, []);

  // Generate gradient
  const generateGradient = useCallback(() => {
    if (colors.length < 2) return;

    const newGradient = [];
    const segments = colors.length - 1;
    const stepsPerSegment = Math.floor(steps / segments);

    for (let i = 0; i < segments; i++) {
      const startColor = colors[i];
      const endColor = colors[i + 1];
      for (
        let j = 0;
        j < (i === segments - 1 ? steps - (segments - 1) * stepsPerSegment : stepsPerSegment);
        j++
      ) {
        const factor = j / stepsPerSegment;
        newGradient.push(interpolateColor(startColor, endColor, factor));
      }
    }

    if (newGradient.length < steps) {
      newGradient.push(colors[colors.length - 1]);
    }

    setGradient(newGradient.slice(0, steps));
  }, [colors, steps, interpolateColor]);

  useEffect(() => {
    generateGradient();
  }, [colors, steps, generateGradient]);

  // Add a new color
  const addColor = () => {
    setColors([...colors, "#000000"]);
  };

  // Remove a color
  const removeColor = (index) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  // Update a color
  const updateColor = (index, value) => {
    const newColors = [...colors];
    newColors[index] = value.toUpperCase();
    setColors(newColors);
  };

  // Reset to default
  const reset = () => {
    setColors(["#FF6B6B", "#4ECDC4"]);
    setSteps(5);
    setDirection("to right");
    setGradientType("linear");
  };

  // Generate CSS gradient
  const getCssGradient = () => {
    if (gradientType === "linear") {
      return `linear-gradient(${direction}, ${gradient.join(", ")})`;
    } else {
      return `radial-gradient(circle, ${gradient.join(", ")})`;
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Gradient Interpolator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Controls */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Control Points</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase text-sm"
                    />
                    {colors.length > 2 && (
                      <button
                        onClick={() => removeColor(index)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addColor}
                className="mt-3 flex items-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaPlus /> Add Color
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Steps: {steps}
                </label>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={steps}
                  onChange={(e) => setSteps(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gradient Type
                </label>
                <select
                  value={gradientType}
                  onChange={(e) => setGradientType(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                </select>
              </div>
              {gradientType === "linear" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Direction
                  </label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="to right">To Right</option>
                    <option value="to left">To Left</option>
                    <option value="to bottom">To Bottom</option>
                    <option value="to top">To Top</option>
                    <option value="to bottom right">To Bottom Right</option>
                    <option value="to bottom left">To Bottom Left</option>
                    <option value="to top right">To Top Right</option>
                    <option value="to top left">To Top Left</option>
                  </select>
                </div>
              )}
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync /> Reset
              </button>
            </div>
          </div>

          {/* Gradient Display */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-700">Gradient Result</h2>
            <div
              className="h-40 rounded-lg shadow-inner transition-all duration-300"
              style={{ background: getCssGradient() }}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
              {gradient.map((color, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded shadow-md transition-transform hover:scale-105"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs mt-1 font-mono">{color}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(color)}
                    className="text-blue-500 text-xs hover:underline flex items-center gap-1"
                  >
                    <FaCopy /> Copy
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-700 mb-2">CSS Gradient</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded break-all font-mono">
                {getCssGradient()}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(getCssGradient())}
                className="mt-2 text-blue-500 hover:underline text-sm flex items-center gap-1"
              >
                <FaCopy /> Copy CSS
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple color control points</li>
            <li>Linear and radial gradient types</li>
            <li>Customizable direction for linear gradients</li>
            <li>Adjustable interpolation steps (2-50)</li>
            <li>Copyable color codes and CSS</li>
            <li>Hover effects and smooth transitions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorGradientInterpolator;