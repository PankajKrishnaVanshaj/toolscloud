"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaLock, FaUnlock, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const HexCodeGenerator = () => {
  const [hexCodes, setHexCodes] = useState([]);
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState("full"); // full, short, uppercase
  const [isCopied, setIsCopied] = useState(null); // null or index of copied code
  const [history, setHistory] = useState([]);
  const [lockedColors, setLockedColors] = useState([]); // Array of locked hex codes
  const [options, setOptions] = useState({
    prefix: "#",          // Custom prefix
    includeAlpha: false,  // Include alpha channel (8-digit hex)
    hueRange: "random",   // random, warm, cool
  });

  // Generate a single hex code
  const generateHexCode = useCallback(() => {
    let hex;
    if (options.includeAlpha) {
      hex = Math.floor(Math.random() * 4294967295).toString(16).padStart(8, "0"); // 8-digit with alpha
    } else {
      hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"); // 6-digit
    }

    // Hue range adjustment
    if (options.hueRange !== "random") {
      const hslToHex = (h, s, l) => {
        const rgb = hslToRgb(h, s, l);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
      };
      const hslToRgb = (h, s, l) => {
        s /= 100;
        l /= 100;
        const k = (n) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
      };
      const rgbToHex = (r, g, b) => ((r << 16) + (g << 8) + b).toString(16).padStart(6, "0");

      const hue = options.hueRange === "warm" ? Math.random() * 60 : Math.random() * 120 + 180; // Warm: 0-60, Cool: 180-300
      hex = hslToHex(hue, 70, 50); // Saturation 70%, Lightness 50%
    }

    if (format === "short" && !options.includeAlpha) {
      if (hex[0] === hex[1] && hex[2] === hex[3] && hex[4] === hex[5]) {
        hex = hex[0] + hex[2] + hex[4];
      }
    }
    if (format === "uppercase") hex = hex.toUpperCase();

    return `${options.prefix}${hex}`;
  }, [format, options]);

  // Generate multiple hex codes
  const generateHexCodes = useCallback(() => {
    const newCount = Math.min(count, 100) - lockedColors.length;
    const newHexCodes = [
      ...lockedColors,
      ...Array.from({ length: Math.max(0, newCount) }, generateHexCode),
    ];
    setHexCodes(newHexCodes);
    setHistory((prev) => [...prev, { codes: newHexCodes, count, format, options }].slice(-5));
    setIsCopied(null);
  }, [count, lockedColors, generateHexCode]);

  // Copy to clipboard
  const copyToClipboard = (index) => {
    navigator.clipboard
      .writeText(hexCodes[index])
      .then(() => {
        setIsCopied(index);
        setTimeout(() => setIsCopied(null), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  // Download as text
  const downloadAsText = () => {
    const text = hexCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hex-codes-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear hex codes
  const clearHexCodes = () => {
    setHexCodes([]);
    setLockedColors([]);
    setIsCopied(null);
  };

  // Toggle lock on a color
  const toggleLock = (index) => {
    const hex = hexCodes[index];
    setLockedColors((prev) =>
      prev.includes(hex) ? prev.filter((c) => c !== hex) : [...prev, hex]
    );
  };

  // Handle option change
  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Hex Code Generator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Hex Codes (1-100)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full">Full (#RRGGBB)</option>
                <option value="short">Short (#RGB when possible)</option>
                <option value="uppercase">Uppercase</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prefix:</label>
                <input
                  type="text"
                  value={options.prefix}
                  onChange={(e) => handleOptionChange("prefix", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., #"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Hue Range:</label>
                <select
                  value={options.hueRange}
                  onChange={(e) => handleOptionChange("hueRange", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="random">Random</option>
                  <option value="warm">Warm (Reds/Yellows)</option>
                  <option value="cool">Cool (Blues/Greens)</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeAlpha}
                  onChange={() => handleOptionChange("includeAlpha", !options.includeAlpha)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Alpha (#RRGGBBAA)</label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateHexCodes}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Hex Codes
            </button>
            {hexCodes.length > 0 && (
              <>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearHexCodes}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output Display */}
        {hexCodes.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Hex Codes ({hexCodes.length}):
            </h2>
            <div className="max-h-64 overflow-y-auto space-y-3">
              {hexCodes.map((hex, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-md border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="font-mono text-sm text-gray-800 flex-1 truncate">{hex}</span>
                  <button
                    onClick={() => toggleLock(index)}
                    className={`px-2 py-1 rounded-md text-white transition-colors ${
                      lockedColors.includes(hex) ? "bg-yellow-600 hover:bg-yellow-700" : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    {lockedColors.includes(hex) ? <FaLock /> : <FaUnlock />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(index)}
                    className={`px-3 py-1 rounded-md text-white transition-colors ${
                      isCopied === index ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    <FaCopy />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Generations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{entry.codes.length} codes ({entry.format}, {entry.options.hueRange})</span>
                  <button
                    onClick={() => {
                      setHexCodes(entry.codes);
                      setCount(entry.count);
                      setFormat(entry.format);
                      setOptions(entry.options);
                      setLockedColors([]);
                    }}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Generate full, short, or uppercase hex codes</li>
            <li>Custom prefix and alpha channel support</li>
            <li>Warm or cool hue ranges</li>
            <li>Lock colors, copy, download, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HexCodeGenerator;