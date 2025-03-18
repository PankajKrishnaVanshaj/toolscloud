"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaRandom } from "react-icons/fa";
import html2canvas from "html2canvas"; 

const ColorPaletteSynchronizer = () => {
  const [baseColor, setBaseColor] = useState("#FF6B6B");
  const [harmony, setHarmony] = useState("complementary");
  const [palette, setPalette] = useState([]);
  const [saturationAdjust, setSaturationAdjust] = useState(0);
  const [lightnessAdjust, setLightnessAdjust] = useState(0);
  const paletteRef = React.useRef(null);

  // Color conversion utilities
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

  const rgbToHex = ({ r, g, b }) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.max(0, Math.min(255, x)).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

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

  // Generate palette with adjustments
  const generatePalette = useCallback(() => {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const adjustedS = Math.max(0, Math.min(1, hsl.s + saturationAdjust / 100));
    const adjustedL = Math.max(0, Math.min(1, hsl.l + lightnessAdjust / 100));
    let colors = [rgbToHex(hslToRgb(hsl.h, adjustedS, adjustedL))];

    switch (harmony) {
      case "complementary":
        colors.push(rgbToHex(hslToRgb((hsl.h + 180) % 360, adjustedS, adjustedL)));
        break;
      case "analogous":
        colors.push(rgbToHex(hslToRgb((hsl.h + 30) % 360, adjustedS, adjustedL)));
        colors.push(
          rgbToHex(hslToRgb((hsl.h - 30 + 360) % 360, adjustedS, adjustedL))
        );
        break;
      case "triadic":
        colors.push(rgbToHex(hslToRgb((hsl.h + 120) % 360, adjustedS, adjustedL)));
        colors.push(rgbToHex(hslToRgb((hsl.h + 240) % 360, adjustedS, adjustedL)));
        break;
      case "split-complementary":
        colors.push(rgbToHex(hslToRgb((hsl.h + 150) % 360, adjustedS, adjustedL)));
        colors.push(rgbToHex(hslToRgb((hsl.h + 210) % 360, adjustedS, adjustedL)));
        break;
      case "monochromatic":
        colors.push(
          rgbToHex(hslToRgb(hsl.h, adjustedS, Math.min(0.8, adjustedL + 0.2)))
        );
        colors.push(
          rgbToHex(hslToRgb(hsl.h, adjustedS, Math.max(0.2, adjustedL - 0.2)))
        );
        break;
      case "tetradic":
        colors.push(rgbToHex(hslToRgb((hsl.h + 90) % 360, adjustedS, adjustedL)));
        colors.push(rgbToHex(hslToRgb((hsl.h + 180) % 360, adjustedS, adjustedL)));
        colors.push(rgbToHex(hslToRgb((hsl.h + 270) % 360, adjustedS, adjustedL)));
        break;
    }
    setPalette(colors);
  }, [baseColor, harmony, saturationAdjust, lightnessAdjust]);

  useEffect(() => {
    generatePalette();
  }, [generatePalette]);

  // Randomize base color
  const randomizeColor = () => {
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    setBaseColor(randomColor);
  };

  // Reset adjustments
  const resetAdjustments = () => {
    setSaturationAdjust(0);
    setLightnessAdjust(0);
    setBaseColor("#FF6B6B");
    setHarmony("complementary");
  };

  // Download palette as image
  const downloadPalette = () => {
    if (paletteRef.current) {
      html2canvas(paletteRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `palette-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Palette Synchronizer
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
                  className="w-12 h-12 rounded cursor-pointer border-none"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                />
                <button
                  onClick={randomizeColor}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <FaRandom />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Harmony
              </label>
              <select
                value={harmony}
                onChange={(e) => setHarmony(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="complementary">Complementary</option>
                <option value="analogous">Analogous</option>
                <option value="triadic">Triadic</option>
                <option value="split-complementary">Split Complementary</option>
                <option value="monochromatic">Monochromatic</option>
                <option value="tetradic">Tetradic</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="flex gap-4">
              <button
                onClick={resetAdjustments}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadPalette}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>

          {/* Palette Preview */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Palette Preview</h2>
            <div ref={paletteRef} className="space-y-3">
              {palette.map((color, index) => (
                <div
                  key={index}
                  className="h-16 rounded-lg flex items-center justify-between px-4 text-white font-medium shadow-md transition-transform hover:scale-105"
                  style={{ backgroundColor: color }}
                >
                  <span>{color.toUpperCase()}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(color)}
                    className="bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition-colors flex items-center gap-2"
                  >
                    <FaCopy /> Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Palette Visualization */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Visualization</h2>
          <div className="flex h-40 rounded-lg overflow-hidden shadow-md">
            {palette.map((color, index) => (
              <div
                key={index}
                className="flex-1 transition-all hover:flex-[2]"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple harmony options including Tetradic</li>
            <li>Saturation and lightness adjustments</li>
            <li>Random color generator</li>
            <li>Copy color codes to clipboard</li>
            <li>Download palette as PNG</li>
            <li>Interactive visualization with hover effects</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteSynchronizer;