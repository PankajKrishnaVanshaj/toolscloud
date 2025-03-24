"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const ColorLuminanceCalculator = () => {
  const [color, setColor] = useState("#FF6B6B");
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [luminance, setLuminance] = useState(0);
  const [adjustment, setAdjustment] = useState(0);
  const [contrastColor, setContrastColor] = useState("#000000");
  const [history, setHistory] = useState([]);

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

  // Convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  // Calculate relative luminance (WCAG formula)
  const calculateLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Adjust color brightness
  const adjustBrightness = (r, g, b, factor) => {
    const adjust = (value) => Math.round(Math.max(0, Math.min(255, value * (1 + factor))));
    return { r: adjust(r), g: adjust(g), b: adjust(b) };
  };

  // Calculate contrast ratio (WCAG)
  const calculateContrastRatio = (lum1, lum2) => {
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  // Update state and calculations
  useEffect(() => {
    const baseRgb = hexToRgb(color);
    setRgb(baseRgb);
    const adjustedRgb = adjustBrightness(baseRgb.r, baseRgb.g, baseRgb.b, adjustment);
    const newLuminance = calculateLuminance(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
    setLuminance(newLuminance);
    setContrastColor(newLuminance > 0.5 ? "#000000" : "#FFFFFF"); // Simple contrast color
  }, [color, adjustment]);

  const adjustedRgb = adjustBrightness(rgb.r, rgb.g, rgb.b, adjustment);
  const adjustedColor = rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
  const contrastRatio = calculateContrastRatio(luminance, calculateLuminance(255, 255, 255));

  // Add to history
  const addToHistory = useCallback(() => {
    setHistory((prev) => {
      const newEntry = { color, adjustedColor, luminance };
      return [...prev.filter((item) => item.color !== color), newEntry].slice(-5); // Keep last 5
    });
  }, [color, adjustedColor, luminance]);

  // Reset to defaults
  const reset = () => {
    setColor("#FF6B6B");
    setAdjustment(0);
    setHistory([]);
  };

  // Download as PNG
  const downloadColorInfo = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = adjustedColor;
    ctx.fillRect(0, 0, 400, 100);
    ctx.fillStyle = contrastColor;
    ctx.font = "16px Arial";
    ctx.fillText(`HEX: ${adjustedColor}`, 10, 130);
    ctx.fillText(`Luminance: ${luminance.toFixed(4)}`, 10, 160);
    ctx.fillText(`Contrast Ratio (vs White): ${contrastRatio.toFixed(2)}`, 10, 190);

    const link = document.createElement("a");
    link.download = `color-info-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Luminance Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Color</label>
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
                  onBlur={addToHistory}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brightness Adjustment ({Math.round(adjustment * 100)}%)
              </label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={adjustment}
                onChange={(e) => setAdjustment(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">RGB Values</h2>
              <div className="grid grid-cols-3 gap-2">
                {["r", "g", "b"].map((channel) => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel}
                    </label>
                    <input
                      type="number"
                      value={adjustedRgb[channel]}
                      className="w-full p-1 border rounded-md bg-gray-100"
                      disabled
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadColorInfo}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>

          {/* Preview and Analysis */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Color Preview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Original</p>
                  <div
                    className="h-32 rounded-lg shadow-inner transition-colors"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Adjusted</p>
                  <div
                    className="h-32 rounded-lg shadow-inner transition-colors"
                    style={{ backgroundColor: adjustedColor }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Luminance Analysis</h2>
              <div className="space-y-3 text-sm">
                <p>Relative Luminance: {luminance.toFixed(4)}</p>
                <p>
                  Adjusted HEX: {adjustedColor.toUpperCase()}
                  <button
                    onClick={() => navigator.clipboard.writeText(adjustedColor)}
                    className="ml-2 text-blue-500 hover:underline"
                  >
                    <FaCopy className="inline" />
                  </button>
                </p>
                <p>Contrast Ratio (vs White): {contrastRatio.toFixed(2)}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${luminance * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  (0 = pure black, 1 = pure white)
                </p>
                <p
                  className="p-2 rounded text-center"
                  style={{
                    backgroundColor: adjustedColor,
                    color: contrastColor,
                  }}
                >
                  Sample Text
                </p>
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Color History</h2>
                <ul className="space-y-2">
                  {history.slice().reverse().map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 p-1 rounded"
                      onClick={() => setColor(item.color)}
                    >
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: item.adjustedColor }}
                      />
                      <span>{item.adjustedColor} (Lum: {item.luminance.toFixed(4)})</span>
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
            <li>Calculate WCAG relative luminance</li>
            <li>Adjust brightness with real-time preview</li>
            <li>Contrast ratio calculation against white</li>
            <li>Color history tracking</li>
            <li>Download color info as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorLuminanceCalculator;