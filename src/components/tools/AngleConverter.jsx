"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const AngleConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("deg");
  const [precision, setPrecision] = useState(6);
  const [normalize, setNormalize] = useState(false);

  // Conversion factors to radians (base unit)
  const conversionFactors = {
    deg: Math.PI / 180, // Degrees
    rad: 1, // Radians
    grad: Math.PI / 200, // Gradians (gons)
    turn: 2 * Math.PI, // Turns (revolutions)
    arcmin: Math.PI / (180 * 60), // Arcminutes
    arcsec: Math.PI / (180 * 3600), // Arcseconds
    mil: Math.PI / 3200, // Angular mils (NATO)
  };

  // Display names for units
  const unitDisplayNames = {
    deg: "° (degrees)",
    rad: "rad (radians)",
    grad: "grad (gradians)",
    turn: "turn (revolutions)",
    arcmin: "' (arcminutes)",
    arcsec: '" (arcseconds)',
    mil: "mil (angular mils)",
  };

  // Convert value to all units
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      let valueInRadians = inputValue * conversionFactors[fromUnit];
      
      // Normalize to 0-2π if enabled
      if (normalize) {
        valueInRadians = valueInRadians % (2 * Math.PI);
        if (valueInRadians < 0) valueInRadians += 2 * Math.PI;
      }

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        acc[unit] = (valueInRadians / conversionFactors[unit]).toFixed(precision);
        return acc;
      }, {});
    },
    [precision, normalize]
  );

  // Calculate trigonometric functions
  const calculateTrigFunctions = useCallback((angleInRadians) => {
    return {
      sin: Math.sin(angleInRadians).toFixed(precision),
      cos: Math.cos(angleInRadians).toFixed(precision),
      tan:
        Math.tan(angleInRadians) === Infinity
          ? "undefined"
          : Math.tan(angleInRadians).toFixed(precision),
    };
  }, [precision]);

  const results = convertValue(value, unit);
  const trigResults = value
    ? calculateTrigFunctions(value * conversionFactors[unit])
    : null;

  // Reset function
  const reset = () => {
    setValue("");
    setUnit("deg");
    setPrecision(6);
    setNormalize(false);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Angle Converter
        </h1>

        {/* Input Section */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Angle
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter angle"
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
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (decimal places)
              </label>
              <input
                type="number"
                min="0"
                max="12"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(12, e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={normalize}
                  onChange={(e) => setNormalize(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Normalize (0-360°)</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
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
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
                Conversions
                <button
                  onClick={() =>
                    copyToClipboard(
                      Object.entries(results)
                        .map(([u, v]) => `${unitDisplayNames[u]}: ${v}`)
                        .join("\n")
                    )
                  }
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaCopy />
                </button>
              </h2>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {Object.entries(results).map(([unit, val]) => (
                  <p key={unit}>
                    {unitDisplayNames[unit]}: {val}
                  </p>
                ))}
              </div>
            </div>

            {trigResults && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
                  Trigonometric Values
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `Sin: ${trigResults.sin}\nCos: ${trigResults.cos}\nTan: ${trigResults.tan}`
                      )
                    }
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaCopy />
                  </button>
                </h2>
                <div className="text-sm">
                  <p>Sin: {trigResults.sin}</p>
                  <p>Cos: {trigResults.cos}</p>
                  <p>Tan: {trigResults.tan}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <details open className="text-sm text-blue-600">
            <summary className="cursor-pointer font-semibold text-blue-700 mb-2">
              Conversion References
            </summary>
            <ul className="list-disc list-inside space-y-1">
              <li>1 turn = 2π rad = 360° = 400 grad</li>
              <li>1° = 60 arcmin = 3600 arcsec</li>
              <li>1 rad ≈ 57.2958°</li>
              <li>1 mil ≈ 0.05625° (NATO definition)</li>
            </ul>
          </details>
        </div>

        {/* Features */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Convert between 7 angle units</li>
            <li>Adjustable precision (0-12 decimal places)</li>
            <li>Normalize angles to 0-360° range</li>
            <li>Calculate trigonometric functions</li>
            <li>Copy results to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AngleConverter;