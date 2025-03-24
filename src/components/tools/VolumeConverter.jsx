"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const VolumeConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("L");
  const [precision, setPrecision] = useState(4);
  const [favorites, setFavorites] = useState(["L", "mL", "galUS", "fl_ozUS"]);

  // Conversion factors to Liters (L)
  const conversionFactors = {
    L: 1,              // Liter
    mL: 1e-3,          // Milliliter
    cm3: 1e-3,         // Cubic centimeter (cm³)
    m3: 1e3,           // Cubic meter (m³)
    in3: 0.0163871,    // Cubic inch (in³)
    ft3: 28.3168,      // Cubic foot (ft³)
    galUS: 3.78541,    // US Gallon
    galUK: 4.54609,    // UK/Imperial Gallon
    qtUS: 0.946353,    // US Quart
    qtUK: 1.13652,     // UK/Imperial Quart
    ptUS: 0.473176,    // US Pint
    ptUK: 0.568261,    // UK/Imperial Pint
    fl_ozUS: 0.0295735,// US Fluid Ounce
    fl_ozUK: 0.0284131,// UK/Imperial Fluid Ounce
    tbsp: 0.0147868,   // Tablespoon (US)
    tsp: 0.00492892,   // Teaspoon (US)
  };

  // Display names for units
  const unitDisplayNames = {
    L: "L",
    mL: "mL",
    cm3: "cm³",
    m3: "m³",
    in3: "in³",
    ft3: "ft³",
    galUS: "gal (US)",
    galUK: "gal (UK)",
    qtUS: "qt (US)",
    qtUK: "qt (UK)",
    ptUS: "pt (US)",
    ptUK: "pt (UK)",
    fl_ozUS: "fl oz (US)",
    fl_ozUK: "fl oz (UK)",
    tbsp: "tbsp",
    tsp: "tsp",
  };

  // Convert value to all units
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInLiters = inputValue * conversionFactors[fromUnit];
      return Object.keys(conversionFactors).reduce((acc, unit) => {
        acc[unit] = valueInLiters / conversionFactors[unit];
        return acc;
      }, {});
    },
    [conversionFactors]
  );

  // Toggle favorite units
  const toggleFavorite = (unit) => {
    setFavorites((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    );
  };

  // Copy result to clipboard
  const copyToClipboard = (unit, val) => {
    navigator.clipboard.writeText(val.toFixed(precision));
    alert(`Copied ${val.toFixed(precision)} ${unitDisplayNames[unit]} to clipboard!`);
  };

  // Reset inputs
  const reset = () => {
    setValue("");
    setUnit("L");
    setPrecision(4);
  };

  const results = convertValue(value, unit);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Volume Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter volume"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision ({precision} digits)
              </label>
              <input
                type="range"
                min="0"
                max="8"
                value={precision}
                onChange={(e) => setPrecision(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={reset}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {value && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                Conversions:
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                {Object.entries(results)
                  .filter(([unit]) => favorites.includes(unit))
                  .map(([unit, val]) => (
                    <div
                      key={unit}
                      className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm"
                    >
                      <span>
                        {unitDisplayNames[unit]}:{" "}
                        {val.toLocaleString("en-US", {
                          maximumFractionDigits: precision,
                          useGrouping: true,
                        })}
                      </span>
                      <button
                        onClick={() => copyToClipboard(unit, val)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Favorites Selection */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">
              Select Favorite Units
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.keys(conversionFactors).map((u) => (
                <label key={u} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={favorites.includes(u)}
                    onChange={() => toggleFavorite(u)}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {unitDisplayNames[u]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="text-sm text-gray-600">
            <details className="group">
              <summary className="cursor-pointer font-medium flex items-center gap-2">
                Conversion References
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>1 L = 1000 mL = 1000 cm³</li>
                <li>1 m³ = 1000 L</li>
                <li>1 gal (US) = 3.78541 L</li>
                <li>1 gal (UK) = 4.54609 L</li>
                <li>1 fl oz (US) = 29.5735 mL</li>
                <li>1 tbsp = 3 tsp = 14.7868 mL</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolumeConverter;