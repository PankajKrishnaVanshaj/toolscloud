"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const DigitalStorageConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("B");
  const [notation, setNotation] = useState("binary");
  const [precision, setPrecision] = useState(2); // Decimal places for results
  const [showBits, setShowBits] = useState(true); // Toggle bits display

  // Conversion factors to bytes
  const conversionFactors = {
    B: { binary: 1, decimal: 1 }, // Bytes
    KB: { binary: 1024, decimal: 1000 }, // Kilobytes
    MB: { binary: 1024 ** 2, decimal: 1000 ** 2 }, // Megabytes
    GB: { binary: 1024 ** 3, decimal: 1000 ** 3 }, // Gigabytes
    TB: { binary: 1024 ** 4, decimal: 1000 ** 4 }, // Terabytes
    PB: { binary: 1024 ** 5, decimal: 1000 ** 5 }, // Petabytes
    EB: { binary: 1024 ** 6, decimal: 1000 ** 6 }, // Exabytes
    ZB: { binary: 1024 ** 7, decimal: 1000 ** 7 }, // Zettabytes
    YB: { binary: 1024 ** 8, decimal: 1000 ** 8 }, // Yottabytes
    // Bits
    b: { binary: 1 / 8, decimal: 1 / 8 }, // Bits
    Kb: { binary: 1024 / 8, decimal: 1000 / 8 }, // Kilobits
    Mb: { binary: (1024 ** 2) / 8, decimal: (1000 ** 2) / 8 }, // Megabits
    Gb: { binary: (1024 ** 3) / 8, decimal: (1000 ** 3) / 8 }, // Gigabits
    Tb: { binary: (1024 ** 4) / 8, decimal: (1000 ** 4) / 8 }, // Terabits
  };

  const unitDisplayNames = {
    B: "B",
    KB: "KB",
    MB: "MB",
    GB: "GB",
    TB: "TB",
    PB: "PB",
    EB: "EB",
    ZB: "ZB",
    YB: "YB",
    b: "b",
    Kb: "Kb",
    Mb: "Mb",
    Gb: "Gb",
    Tb: "Tb",
  };

  // Convert value to all units
  const convertValue = useCallback(
    (inputValue, fromUnit, notationType) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInBytes = inputValue * conversionFactors[fromUnit][notationType];

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        acc[unit] = valueInBytes / conversionFactors[unit][notationType];
        return acc;
      }, {});
    },
    []
  );

  // Format size with dynamic units
  const formatSize = (size) => {
    if (size === 0) return `0`;
    const absSize = Math.abs(size);
    if (absSize >= 1e24) return `${(size / 1e24).toFixed(precision)}Y`;
    if (absSize >= 1e21) return `${(size / 1e21).toFixed(precision)}Z`;
    if (absSize >= 1e18) return `${(size / 1e18).toFixed(precision)}E`;
    if (absSize >= 1e15) return `${(size / 1e15).toFixed(precision)}P`;
    if (absSize >= 1e12) return `${(size / 1e12).toFixed(precision)}T`;
    if (absSize >= 1e9) return `${(size / 1e9).toFixed(precision)}G`;
    if (absSize >= 1e6) return `${(size / 1e6).toFixed(precision)}M`;
    if (absSize >= 1e3) return `${(size / 1e3).toFixed(precision)}K`;
    return `${size.toFixed(precision)}`;
  };

  // Reset inputs
  const reset = () => {
    setValue("");
    setUnit("B");
    setNotation("binary");
    setPrecision(2);
    setShowBits(true);
  };

  // Copy result to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const results = convertValue(value, unit, notation);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Digital Storage Converter
        </h1>

        {/* Input Section */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(conversionFactors).map((u) => (
                  <option key={u} value={u}>
                    {unitDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notation</label>
              <select
                value={notation}
                onChange={(e) => setNotation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="binary">Binary (1024)</option>
                <option value="decimal">Decimal (1000)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision ({precision})
              </label>
              <input
                type="range"
                min="0"
                max="6"
                value={precision}
                onChange={(e) => setPrecision(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <label className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                checked={showBits}
                onChange={(e) => setShowBits(e.target.checked)}
                className="accent-blue-500"
              />
              <span className="text-sm text-gray-700">Show Bits</span>
            </label>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Conversions</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results)
                    .filter(([u]) => (showBits ? true : !u.includes("b")))
                    .map(([unit, val]) => (
                      <div key={unit} className="flex items-center justify-between">
                        <span>
                          {unitDisplayNames[unit]}: {formatSize(val)}{" "}
                          {notation === "binary" && !unit.includes("b") ? "i" : ""}
                        </span>
                        <button
                          onClick={() => copyToClipboard(`${formatSize(val)} ${unitDisplayNames[unit]}`)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Copy to clipboard"
                        >
                          <FaCopy size={12} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Summary</h2>
                <p>Bytes: {results.B.toLocaleString()}</p>
                {showBits && <p>Bits: {(results.B * 8).toLocaleString()}</p>}
                <p className="mt-2 text-sm text-gray-600">
                  Base: {notation === "binary" ? "1024 (KiB, MiB, etc.)" : "1000 (KB, MB, etc.)"}
                </p>
                <button
                  onClick={() => copyToClipboard(`Bytes: ${results.B.toLocaleString()}${showBits ? `\nBits: ${(results.B * 8).toLocaleString()}` : ""}`)}
                  className="mt-2 py-1 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaCopy /> Copy Summary
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Info</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports bytes (B, KB, MB, etc.) and bits (b, Kb, Mb, etc.)</li>
            <li>Binary (1024) and Decimal (1000) notation</li>
            <li>Adjustable precision (0-6 decimal places)</li>
            <li>Copy individual values or summary to clipboard</li>
            <li>Toggle bit units visibility</li>
            <li>Binary notation uses "i" (e.g., KiB, MiB)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DigitalStorageConverter;