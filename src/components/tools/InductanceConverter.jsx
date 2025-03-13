"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const InductanceConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("H");
  const [current, setCurrent] = useState("");
  const [frequency, setFrequency] = useState(""); // For reactance calculation
  const [displayPrecision, setDisplayPrecision] = useState(4);

  // Conversion factors to Henry (H)
  const conversionFactors = {
    H: 1, // Henry
    mH: 1e-3, // Millihenry
    uH: 1e-6, // Microhenry
    nH: 1e-9, // Nanohenry
    pH: 1e-12, // Picohenry (new)
    kH: 1e3, // Kilohenry
    MH: 1e6, // Megahenry
    GH: 1e9, // Gigahenry
    abH: 1e-9, // Abhenry
    stH: 8.987552e11, // Stathenry
  };

  // Display names for units
  const unitDisplayNames = {
    H: "H",
    mH: "mH",
    uH: "μH",
    nH: "nH",
    pH: "pH",
    kH: "kH",
    MH: "MH",
    GH: "GH",
    abH: "abH",
    stH: "stH",
  };

  // Convert inductance value
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInHenry = inputValue * conversionFactors[fromUnit];

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        acc[unit] = valueInHenry / conversionFactors[unit];
        return acc;
      }, {});
    },
    [conversionFactors]
  );

  // Calculate stored energy
  const calculateEnergy = useCallback(() => {
    if (!value || !current || isNaN(value) || isNaN(current)) return null;
    const inductanceInHenry = value * conversionFactors[unit];
    const currentInAmperes = parseFloat(current);
    // E = (1/2) × L × I² (Joules)
    return 0.5 * inductanceInHenry * currentInAmperes * currentInAmperes;
  }, [value, current, unit, conversionFactors]);

  // Calculate inductive reactance (XL = 2πfL)
  const calculateReactance = useCallback(() => {
    if (!value || !frequency || isNaN(value) || isNaN(frequency)) return null;
    const inductanceInHenry = value * conversionFactors[unit];
    const freqInHz = parseFloat(frequency);
    // XL = 2πfL (Ohms)
    return 2 * Math.PI * freqInHz * inductanceInHenry;
  }, [value, frequency, unit, conversionFactors]);

  // Reset all inputs
  const reset = () => {
    setValue("");
    setUnit("H");
    setCurrent("");
    setFrequency("");
    setDisplayPrecision(4);
  };

  // Download results as text
  const downloadResults = () => {
    const results = convertValue(value, unit);
    const energy = calculateEnergy();
    const reactance = calculateReactance();
    let text = `Inductance Converter Results\n\nInput: ${value} ${unitDisplayNames[unit]}\n\nConversions:\n`;
    for (const [u, val] of Object.entries(results)) {
      text += `${unitDisplayNames[u]}: ${val.toExponential(displayPrecision)}\n`;
    }
    if (energy) {
      text += `\nStored Energy:\nJoules: ${energy.toExponential(displayPrecision)}\nmJ: ${(energy * 1e3).toExponential(displayPrecision)}\nμJ: ${(energy * 1e6).toExponential(displayPrecision)}\n`;
    }
    if (reactance) {
      text += `\nInductive Reactance:\nOhms: ${reactance.toExponential(displayPrecision)}\nkΩ: ${(reactance * 1e-3).toExponential(displayPrecision)}\n`;
    }
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inductance-results-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const results = convertValue(value, unit);
  const energyStored = calculateEnergy();
  const reactance = calculateReactance();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Inductance Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inductance
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter inductance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Current (A)
              </label>
              <input
                type="number"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter current"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-xs text-gray-500">For energy calculation</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency (Hz)
              </label>
              <input
                type="number"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="Enter frequency"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-xs text-gray-500">For reactance calculation</p>
            </div>
          </div>

          {/* Display Precision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Precision ({displayPrecision} digits)
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={displayPrecision}
              onChange={(e) => setDisplayPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Conversions</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {val.toExponential(displayPrecision)}
                    </p>
                  ))}
                </div>
              </div>
              {energyStored && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Stored Energy</h2>
                  <p>Joules: {energyStored.toExponential(displayPrecision)}</p>
                  <p>mJ: {(energyStored * 1e3).toExponential(displayPrecision)}</p>
                  <p>μJ: {(energyStored * 1e6).toExponential(displayPrecision)}</p>
                  <p className="mt-2 text-xs text-gray-600">E = ½ × L × I²</p>
                </div>
              )}
              {reactance && (
                <div className="p-4 bg-green-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Inductive Reactance</h2>
                  <p>Ohms: {reactance.toExponential(displayPrecision)}</p>
                  <p>kΩ: {(reactance * 1e-3).toExponential(displayPrecision)}</p>
                  <p className="mt-2 text-xs text-gray-600">XL = 2πfL</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadResults}
              disabled={!value}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Info</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between H, mH, μH, nH, pH, kH, MH, GH, abH, stH</li>
            <li>Calculate stored energy (E = ½LI²)</li>
            <li>Calculate inductive reactance (XL = 2πfL)</li>
            <li>Adjustable display precision</li>
            <li>Download results as text file</li>
            <li>1 stH ≈ 8.987552 × 10¹¹ H (electrostatic unit)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InductanceConverter;