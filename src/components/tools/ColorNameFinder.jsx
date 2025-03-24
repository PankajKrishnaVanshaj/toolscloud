"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaPalette } from "react-icons/fa";

// Extended color list with more shades
const colorNames = [
  { name: "Red", hex: "#FF0000" },
  { name: "Green", hex: "#00FF00" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Cyan", hex: "#00FFFF" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#808080" },
  { name: "Purple", hex: "#800080" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Pink", hex: "#FFC1CC" },
  { name: "Brown", hex: "#A52A2A" },
  { name: "Lime", hex: "#00FF00" },
  { name: "Teal", hex: "#008080" },
  { name: "Navy", hex: "#000080" },
  { name: "Olive", hex: "#808000" },
  { name: "Maroon", hex: "#800000" },
  { name: "Violet", hex: "#EE82EE" },
  { name: "Turquoise", hex: "#40E0D0" },
  { name: "LightGray", hex: "#D3D3D3" },
  { name: "DarkRed", hex: "#8B0000" },
  { name: "SkyBlue", hex: "#87CEEB" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Indigo", hex: "#4B0082" },
];

const ColorNameFinder = () => {
  const [inputColor, setInputColor] = useState("#FF6B6B");
  const [closestMatch, setClosestMatch] = useState(null);
  const [colorFormat, setColorFormat] = useState("hex"); // hex, rgb, hsl
  const [history, setHistory] = useState([]);

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

  // Convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Calculate Euclidean distance between two RGB colors
  const calculateDistance = (rgb1, rgb2) => {
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  };

  // Find closest color name
  const findClosestColor = useCallback((hex) => {
    const inputRgb = hexToRgb(hex);
    let minDistance = Infinity;
    let closest = null;

    colorNames.forEach((color) => {
      const colorRgb = hexToRgb(color.hex);
      const distance = calculateDistance(inputRgb, colorRgb);
      if (distance < minDistance) {
        minDistance = distance;
        closest = { ...color, distance, rgb: colorRgb };
      }
    });

    return closest;
  }, []);

  // Format color based on selected format
  const formatColor = (hex, format) => {
    const rgb = hexToRgb(hex);
    switch (format) {
      case "rgb":
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      case "hsl":
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        return `hsl(${hsl.h.toFixed(0)}, ${hsl.s.toFixed(0)}%, ${hsl.l.toFixed(0)}%)`;
      default:
        return hex;
    }
  };

  useEffect(() => {
    if (/^#[0-9A-Fa-f]{6}$/.test(inputColor)) {
      const match = findClosestColor(inputColor);
      setClosestMatch(match);
      setHistory((prev) => [
        { input: inputColor, match: match.name, hex: match.hex },
        ...prev.slice(0, 4),
      ]); // Keep last 5
    } else {
      setClosestMatch(null);
    }
  }, [inputColor, findClosestColor]);

  // Reset input
  const reset = () => {
    setInputColor("#FF6B6B");
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FaPalette className="mr-2" /> Color Name Finder
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="#FF6B6B"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Format
              </label>
              <select
                value={colorFormat}
                onChange={(e) => setColorFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="hex">HEX</option>
                <option value="rgb">RGB</option>
                <option value="hsl">HSL</option>
              </select>
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Closest Match</h2>
            {closestMatch ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Your Color</p>
                    <div
                      className="w-full h-32 rounded-lg shadow-inner border"
                      style={{ backgroundColor: inputColor }}
                    />
                    <p className="text-sm mt-1 text-center">
                      {formatColor(inputColor, colorFormat)}
                      <button
                        onClick={() => navigator.clipboard.writeText(formatColor(inputColor, colorFormat))}
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        <FaCopy className="inline mr-1" /> Copy
                      </button>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Closest Named Color</p>
                    <div
                      className="w-full h-32 rounded-lg shadow-inner border"
                      style={{ backgroundColor: closestMatch.hex }}
                    />
                    <p className="text-sm mt-1 text-center">
                      {closestMatch.name} ({formatColor(closestMatch.hex, colorFormat)})
                      <button
                        onClick={() => navigator.clipboard.writeText(formatColor(closestMatch.hex, colorFormat))}
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        <FaCopy className="inline mr-1" /> Copy
                      </button>
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Distance: {closestMatch.distance.toFixed(2)} (RGB Euclidean)
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Enter a valid HEX color (e.g., #FF6B6B) to find the closest match
              </p>
            )}
          </div>

          {/* History Section */}
          {history.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Recent Searches</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setInputColor(item.input)}
                  >
                    <div
                      className="w-12 h-12 rounded-md border"
                      style={{ backgroundColor: item.input }}
                    />
                    <p className="text-xs mt-1 text-center truncate w-full">
                      {item.match}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-end">
            <button
              onClick={reset}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Finds closest color name from an extended list</li>
              <li>Supports HEX, RGB, and HSL color formats</li>
              <li>Copy color values to clipboard</li>
              <li>Search history with clickable swatches</li>
              <li>Visual color comparison</li>
            </ul>
          </div>

          {/* Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">About Color Name Finder</h2>
            <p className="text-sm text-gray-700">
              Matches your color to a predefined list using RGB Euclidean distance. Lower
              distance indicates a closer match. Note: This is an approximation; actual
              color naming may vary by context or standard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorNameFinder;