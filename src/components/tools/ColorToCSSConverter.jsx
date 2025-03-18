"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const ColorToCSSConverter = () => {
  const [color, setColor] = useState("#FF6B6B");
  const [alpha, setAlpha] = useState(1);
  const [cssFormats, setCssFormats] = useState({});
  const [history, setHistory] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    };
  };

  // Generate CSS formats
  const generateCSSFormats = useCallback(() => {
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    setCssFormats({
      hex: color.toUpperCase(),
      hexAlpha: `${color.toUpperCase()}${Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")}`,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`,
      cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    });

    // Add to history (limit to 10)
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item.hex !== color);
      return [{ hex: color, alpha }, ...newHistory].slice(0, 10);
    });
  }, [color, alpha]);

  useEffect(() => {
    generateCSSFormats();
  }, [generateCSSFormats]);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Optional: Add toast notification here
  };

  // Reset to default
  const reset = () => {
    setColor("#FF6B6B");
    setAlpha(1);
    setShowAdvanced(false);
  };

  // Load from history
  const loadFromHistory = (item) => {
    setColor(item.hex);
    setAlpha(item.alpha);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color to CSS Converter
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Input and Preview */}
          <div className="space-y-6">
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
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transparency: {Math.round(alpha * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div
              className="h-40 rounded-lg flex items-center justify-center text-white text-lg font-medium shadow-inner relative overflow-hidden"
              style={{ backgroundColor: cssFormats.hex }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), #fff",
                  backgroundSize: "20px 20px",
                  opacity: 1 - alpha,
                }}
              />
              <span className="relative z-10">Preview</span>
            </div>

            <button
              onClick={reset}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* CSS Formats */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">CSS Formats</h2>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-blue-500 hover:underline text-sm"
              >
                {showAdvanced ? "Hide Advanced" : "Show Advanced"}
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              {Object.entries(cssFormats)
                .filter(([format]) => showAdvanced || !["hexAlpha", "cmyk"].includes(format))
                .map(([format, value]) => (
                  <div key={format} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {format}:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">{value}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(value)}
                      className="text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1"
                    >
                      <FaCopy /> Copy
                    </button>
                  </div>
                ))}
            </div>

            {/* Color History */}
            {history.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Color History</h3>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {history.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => loadFromHistory(item)}
                      className="w-8 h-8 rounded-full border hover:border-blue-500 transition-colors"
                      style={{ backgroundColor: item.hex, opacity: item.alpha }}
                      title={`${item.hex} (Opacity: ${Math.round(item.alpha * 100)}%)`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Usage Example */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">CSS Usage Example</h2>
          <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
            {`.example-element {
  background-color: ${cssFormats.rgba};
  border: 2px solid ${cssFormats.hex};
  color: ${cssFormats.hsla};
}`}
          </pre>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple CSS formats: HEX, RGB, RGBA, HSL, HSLA</li>
            <li>Advanced formats: HEX with Alpha, CMYK</li>
            <li>Adjustable transparency</li>
            <li>Color history with quick reload</li>
            <li>Real-time preview with transparency grid</li>
            <li>Copy to clipboard functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorToCSSConverter;