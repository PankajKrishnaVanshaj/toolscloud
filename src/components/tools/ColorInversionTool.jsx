"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const ColorInversionTool = () => {
  const [baseColor, setBaseColor] = useState("#FF6B6B");
  const [method, setMethod] = useState("rgb");
  const [invertedColor, setInvertedColor] = useState("");
  const [contrastRatio, setContrastRatio] = useState(null);
  const [history, setHistory] = useState([]);

  // Utility Functions
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

  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
        .toUpperCase()
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
    h = (h % 360 + 360) % 360;
    h /= 360;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 1 / 6) { r = c; g = x; b = 0; }
    else if (h < 2 / 6) { r = x; g = c; b = 0; }
    else if (h < 3 / 6) { r = 0; g = c; b = x; }
    else if (h < 4 / 6) { r = 0; g = x; b = c; }
    else if (h < 5 / 6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  };

  const luminance = (r, g, b) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const calculateContrastRatio = (color1, color2) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const lum1 = luminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = luminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const invertColor = useCallback((hex, method) => {
    const rgb = hexToRgb(hex);

    switch (method) {
      case "rgb":
        return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
      case "hsl":
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const invertedHsl = { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l };
        const invertedRgb = hslToRgb(invertedHsl.h, invertedHsl.s, invertedHsl.l);
        return rgbToHex(invertedRgb.r, invertedRgb.g, invertedRgb.b);
      case "lightness":
        const hslLight = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const invertedLight = { h: hslLight.h, s: hslLight.s, l: 1 - hslLight.l };
        const rgbLight = hslToRgb(invertedLight.h, invertedLight.s, invertedLight.l);
        return rgbToHex(rgbLight.r, rgbLight.g, rgbLight.b);
      default:
        return hex;
    }
  }, []);

  useEffect(() => {
    if (/^#[0-9A-Fa-f]{6}$/.test(baseColor)) {
      const inverted = invertColor(baseColor, method);
      setInvertedColor(inverted);
      setContrastRatio(calculateContrastRatio(baseColor, inverted));
      setHistory((prev) => [
        { base: baseColor, inverted, method, timestamp: Date.now() },
        ...prev.slice(0, 9),
      ]);
    } else {
      setInvertedColor("");
      setContrastRatio(null);
    }
  }, [baseColor, method, invertColor]);

  const reset = () => {
    setBaseColor("#FF6B6B");
    setMethod("rgb");
    setInvertedColor("");
    setContrastRatio(null);
    setHistory([]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const baseRgb = hexToRgb(baseColor);
  const invertedRgb = hexToRgb(invertedColor);
  const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const invertedHsl = rgbToHsl(invertedRgb.r, invertedRgb.g, invertedRgb.b);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Inversion Tool
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
                  placeholder="#FF6B6B"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inversion Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="rgb">RGB Inversion</option>
                <option value="hsl">HSL Complementary</option>
                <option value="lightness">Lightness Inversion</option>
              </select>
            </div>

            <button
              onClick={reset}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Result */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Inverted Color</h2>
              {invertedColor ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Base Color</p>
                      <div
                        className="w-full h-24 rounded-lg shadow-inner"
                        style={{ backgroundColor: baseColor }}
                      />
                      <p className="text-sm mt-1 text-center">{baseColor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Inverted Color</p>
                      <div
                        className="w-full h-24 rounded-lg shadow-inner"
                        style={{ backgroundColor: invertedColor }}
                      />
                      <p className="text-sm mt-1 text-center">{invertedColor}</p>
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      HEX: {invertedColor}{" "}
                      <button
                        onClick={() => copyToClipboard(invertedColor)}
                        className="ml-2 text-blue-500 hover:underline flex items-center"
                      >
                        <FaCopy className="mr-1" /> Copy
                      </button>
                    </p>
                    <p>
                      RGB: {invertedRgb.r}, {invertedRgb.g}, {invertedRgb.b}
                    </p>
                    <p>
                      HSL: {Math.round(invertedHsl.h)}°,{" "}
                      {Math.round(invertedHsl.s * 100)}%,{" "}
                      {Math.round(invertedHsl.l * 100)}%
                    </p>
                    {contrastRatio && (
                      <p>
                        Contrast Ratio: {contrastRatio.toFixed(2)} (
                        {contrastRatio >= 4.5 ? "AA" : contrastRatio >= 3 ? "A" : "Fail"})
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  Enter a valid HEX color (e.g., #FF6B6B) to invert
                </p>
              )}
            </div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Inversion History</h2>
            <ul className="space-y-2 text-sm text-gray-700 max-h-48 overflow-y-auto">
              {history.map((entry, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded"
                  onClick={() => {
                    setBaseColor(entry.base);
                    setMethod(entry.method);
                  }}
                >
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: entry.base }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: entry.inverted }}
                  />
                  <span>
                    {entry.base} → {entry.inverted} ({entry.method})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">
            About Color Inversion
          </h2>
          <div className="text-sm text-blue-600">
            <p>Invert colors using different methods:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>
                <strong>RGB Inversion:</strong> Subtracts each RGB channel from
                255 (e.g., white → black)
              </li>
              <li>
                <strong>HSL Complementary:</strong> Shifts hue by 180° (complementary color)
              </li>
              <li>
                <strong>Lightness Inversion:</strong> Inverts lightness while preserving hue and saturation
              </li>
            </ul>
            <p className="mt-1">Contrast ratio indicates accessibility compliance (WCAG).</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorInversionTool;