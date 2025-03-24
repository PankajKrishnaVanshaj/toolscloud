"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const ColorToGrayscaleConverter = () => {
  const [inputColor, setInputColor] = useState("#FF6B6B");
  const [method, setMethod] = useState("luminance");
  const [grayscaleColor, setGrayscaleColor] = useState("");
  const [customWeights, setCustomWeights] = useState({ r: 0.2126, g: 0.7152, b: 0.0722 });
  const [previewSize, setPreviewSize] = useState(100);
  const [error, setError] = useState("");

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
          const hex = Math.round(x).toString(16);
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
    return { h, s, l };
  };

  // Convert color to grayscale
  const convertToGrayscale = useCallback(
    (hex, method) => {
      const rgb = hexToRgb(hex);
      let gray;

      switch (method) {
        case "luminance":
          gray = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
          break;
        case "average":
          gray = (rgb.r + rgb.g + rgb.b) / 3;
          break;
        case "lightness":
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          gray = hsl.l * 255;
          break;
        case "desaturation":
          gray = Math.max(rgb.r, rgb.g, rgb.b) * 0.5 + Math.min(rgb.r, rgb.g, rgb.b) * 0.5;
          break;
        case "custom":
          const totalWeight = customWeights.r + customWeights.g + customWeights.b;
          if (totalWeight === 0) return "#000000";
          gray =
            (customWeights.r * rgb.r + customWeights.g * rgb.g + customWeights.b * rgb.b) /
            totalWeight;
          break;
        default:
          gray = 0;
      }

      return rgbToHex(gray, gray, gray);
    },
    [customWeights]
  );

  // Update grayscale color when inputs change
  useEffect(() => {
    if (/^#[0-9A-Fa-f]{6}$/.test(inputColor)) {
      setError("");
      const grayscale = convertToGrayscale(inputColor, method);
      setGrayscaleColor(grayscale);
    } else {
      setError("Please enter a valid HEX color (e.g., #FF6B6B)");
      setGrayscaleColor("");
    }
  }, [inputColor, method, convertToGrayscale]);

  // Reset to default state
  const reset = () => {
    setInputColor("#FF6B6B");
    setMethod("luminance");
    setCustomWeights({ r: 0.2126, g: 0.7152, b: 0.0722 });
    setPreviewSize(100);
    setError("");
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color to Grayscale Converter
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input and Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-2 border-gray-200"
                />
                <input
                  type="text"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="#FF6B6B"
                />
                <button
                  onClick={() => copyToClipboard(inputColor)}
                  className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                >
                  <FaCopy />
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conversion Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="luminance">Luminance (WCAG)</option>
                <option value="average">Average</option>
                <option value="lightness">Lightness (HSL)</option>
                <option value="desaturation">Desaturation</option>
                <option value="custom">Custom Weights</option>
              </select>
            </div>

            {method === "custom" && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700">Custom Weights</h3>
                {["r", "g", "b"].map((channel) => (
                  <div key={channel} className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 w-8 capitalize">{channel}:</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={customWeights[channel]}
                      onChange={(e) =>
                        setCustomWeights((prev) => ({
                          ...prev,
                          [channel]: Math.max(0, Math.min(1, parseFloat(e.target.value))),
                        }))
                      }
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preview Size ({previewSize}px)
              </label>
              <input
                type="range"
                min="50"
                max="200"
                value={previewSize}
                onChange={(e) => setPreviewSize(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
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
              <h2 className="text-lg font-semibold mb-2">Grayscale Result</h2>
              {grayscaleColor ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-gray-600 mb-1">Original Color</p>
                    <div
                      className="rounded-lg shadow-inner border border-gray-200"
                      style={{
                        backgroundColor: inputColor,
                        width: `${previewSize}px`,
                        height: `${previewSize}px`,
                      }}
                    />
                    <p className="text-sm mt-2 text-center">
                      {inputColor}
                      <button
                        onClick={() => copyToClipboard(inputColor)}
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        Copy
                      </button>
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-gray-600 mb-1">Grayscale</p>
                    <div
                      className="rounded-lg shadow-inner border border-gray-200"
                      style={{
                        backgroundColor: grayscaleColor,
                        width: `${previewSize}px`,
                        height: `${previewSize}px`,
                      }}
                    />
                    <p className="text-sm mt-2 text-center">
                      {grayscaleColor}
                      <button
                        onClick={() => copyToClipboard(grayscaleColor)}
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        Copy
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Enter a valid HEX color to convert to grayscale
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">
            About Grayscale Conversion
          </h2>
          <div className="text-sm text-blue-600">
            <p>Convert colors to grayscale using various methods:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>
                <strong>Luminance (WCAG):</strong> Weighted (0.2126R + 0.7152G + 0.0722B) for
                human perception
              </li>
              <li>
                <strong>Average:</strong> Simple average of RGB values
              </li>
              <li>
                <strong>Lightness (HSL):</strong> Average of max and min RGB from HSL
              </li>
              <li>
                <strong>Desaturation:</strong> Midpoint between max and min RGB values
              </li>
              <li>
                <strong>Custom:</strong> User-defined weights for R, G, B channels
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorToGrayscaleConverter;