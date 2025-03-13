"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const TemperatureConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("C");
  const [difference, setDifference] = useState("");
  const [showDifference, setShowDifference] = useState(false);
  const [precision, setPrecision] = useState(2);
  const [history, setHistory] = useState([]);

  // Conversion functions to Celsius as base unit
  const convertToCelsius = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return null;
    const val = parseFloat(inputValue);

    switch (fromUnit) {
      case "C":
        return val;
      case "F":
        return (val - 32) * 5 / 9;
      case "K":
        return val - 273.15;
      case "R":
        return (val - 491.67) * 5 / 9;
      default:
        return null;
    }
  }, []);

  const convertFromCelsius = useCallback((celsius, toUnit) => {
    switch (toUnit) {
      case "C":
        return celsius;
      case "F":
        return celsius * 9 / 5 + 32;
      case "K":
        return celsius + 273.15;
      case "R":
        return (celsius + 273.15) * 9 / 5;
      default:
        return null;
    }
  }, []);

  const units = {
    C: "°C (Celsius)",
    F: "°F (Fahrenheit)",
    K: "K (Kelvin)",
    R: "°R (Rankine)",
  };

  const convertAll = useCallback(
    (inputValue, fromUnit) => {
      const celsius = convertToCelsius(inputValue, fromUnit);
      if (celsius === null) return {};

      return Object.keys(units).reduce((acc, u) => {
        acc[u] = convertFromCelsius(celsius, u);
        return acc;
      }, {});
    },
    [convertToCelsius, convertFromCelsius, units]
  );

  const calculateDifference = useCallback(
    (baseValue, diff) => {
      if (!baseValue || !diff || isNaN(diff)) return {};
      const celsiusBase = convertToCelsius(baseValue, unit);
      const celsiusDiff = parseFloat(diff);

      return Object.keys(units).reduce((acc, u) => {
        acc[u] = convertFromCelsius(celsiusBase + celsiusDiff, u);
        return acc;
      }, {});
    },
    [convertToCelsius, convertFromCelsius, unit, units]
  );

  const handleConvert = () => {
    if (value) {
      const results = convertAll(value, unit);
      const diffResults = showDifference && difference ? calculateDifference(value, difference) : {};
      setHistory((prev) => [
        {
          input: `${value} ${units[unit]}`,
          results,
          difference: diffResults,
          timestamp: new Date().toLocaleString(),
        },
        ...prev.slice(0, 9), // Keep last 10 entries
      ]);
    }
  };

  const reset = () => {
    setValue("");
    setUnit("C");
    setDifference("");
    setShowDifference(false);
    setPrecision(2);
    setHistory([]);
  };

  const downloadResults = () => {
    const text = history
      .map((entry) => {
        let output = `${entry.timestamp}\nInput: ${entry.input}\nConversions:\n`;
        output += Object.entries(entry.results)
          .map(([u, val]) => `${units[u]}: ${val.toFixed(precision)}`)
          .join("\n");
        if (entry.difference && Object.keys(entry.difference).length) {
          output += "\nAfter Difference:\n";
          output += Object.entries(entry.difference)
            .map(([u, val]) => `${units[u]}: ${val.toFixed(precision)}`)
            .join("\n");
        }
        return output + "\n\n";
      })
      .join("");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `temperature-conversions-${Date.now()}.txt`;
    link.click();
  };

  const results = convertAll(value, unit);
  const differenceResults = showDifference ? calculateDifference(value, difference) : {};

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Temperature Converter
        </h1>

        {/* Input Section */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter temperature"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(units).map(([u, name]) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature Difference (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={difference}
                  onChange={(e) => {
                    setDifference(e.target.value);
                    setShowDifference(true);
                  }}
                  placeholder="Enter difference (°C)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    setDifference("");
                    setShowDifference(false);
                  }}
                  className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Precision ({precision})
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
            <div className="flex gap-2">
              <button
                onClick={handleConvert}
                disabled={!value}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Convert
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Conversions</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([u, val]) => (
                    <p key={u}>
                      {units[u]}: {val ? val.toFixed(precision) : "N/A"}
                    </p>
                  ))}
                </div>
              </div>
              {showDifference && difference && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">After Difference</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(differenceResults).map(([u, val]) => (
                      <p key={u}>
                        {units[u]}: {val ? val.toFixed(precision) : "N/A"}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Conversion History</h2>
                <button
                  onClick={downloadResults}
                  className="py-1 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center transition-colors"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto text-sm">
                {history.map((entry, index) => (
                  <div key={index} className="mb-2 p-2 bg-white rounded-md">
                    <p className="font-medium">{entry.timestamp}</p>
                    <p>Input: {entry.input}</p>
                    <p>
                      Results:{" "}
                      {Object.entries(entry.results)
                        .map(([u, val]) => `${u}: ${val.toFixed(precision)}`)
                        .join(", ")}
                    </p>
                    {entry.difference && Object.keys(entry.difference).length > 0 && (
                      <p>
                        Difference:{" "}
                        {Object.entries(entry.difference)
                          .map(([u, val]) => `${u}: ${val.toFixed(precision)}`)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details>
              <summary className="cursor-pointer font-semibold text-blue-700">
                Conversion Formulas
              </summary>
              <ul className="list-disc list-inside mt-2 text-blue-600 text-sm">
                <li>°F = (°C × 9/5) + 32</li>
                <li>K = °C + 273.15</li>
                <li>°R = (°C + 273.15) × 9/5</li>
                <li>°C = (°F - 32) × 5/9</li>
                <li>°C = K - 273.15</li>
                <li>°C = (°R - 491.67) × 5/9</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureConverter;