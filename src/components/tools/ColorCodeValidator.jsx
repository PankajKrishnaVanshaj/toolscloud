"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaEyeDropper } from "react-icons/fa";

const ColorCodeValidator = () => {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState("hex");
  const [validationResult, setValidationResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Validation functions
  const validateHex = (value) => {
    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    if (hexRegex.test(value)) {
      const color = value.length === 4 ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}` : value;
      return { isValid: true, color, message: "Valid HEX color code" };
    }
    return { isValid: false, color: null, message: "Invalid HEX color code (e.g., #FFF or #FFFFFF)" };
  };

  const validateRgb = (value) => {
    const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
    const match = value.match(rgbRegex);
    if (match) {
      const [_, r, g, b] = match;
      const rgb = { r: parseInt(r), g: parseInt(g), b: parseInt(b) };
      if (rgb.r >= 0 && rgb.r <= 255 && rgb.g >= 0 && rgb.g <= 255 && rgb.b >= 0 && rgb.b <= 255) {
        return { isValid: true, color: rgbToHex(rgb.r, rgb.g, rgb.b), message: "Valid RGB color code" };
      }
    }
    return { isValid: false, color: null, message: "Invalid RGB color code (e.g., rgb(255, 107, 107))" };
  };

  const validateHsl = (value) => {
    const hslRegex = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i;
    const match = value.match(hslRegex);
    if (match) {
      const [_, h, s, l] = match;
      const hsl = { h: parseInt(h), s: parseInt(s), l: parseInt(l) };
      if (hsl.h >= 0 && hsl.h <= 360 && hsl.s >= 0 && hsl.s <= 100 && hsl.l >= 0 && hsl.l <= 100) {
        return { isValid: true, color: hslToHex(hsl.h, hsl.s, hsl.l), message: "Valid HSL color code" };
      }
    }
    return { isValid: false, color: null, message: "Invalid HSL color code (e.g., hsl(0, 50%, 50%))" };
  };

  // Conversion utilities
  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
  };

  const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return rgbToHex(r, g, b);
  };

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const hexToHsl = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  // Validate color
  const validateColor = useCallback(() => {
    let result;
    switch (format) {
      case "hex": result = validateHex(input.trim()); break;
      case "rgb": result = validateRgb(input.trim()); break;
      case "hsl": result = validateHsl(input.trim()); break;
      default: result = { isValid: false, color: null, message: "Select a format" };
    }
    setValidationResult(result);
    if (result.isValid) {
      setHistory((prev) => [...prev, { format, input: input.trim(), color: result.color }].slice(-5));
    }
  }, [input, format]);

  // Reset form
  const reset = () => {
    setInput("");
    setFormat("hex");
    setValidationResult(null);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Color Code Validator</h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="hex">HEX</option>
                <option value="rgb">RGB</option>
                <option value="hsl">HSL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter Color Code</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${format === "hex" ? "#FF6B6B" : format === "rgb" ? "rgb(255, 107, 107)" : "hsl(0, 50%, 50%)"}`}
                />
                <button
                  onClick={validateColor}
                  className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Validate
                </button>
              </div>
            </div>
          </div>

          {/* Validation Result */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Validation Result</h2>
            {validationResult ? (
              <div className="space-y-4">
                <p className={`text-sm ${validationResult.isValid ? "text-green-600" : "text-red-600"}`}>
                  {validationResult.message}
                </p>
                {validationResult.isValid && (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div
                      className="w-24 h-24 rounded-lg shadow flex-shrink-0"
                      style={{ backgroundColor: validationResult.color }}
                    />
                    <div className="space-y-2 text-sm">
                      <p>
                        HEX: {validationResult.color}{" "}
                        <button onClick={() => copyToClipboard(validationResult.color)} className="ml-2 text-blue-500 hover:underline">
                          <FaCopy />
                        </button>
                      </p>
                      <p>
                        RGB: {hexToRgb(validationResult.color)}{" "}
                        <button onClick={() => copyToClipboard(hexToRgb(validationResult.color))} className="ml-2 text-blue-500 hover:underline">
                          <FaCopy />
                        </button>
                      </p>
                      <p>
                        HSL: {hexToHsl(validationResult.color)}{" "}
                        <button onClick={() => copyToClipboard(hexToHsl(validationResult.color))} className="ml-2 text-blue-500 hover:underline">
                          <FaCopy />
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">Enter a color code and click "Validate" to see the result</p>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Recent Validations (Last 5)</h2>
              <ul className="space-y-2 text-sm">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded shadow"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span>{entry.format.toUpperCase()}: {entry.input} → HEX: {entry.color}</span>
                    <button
                      onClick={() => {
                        setInput(entry.input);
                        setFormat(entry.format);
                        validateColor();
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      Revalidate
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={() => alert("Color picker functionality requires browser API integration")}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <FaEyeDropper className="mr-2" /> Pick Color (Demo)
            </button>
          </div>

          {/* Format Guidelines */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Accepted Formats</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>HEX: #FFF or #FFFFFF (3 or 6 digits)</li>
              <li>RGB: rgb(255, 107, 107) (0-255 for each channel)</li>
              <li>HSL: hsl(0, 50%, 50%) (0-360 for hue, 0-100% for saturation/lightness)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorCodeValidator;