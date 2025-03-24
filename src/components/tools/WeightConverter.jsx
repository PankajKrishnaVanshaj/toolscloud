"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const WeightConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("kg");
  const [system, setSystem] = useState("all"); // 'metric', 'imperial', or 'all'
  const [precision, setPrecision] = useState(4); // Decimal precision
  const [copiedUnit, setCopiedUnit] = useState(null);

  // Conversion factors to kilograms (kg)
  const conversionFactors = {
    // Metric units
    kg: 1, // Kilogram
    g: 1e-3, // Gram
    mg: 1e-6, // Milligram
    ug: 1e-9, // Microgram
    t: 1e3, // Metric tonne
    // Imperial units
    lb: 0.453592, // Pound
    oz: 0.0283495, // Ounce
    st: 6.35029, // Stone
    gr: 0.00006479891, // Grain
    cwt: 50.8023, // Hundredweight (long)
    ton: 1016.047, // Imperial ton
  };

  const unitDisplayNames = {
    kg: "kg",
    g: "g",
    mg: "mg",
    ug: "µg",
    t: "t",
    lb: "lb",
    oz: "oz",
    st: "st",
    gr: "gr",
    cwt: "cwt",
    ton: "ton",
  };

  const unitFullNames = {
    kg: "Kilograms",
    g: "Grams",
    mg: "Milligrams",
    ug: "Micrograms",
    t: "Metric Tonnes",
    lb: "Pounds",
    oz: "Ounces",
    st: "Stones",
    gr: "Grains",
    cwt: "Hundredweight",
    ton: "Imperial Tons",
  };

  const metricUnits = ["kg", "g", "mg", "ug", "t"];
  const imperialUnits = ["lb", "oz", "st", "gr", "cwt", "ton"];

  // Convert value to all units
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInKg = inputValue * conversionFactors[fromUnit];

      const filteredUnits =
        system === "metric"
          ? metricUnits
          : system === "imperial"
          ? imperialUnits
          : Object.keys(conversionFactors);

      return filteredUnits.reduce((acc, unit) => {
        acc[unit] = valueInKg / conversionFactors[unit];
        return acc;
      }, {});
    },
    [system]
  );

  const results = convertValue(value, unit);

  // Copy to clipboard
  const copyToClipboard = (unit, val) => {
    navigator.clipboard.writeText(val.toFixed(precision));
    setCopiedUnit(unit);
    setTimeout(() => setCopiedUnit(null), 2000); // Reset after 2 seconds
  };

  // Reset form
  const reset = () => {
    setValue("");
    setUnit("kg");
    setSystem("all");
    setPrecision(4);
    setCopiedUnit(null);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Weight Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter weight"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(conversionFactors).map((u) => (
                    <option key={u} value={u}>
                      {unitDisplayNames[u]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Precision ({precision})
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

          {/* Unit System Toggle */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {["all", "metric", "imperial"].map((sys) => (
              <button
                key={sys}
                onClick={() => setSystem(sys)}
                className={`flex-1 px-4 py-2 rounded-md ${
                  system === sys
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-blue-600 hover:text-white transition-colors`}
              >
                {sys === "all" ? "All Units" : sys.charAt(0).toUpperCase() + sys.slice(1)}
              </button>
            ))}
            <button
              onClick={reset}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {value && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Conversions:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                {Object.entries(results).map(([unit, val]) => (
                  <div
                    key={unit}
                    className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors"
                  >
                    <span>
                      <strong>{unitDisplayNames[unit]}</strong> ({unitFullNames[unit]}):{" "}
                      {val.toLocaleString(undefined, {
                        minimumFractionDigits: precision,
                        maximumFractionDigits: precision,
                      })}
                    </span>
                    <button
                      onClick={() => copyToClipboard(unit, val)}
                      className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                      title="Copy to clipboard"
                    >
                      <FaCopy />
                      {copiedUnit === unit && (
                        <span className="ml-1 text-xs text-green-500">Copied!</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 text-sm text-gray-600">
            <details className="bg-gray-50 p-3 rounded-lg">
              <summary className="cursor-pointer font-medium text-gray-700">
                Conversion References
              </summary>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>1 kg = 2.20462 lb</li>
                <li>1 lb = 16 oz</li>
                <li>1 st = 14 lb</li>
                <li>1 t = 1000 kg</li>
                <li>1 ton = 2240 lb</li>
                <li>1 cwt = 112 lb</li>
              </ul>
            </details>
          </div>

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between metric and imperial units</li>
              <li>Adjustable decimal precision (0-8)</li>
              <li>Copy results to clipboard</li>
              <li>Filter by unit system (All, Metric, Imperial)</li>
              <li>Responsive design with Tailwind CSS</li>
              <li>Reset functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightConverter;