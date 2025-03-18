"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaDownload, FaSync } from "react-icons/fa";

const ColorShadeGenerator = () => {
  const [baseColor, setBaseColor] = useState("#FF6B6B");
  const [shadeCount, setShadeCount] = useState(5);
  const [stepSize, setStepSize] = useState(10);
  const [direction, setDirection] = useState("both"); // "both", "lighter", "darker"
  const [saturationAdjust, setSaturationAdjust] = useState(0); // -50 to 50%
  const [shades, setShades] = useState([]);

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
    return { h: h * 360, s, l };
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h /= 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 1 / 6) {
      r = c;
      g = x;
      b = 0;
    } else if (h < 2 / 6) {
      r = x;
      g = c;
      b = 0;
    } else if (h < 3 / 6) {
      r = 0;
      g = c;
      b = x;
    } else if (h < 4 / 6) {
      r = 0;
      g = x;
      b = c;
    } else if (h < 5 / 6) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  };

  // Generate shades
  const generateShades = useCallback(() => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(baseColor)) {
      setShades([]);
      return;
    }

    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const adjustedSaturation = Math.max(
      0,
      Math.min(1, hsl.s + saturationAdjust / 100)
    );
    const newShades = [];

    let lighterCount, darkerCount;
    if (direction === "both") {
      lighterCount = darkerCount = Math.floor((shadeCount - 1) / 2);
    } else if (direction === "lighter") {
      lighterCount = shadeCount - 1;
      darkerCount = 0;
    } else {
      lighterCount = 0;
      darkerCount = shadeCount - 1;
    }

    // Generate darker shades
    for (let i = darkerCount; i > 0; i--) {
      const newL = Math.max(0, hsl.l - (stepSize / 100) * i);
      newShades.push(rgbToHex(hslToRgb(hsl.h, adjustedSaturation, newL)));
    }

    // Add base color
    newShades.push(baseColor);

    // Generate lighter shades
    for (let i = 1; i <= lighterCount; i++) {
      const newL = Math.min(1, hsl.l + (stepSize / 100) * i);
      newShades.push(rgbToHex(hslToRgb(hsl.h, adjustedSaturation, newL)));
    }

    setShades(newShades);
  }, [baseColor, shadeCount, stepSize, direction, saturationAdjust]);

  useEffect(() => {
    generateShades();
  }, [generateShades]);

  // Export options
  const exportToCss = () => {
    const css = `:root {\n${shades
      .map((color, i) => `  --shade-${i + 1}: ${color};`)
      .join("\n")}\n}`;
    navigator.clipboard.writeText(css);
    alert("Shades copied to clipboard as CSS variables!");
  };

  const exportToJson = () => {
    const json = JSON.stringify(shades, null, 2);
    navigator.clipboard.writeText(json);
    alert("Shades copied to clipboard as JSON!");
  };

  const downloadPalette = () => {
    const canvas = document.createElement("canvas");
    canvas.width = shades.length * 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    shades.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * 100, 0, 100, 100);
    });
    const link = document.createElement("a");
    link.download = `color-shades-${baseColor.slice(1)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Reset to defaults
  const reset = () => {
    setBaseColor("#FF6B6B");
    setShadeCount(5);
    setStepSize(10);
    setDirection("both");
    setSaturationAdjust(0);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Shade Generator
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
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Shades: {shadeCount}
              </label>
              <input
                type="range"
                min="3"
                max="11"
                step="1"
                value={shadeCount}
                onChange={(e) => setShadeCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Size: {stepSize}%
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={stepSize}
                onChange={(e) => setStepSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="both">Both (Lighter & Darker)</option>
                <option value="lighter">Lighter Only</option>
                <option value="darker">Darker Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saturation Adjust: {saturationAdjust}%
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={saturationAdjust}
                onChange={(e) => setSaturationAdjust(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Shades Display */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Generated Shades</h2>
            {shades.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4 max-h-72 overflow-y-auto">
                  {shades.map((color, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-16 h-16 rounded-lg shadow-md transition-transform hover:scale-105"
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={exportToCss}
                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <FaCopy className="mr-2" /> Export CSS
                  </button>
                  <button
                    onClick={exportToJson}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <FaCopy className="mr-2" /> Export JSON
                  </button>
                  <button
                    onClick={downloadPalette}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <FaDownload className="mr-2" /> Download PNG
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Enter a valid HEX color to generate shades
              </p>
            )}
          </div>
        </div>

        {/* Preview */}
        {shades.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Shade Preview</h2>
            <div className="flex h-24 rounded-lg overflow-hidden shadow-md">
              {shades.map((color, index) => (
                <div
                  key={index}
                  className="flex-1 transition-all"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={reset}
            className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <FaSync /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate shades in HSL space with customizable direction</li>
            <li>Adjustable shade count (3-11), step size (5-50%), and saturation</li>
            <li>Export as CSS variables, JSON, or PNG palette</li>
            <li>Real-time preview and individual color copying</li>
            <li>Hover effects and smooth transitions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorShadeGenerator;