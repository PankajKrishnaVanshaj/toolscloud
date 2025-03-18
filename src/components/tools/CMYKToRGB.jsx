"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaRandom } from "react-icons/fa";

const CMYKToRGB = () => {
  const [cmyk, setCmyk] = useState({ c: 0, m: 0, y: 0, k: 0 });
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
  const [hex, setHex] = useState("#000000");
  const [showSliders, setShowSliders] = useState(false);

  // Convert CMYK to RGB
  const cmykToRgb = useCallback((c, m, y, k) => {
    c = c / 100;
    m = m / 100;
    y = y / 100;
    k = k / 100;
    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);
    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b),
    };
  }, []);

  // Convert RGB to HEX
  const rgbToHex = useCallback((r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
        .toUpperCase()
    );
  }, []);

  // Update RGB and HEX when CMYK changes
  useEffect(() => {
    const newRgb = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }, [cmyk, cmykToRgb, rgbToHex]);

  // Handle CMYK input changes
  const handleCmykChange = (channel, value) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setCmyk((prev) => ({ ...prev, [channel]: numValue }));
  };

  // Reset to default values
  const resetValues = () => {
    setCmyk({ c: 0, m: 0, y: 0, k: 0 });
  };

  // Generate random CMYK values
  const generateRandom = () => {
    setCmyk({
      c: Math.floor(Math.random() * 101),
      m: Math.floor(Math.random() * 101),
      y: Math.floor(Math.random() * 101),
      k: Math.floor(Math.random() * 101),
    });
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          CMYK to RGB Converter
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CMYK Input */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700">CMYK Values</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSliders(!showSliders)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {showSliders ? "Hide Sliders" : "Show Sliders"}
                </button>
                <button
                  onClick={generateRandom}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  title="Randomize"
                >
                  <FaRandom />
                </button>
                <button
                  onClick={resetValues}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  title="Reset"
                >
                  <FaSync />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {["c", "m", "y", "k"].map((channel) => (
                <div key={channel}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {channel === "c"
                      ? "Cyan"
                      : channel === "m"
                      ? "Magenta"
                      : channel === "y"
                      ? "Yellow"
                      : "Black"}{" "}
                    ({cmyk[channel]}%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={cmyk[channel]}
                    onChange={(e) => handleCmykChange(channel, e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {showSliders && (
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cmyk[channel]}
                      onChange={(e) => handleCmykChange(channel, e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RGB and HEX Output */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Converted Color
              </h2>
              <div
                className="w-full h-32 sm:h-48 rounded-lg shadow-inner mb-4 transition-colors duration-300"
                style={{ backgroundColor: hex }}
              />
              <div className="space-y-3 text-sm">
                <p className="flex items-center justify-between">
                  <span>
                    RGB: {rgb.r}, {rgb.g}, {rgb.b}
                  </span>
                  <button
                    onClick={() => copyToClipboard(`${rgb.r}, ${rgb.g}, ${rgb.b}`)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <FaCopy /> Copy
                  </button>
                </p>
                <p className="flex items-center justify-between">
                  <span>HEX: {hex}</span>
                  <button
                    onClick={() => copyToClipboard(hex)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <FaCopy /> Copy
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Color Swatches */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Color Preview Swatches
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { c: 100, m: 0, y: 0, k: 0 }, // Cyan
              { c: 0, m: 100, y: 0, k: 0 }, // Magenta
              { c: 0, m: 0, y: 100, k: 0 }, // Yellow
              { c: 0, m: 0, y: 0, k: 100 }, // Black
            ].map((preset, index) => {
              const presetRgb = cmykToRgb(preset.c, preset.m, preset.y, preset.k);
              const presetHex = rgbToHex(presetRgb.r, presetRgb.g, presetRgb.b);
              return (
                <div
                  key={index}
                  className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setCmyk(preset)}
                >
                  <div
                    className="w-full h-16 rounded-md"
                    style={{ backgroundColor: presetHex }}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    C:{preset.c} M:{preset.m} Y:{preset.y} K:{preset.k}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">
            About CMYK to RGB Conversion
          </h2>
          <div className="text-sm text-blue-600">
            <p>Converts CMYK (print color model) to RGB (screen color model):</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>CMYK: Cyan, Magenta, Yellow, Key/Black (0-100%)</li>
              <li>RGB: Red, Green, Blue (0-255)</li>
              <li>Formula: R = 255 × (1-C) × (1-K), etc.</li>
              <li>
                Note: This is a basic conversion; real-world results may vary with color profiles
                (e.g., sRGB, Adobe RGB).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMYKToRGB;