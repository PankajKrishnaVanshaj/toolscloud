"use client";
import React, { useState, useCallback } from "react";
import { FaSync } from "react-icons/fa";

const LengthConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("m");
  const [system, setSystem] = useState("all");
  const [precision, setPrecision] = useState(4);
  const [showComparison, setShowComparison] = useState(true);

  // Conversion factors to meters (m)
  const conversionFactors = {
    // Metric
    km: 1000,
    m: 1,
    cm: 0.01,
    mm: 0.001,
    um: 1e-6,
    nm: 1e-9,
    // Imperial
    mi: 1609.34,
    yd: 0.9144,
    ft: 0.3048,
    in: 0.0254,
    // Nautical
    nmile: 1852, // Nautical mile
    fathom: 1.8288, // Fathom
    // Astronomical
    ly: 9.461e15,
    au: 1.496e11,
    pc: 3.086e16,
  };

  // Display names and full names for units
  const unitDetails = {
    km: { display: "km", full: "Kilometers" },
    m: { display: "m", full: "Meters" },
    cm: { display: "cm", full: "Centimeters" },
    mm: { display: "mm", full: "Millimeters" },
    um: { display: "μm", full: "Micrometers" },
    nm: { display: "nm", full: "Nanometers" },
    mi: { display: "mi", full: "Miles" },
    yd: { display: "yd", full: "Yards" },
    ft: { display: "ft", full: "Feet" },
    in: { display: "in", full: "Inches" },
    nmile: { display: "nmi", full: "Nautical Miles" },
    fathom: { display: "ftm", full: "Fathoms" },
    ly: { display: "ly", full: "Light-Years" },
    au: { display: "AU", full: "Astronomical Units" },
    pc: { display: "pc", full: "Parsecs" },
  };

  // Unit systems for filtering
  const unitSystems = {
    metric: ["km", "m", "cm", "mm", "um", "nm"],
    imperial: ["mi", "yd", "ft", "in"],
    nautical: ["nmile", "fathom"],
    astronomical: ["ly", "au", "pc"],
  };

  // Convert value with precision
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInMeters = inputValue * conversionFactors[fromUnit];

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        const converted = valueInMeters / conversionFactors[unit];
        acc[unit] = Math.abs(converted) < 0.0001 && converted !== 0
          ? converted.toExponential(precision)
          : converted.toFixed(precision);
        return acc;
      }, {});
    },
    [precision]
  );

  const getFilteredUnits = () => {
    if (system === "all") return Object.keys(conversionFactors);
    return unitSystems[system] || [];
  };

  // Reset inputs
  const reset = () => {
    setValue("");
    setUnit("m");
    setSystem("all");
    setPrecision(4);
    setShowComparison(true);
  };

  const results = convertValue(value, unit);
  const filteredUnits = getFilteredUnits();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Length Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Length Value
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">
                From Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(conversionFactors).map((u) => (
                  <option key={u} value={u}>
                    {unitDetails[u].full} ({unitDetails[u].display})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit System
              </label>
              <div className="flex flex-wrap gap-2">
                {["all", "metric", "imperial", "nautical", "astronomical"].map((sys) => (
                  <button
                    key={sys}
                    onClick={() => setSystem(sys)}
                    className={`px-3 py-1 rounded-md text-sm capitalize ${
                      system === sys
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    } transition-colors`}
                  >
                    {sys}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision ({precision} decimals)
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
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showComparison}
                  onChange={(e) => setShowComparison(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Comparisons</span>
              </label>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">Conversions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
                  {filteredUnits.map((unit) => (
                    <p key={unit} className="flex justify-between">
                      <span>{unitDetails[unit].full}:</span>
                      <span className="font-mono">{results[unit]}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Visual Comparison */}
              {showComparison && value && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2 text-blue-800">
                    Real-World Comparison
                  </h2>
                  <div className="space-y-2 text-sm text-blue-600">
                    <p>
                      {value} {unitDetails[unit].display} is approximately:
                    </p>
                    <ul className="list-disc list-inside">
                      {unit === "m" && value >= 1 && (
                        <li>{Math.round(value / 0.9144)} football fields</li>
                      )}
                      {unit === "km" && value >= 1 && (
                        <li>
                          {Math.round((value * 1000) / 40075 * 100)}% of Earth's circumference
                        </li>
                      )}
                      {unit === "mi" && value >= 1 && (
                        <li>{Math.round(value / 238855 * 100)}% of the distance to the Moon</li>
                      )}
                      {unit === "ly" && value > 0 && (
                        <li>{(value * 9.461e12).toExponential(2)} km</li>
                      )}
                      {unit === "nmile" && value >= 1 && (
                        <li>{Math.round(value * 1852 / 111000)}% across the English Channel</li>
                      )}
                      {unit === "ft" && value >= 1 && (
                        <li>{Math.round(value / 330)}% of the Eiffel Tower's height</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              onClick={reset}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details className="group">
            <summary className="cursor-pointer font-medium flex items-center gap-2">
              Conversion References
              <span className="group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>1 km = 1000 m</li>
              <li>1 mi = 1609.34 m</li>
              <li>1 ft = 0.3048 m</li>
              <li>1 nmi = 1852 m</li>
              <li>1 ly = 9.461 × 10¹⁵ m</li>
              <li>1 AU = 1.496 × 10¹¹ m</li>
            </ul>
          </details>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports metric, imperial, nautical, and astronomical units</li>
            <li>Adjustable precision (0-8 decimals)</li>
            <li>Real-world length comparisons</li>
            <li>Filter by unit system</li>
            <li>Reset functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LengthConverter;