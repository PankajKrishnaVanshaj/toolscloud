"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaEyeDropper } from "react-icons/fa";

const ColorOpacityAdjuster = () => {
  const [baseColor, setBaseColor] = useState("#FF6B6B");
  const [opacity, setOpacity] = useState(1);
  const [backgroundType, setBackgroundType] = useState("checkerboard");
  const [adjustedColor, setAdjustedColor] = useState("");
  const [history, setHistory] = useState([]);
  const [customBackground, setCustomBackground] = useState("#FFFFFF");

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
  const rgbToHex = (r, g, b, a) => {
    const hex = [r, g, b].map((x) => {
      const val = Math.round(x).toString(16);
      return val.length === 1 ? "0" + val : val;
    });
    if (a !== undefined) {
      const alpha = Math.round(a * 255).toString(16);
      hex.push(alpha.length === 1 ? "0" + alpha : alpha);
    }
    return "#" + hex.join("").toUpperCase();
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

  // Update adjusted color and history
  const updateColor = useCallback(() => {
    const rgb = hexToRgb(baseColor);
    const newColor = rgbToHex(rgb.r, rgb.g, rgb.b, opacity);
    setAdjustedColor(newColor);
    setHistory((prev) => {
      const newHistory = [...prev, { baseColor, opacity }];
      return newHistory.slice(-5); // Keep last 5 states
    });
  }, [baseColor, opacity]);

  useEffect(() => {
    updateColor();
  }, [updateColor]);

  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Background styles
  const backgrounds = {
    checkerboard: {
      background: `linear-gradient(45deg, #ccc 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #ccc 75%),
                  #fff`,
      backgroundSize: "20px 20px",
    },
    white: { background: "#ffffff" },
    black: { background: "#000000" },
    gray: { background: "#808080" },
    custom: { background: customBackground },
  };

  // Reset to default
  const reset = () => {
    setBaseColor("#FF6B6B");
    setOpacity(1);
    setBackgroundType("checkerboard");
    setCustomBackground("#FFFFFF");
    setHistory([]);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Undo last change
  const undo = () => {
    if (history.length > 1) {
      const lastState = history[history.length - 2];
      setBaseColor(lastState.baseColor);
      setOpacity(lastState.opacity);
      setHistory((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Opacity Adjuster
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                />
                <button
                  onClick={() => setBaseColor(baseColor)} // Placeholder for color picker (could use browser's eyedropper if supported)
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  title="Pick Color (Future Feature)"
                >
                  <FaEyeDropper />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opacity: {Math.round(opacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Preview
              </label>
              <select
                value={backgroundType}
                onChange={(e) => setBackgroundType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="checkerboard">Checkerboard</option>
                <option value="white">White</option>
                <option value="black">Black</option>
                <option value="gray">Gray</option>
                <option value="custom">Custom</option>
              </select>
              {backgroundType === "custom" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={customBackground}
                    onChange={(e) => setCustomBackground(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={customBackground}
                    onChange={(e) => setCustomBackground(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={undo}
                disabled={history.length <= 1}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Undo
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Preview and Results */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div
                className="h-48 rounded-lg relative flex items-center justify-center text-white text-lg font-medium shadow-md"
                style={backgrounds[backgroundType]}
              >
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: adjustedColor }}
                />
                <span className="relative z-10 mix-blend-difference">
                  Sample Text
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Color Values</h2>
              <div className="space-y-2 text-sm">
                {[
                  {
                    label: "HEX with Alpha",
                    value: adjustedColor,
                  },
                  {
                    label: "RGBA",
                    value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity.toFixed(2)})`,
                  },
                  {
                    label: "HSLA",
                    value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${opacity.toFixed(2)})`,
                  },
                ].map(({ label, value }) => (
                  <p key={label} className="flex items-center">
                    <span className="font-medium">{label}:</span> {value}
                    <button
                      onClick={() => copyToClipboard(value)}
                      className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                      title="Copy to clipboard"
                    >
                      <FaCopy />
                    </button>
                  </p>
                ))}
              </div>
            </div>

            {history.length > 1 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">History</h2>
                <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                  {history.slice().reverse().map((state, index) => (
                    <li key={index}>
                      {state.baseColor} @ {Math.round(state.opacity * 100)}%
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjust color and opacity with real-time preview</li>
            <li>Multiple background options including custom color</li>
            <li>HEX, RGBA, and HSLA output formats</li>
            <li>Copy values to clipboard</li>
            <li>Undo and reset functionality</li>
            <li>History of recent changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorOpacityAdjuster;