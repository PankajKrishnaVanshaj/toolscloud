"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaDownload, FaSync } from "react-icons/fa";

const ColorSchemeGenerator = () => {
  const [baseColor, setBaseColor] = useState("#FF6B6B");
  const [schemeType, setSchemeType] = useState("monochromatic");
  const [schemeColors, setSchemeColors] = useState([]);
  const [variation, setVariation] = useState(20); // For monochromatic
  const [saturationAdjust, setSaturationAdjust] = useState(0); // New: Saturation tweak
  const [lightnessAdjust, setLightnessAdjust] = useState(0); // New: Lightness tweak
  const [colorCount, setColorCount] = useState(3); // Adjustable color count

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

  // Generate color scheme
  const generateScheme = useCallback(() => {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const adjustedS = Math.max(0, Math.min(1, hsl.s + saturationAdjust / 100));
    const adjustedL = Math.max(0, Math.min(1, hsl.l + lightnessAdjust / 100));
    let colors = [];

    const applyAdjustments = (h, s, l) =>
      rgbToHex(hslToRgb(h, adjustedS, Math.max(0.1, Math.min(0.9, l))));

    switch (schemeType) {
      case "monochromatic":
        colors = Array.from({ length: colorCount }, (_, i) => {
          const step = (variation / 100) * (i - Math.floor(colorCount / 2));
          return applyAdjustments(hsl.h, hsl.s, hsl.l + step);
        });
        break;
      case "complementary":
        colors = [
          applyAdjustments(hsl.h, hsl.s, hsl.l),
          applyAdjustments((hsl.h + 180) % 360, hsl.s, hsl.l),
        ];
        break;
      case "analogous":
        colors = Array.from({ length: colorCount }, (_, i) =>
          applyAdjustments((hsl.h + 30 * (i - Math.floor(colorCount / 2) + 1)) % 360, hsl.s, hsl.l)
        );
        break;
      case "triadic":
        colors = [
          applyAdjustments(hsl.h, hsl.s, hsl.l),
          applyAdjustments((hsl.h + 120) % 360, hsl.s, hsl.l),
          applyAdjustments((hsl.h + 240) % 360, hsl.s, hsl.l),
        ];
        break;
      case "tetradic":
        colors = [
          applyAdjustments(hsl.h, hsl.s, hsl.l),
          applyAdjustments((hsl.h + 90) % 360, hsl.s, hsl.l),
          applyAdjustments((hsl.h + 180) % 360, hsl.s, hsl.l),
          applyAdjustments((hsl.h + 270) % 360, hsl.s, hsl.l),
        ];
        break;
      case "split-complementary":
        colors = [
          applyAdjustments(hsl.h, hsl.s, hsl.l),
          applyAdjustments((hsl.h + 150) % 360, hsl.s, hsl.l),
          applyAdjustments((hsl.h + 210) % 360, hsl.s, hsl.l),
        ];
        break;
    }
    setSchemeColors(colors);
  }, [baseColor, schemeType, variation, saturationAdjust, lightnessAdjust, colorCount]);

  useEffect(() => {
    generateScheme();
  }, [generateScheme]);

  // Export as CSS
  const exportToCss = () => {
    const css = `:root {\n${schemeColors
      .map((color, i) => `  --color-${i + 1}: ${color};`)
      .join("\n")}\n}`;
    navigator.clipboard.writeText(css);
    alert("CSS variables copied to clipboard!");
  };

  // Download as JSON
  const downloadJson = () => {
    const json = JSON.stringify(
      { baseColor, schemeType, colors: schemeColors },
      null,
      2
    );
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `color-scheme-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset to defaults
  const reset = () => {
    setBaseColor("#FF6B6B");
    setSchemeType("monochromatic");
    setVariation(20);
    setSaturationAdjust(0);
    setLightnessAdjust(0);
    setColorCount(3);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Scheme Generator
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
                Scheme Type
              </label>
              <select
                value={schemeType}
                onChange={(e) => setSchemeType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="monochromatic">Monochromatic</option>
                <option value="complementary">Complementary</option>
                <option value="analogous">Analogous</option>
                <option value="triadic">Triadic</option>
                <option value="tetradic">Tetradic</option>
                <option value="split-complementary">Split Complementary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Colors ({colorCount})
              </label>
              <input
                type="range"
                min="2"
                max={schemeType === "monochromatic" || schemeType === "analogous" ? "6" : "4"}
                value={colorCount}
                onChange={(e) => setColorCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variation ({variation}%)
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={variation}
                onChange={(e) => setVariation(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saturation Adjust ({saturationAdjust}%)
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={saturationAdjust}
                onChange={(e) => setSaturationAdjust(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lightness Adjust ({lightnessAdjust}%)
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={lightnessAdjust}
                onChange={(e) => setLightnessAdjust(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Scheme Display */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Generated Scheme</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {schemeColors.map((color, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-20 h-20 rounded-lg shadow-md transition-transform hover:scale-105"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs mt-2 font-mono">{color}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(color)}
                    className="text-blue-500 text-xs hover:underline mt-1 flex items-center gap-1"
                  >
                    <FaCopy /> Copy
                  </button>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={exportToCss}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <FaCopy className="mr-2" /> Export CSS
              </button>
              <button
                onClick={downloadJson}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download JSON
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Scheme Preview</h2>
          <div className="flex h-32 rounded-lg overflow-hidden shadow-md">
            {schemeColors.map((color, index) => (
              <div key={index} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple scheme types including Split Complementary</li>
            <li>Adjustable number of colors</li>
            <li>Fine-tune with variation, saturation, and lightness</li>
            <li>Real-time preview and color swatches</li>
            <li>Export as CSS variables or JSON</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorSchemeGenerator;