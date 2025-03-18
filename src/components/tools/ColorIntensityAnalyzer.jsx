"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const ColorIntensityAnalyzer = () => {
  const [color, setColor] = useState("#FF6B6B");
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });
  const [cmyk, setCmyk] = useState({ c: 0, m: 0, y: 0, k: 0 });
  const [contrastColor, setContrastColor] = useState("#000000");
  const [displayMode, setDisplayMode] = useState("bars");

  // Convert hex to RGB
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
      h = s = 0;
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
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // Convert RGB to CMYK
  const rgbToCmyk = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    };
  };

  // Calculate contrast color (simple luminance-based)
  const getContrastColor = (r, g, b) => {
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  // Update color analysis
  const updateColorAnalysis = useCallback((newColor) => {
    const rgbValues = hexToRgb(newColor);
    setRgb(rgbValues);
    setHsl(rgbToHsl(rgbValues.r, rgbValues.g, rgbValues.b));
    setCmyk(rgbToCmyk(rgbValues.r, rgbValues.g, rgbValues.b));
    setContrastColor(getContrastColor(rgbValues.r, rgbValues.g, rgbValues.b));
  }, []);

  useEffect(() => {
    updateColorAnalysis(color);
  }, [color, updateColorAnalysis]);

  // Copy color value to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`${text} copied to clipboard!`);
  };

  // Reset to default
  const resetColor = () => {
    setColor("#FF6B6B");
    setDisplayMode("bars");
  };

  // Progress Bar Component
  const ProgressBar = ({ value, max, color, label }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>
          {value}
          {max === 100 ? "%" : ""}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${color}`}
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  // Circular Progress Component
  const CircularProgress = ({ value, max, color, label }) => {
    const percentage = (value / max) * 100;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <svg className="w-24 h-24" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color.replace("bg-", "#")}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
            transform="rotate(-90 50 50)"
          />
          <text x="50" y="55" textAnchor="middle" className="text-sm fill-gray-700">
            {value}
            {max === 100 ? "%" : ""}
          </text>
        </svg>
        <span className="text-sm mt-2">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Intensity Analyzer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Input and Preview */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(color)}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
            <div
              className="h-40 rounded-lg flex items-center justify-center text-lg font-medium shadow-inner transition-colors duration-300"
              style={{ backgroundColor: color, color: contrastColor }}
            >
              Color Preview
            </div>
            <button
              onClick={resetColor}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Color Analysis */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Color Analysis</h2>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="p-1 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="bars">Progress Bars</option>
                <option value="circles">Circular Progress</option>
              </select>
            </div>

            {/* RGB */}
            <div>
              <h3 className="text-md font-medium mb-2">RGB</h3>
              {displayMode === "bars" ? (
                <div className="space-y-3">
                  <ProgressBar value={rgb.r} max={255} color="bg-red-500" label="Red" />
                  <ProgressBar value={rgb.g} max={255} color="bg-green-500" label="Green" />
                  <ProgressBar value={rgb.b} max={255} color="bg-blue-500" label="Blue" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <CircularProgress value={rgb.r} max={255} color="bg-red-500" label="Red" />
                  <CircularProgress
                    value={rgb.g}
                    max={255}
                    color="bg-green-500"
                    label="Green"
                  />
                  <CircularProgress value={rgb.b} max={255} color="bg-blue-500" label="Blue" />
                </div>
              )}
            </div>

            {/* HSL */}
            <div>
              <h3 className="text-md font-medium mb-2">HSL</h3>
              {displayMode === "bars" ? (
                <div className="space-y-3">
                  <ProgressBar value={hsl.h} max={360} color="bg-purple-500" label="Hue" />
                  <ProgressBar
                    value={hsl.s}
                    max={100}
                    color="bg-indigo-500"
                    label="Saturation"
                  />
                  <ProgressBar
                    value={hsl.l}
                    max={100}
                    color="bg-gray-500"
                    label="Lightness"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <CircularProgress
                    value={hsl.h}
                    max={360}
                    color="bg-purple-500"
                    label="Hue"
                  />
                  <CircularProgress
                    value={hsl.s}
                    max={100}
                    color="bg-indigo-500"
                    label="Saturation"
                  />
                  <CircularProgress
                    value={hsl.l}
                    max={100}
                    color="bg-gray-500"
                    label="Lightness"
                  />
                </div>
              )}
            </div>

            {/* CMYK */}
            <div>
              <h3 className="text-md font-medium mb-2">CMYK</h3>
              {displayMode === "bars" ? (
                <div className="space-y-3">
                  <ProgressBar value={cmyk.c} max={100} color="bg-cyan-500" label="Cyan" />
                  <ProgressBar
                    value={cmyk.m}
                    max={100}
                    color="bg-magenta-500"
                    label="Magenta"
                  />
                  <ProgressBar value={cmyk.y} max={100} color="bg-yellow-500" label="Yellow" />
                  <ProgressBar value={cmyk.k} max={100} color="bg-black" label="Black" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <CircularProgress
                    value={cmyk.c}
                    max={100}
                    color="bg-cyan-500"
                    label="Cyan"
                  />
                  <CircularProgress
                    value={cmyk.m}
                    max={100}
                    color="bg-magenta-500"
                    label="Magenta"
                  />
                  <CircularProgress
                    value={cmyk.y}
                    max={100}
                    color="bg-yellow-500"
                    label="Yellow"
                  />
                  <CircularProgress value={cmyk.k} max={100} color="bg-black" label="Black" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Color Values */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Color Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p>
                RGB: {rgb.r}, {rgb.g}, {rgb.b}
              </p>
              <p>HEX: {color.toUpperCase()}</p>
              <p>
                Intensity: {Math.round((rgb.r + rgb.g + rgb.b) / 7.65)}%
              </p>
            </div>
            <div className="space-y-1">
              <p>
                HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%
              </p>
              <p>
                CMYK: {cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%
              </p>
              <p>Contrast Color: {contrastColor}</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>RGB, HSL, and CMYK color analysis</li>
            <li>Toggle between progress bars and circular displays</li>
            <li>Copy HEX code to clipboard</li>
            <li>Dynamic contrast color for preview text</li>
            <li>Reset to default color</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorIntensityAnalyzer;