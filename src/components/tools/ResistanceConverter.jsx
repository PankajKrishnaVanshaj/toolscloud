"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator } from "react-icons/fa";

const ResistanceConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("ohm");
  const [voltage, setVoltage] = useState("");
  const [current, setCurrent] = useState("");
  const [precision, setPrecision] = useState(4);
  const [mode, setMode] = useState("convert"); // "convert" or "calculate"

  // Conversion factors to Ohm (Ω)
  const conversionFactors = {
    ohm: 1, // Ohm (Ω)
    kohm: 1e3, // Kiloohm (kΩ)
    Mohm: 1e6, // Megaohm (MΩ)
    Gohm: 1e9, // Gigaohm (GΩ)
    mohm: 1e-3, // Milliohm (mΩ)
    uohm: 1e-6, // Microohm (μΩ)
    nohm: 1e-9, // Nanoohm (nΩ)
  };

  // Display names for units
  const unitDisplayNames = {
    ohm: "Ω",
    kohm: "kΩ",
    Mohm: "MΩ",
    Gohm: "GΩ",
    mohm: "mΩ",
    uohm: "μΩ",
    nohm: "nΩ",
  };

  // Convert resistance value
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInOhm = parseFloat(inputValue) * conversionFactors[fromUnit];

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        acc[unit] = valueInOhm / conversionFactors[unit];
        return acc;
      }, {});
    },
    [conversionFactors]
  );

  // Calculate resistance using Ohm's Law (R = V/I)
  const calculateResistanceFromOhmsLaw = useCallback(() => {
    if (!voltage || !current || isNaN(voltage) || isNaN(current) || current === "0") {
      return null;
    }
    return parseFloat(voltage) / parseFloat(current);
  }, [voltage, current]);

  // Reset all inputs
  const reset = () => {
    setValue("");
    setUnit("ohm");
    setVoltage("");
    setCurrent("");
    setPrecision(4);
    setMode("convert");
  };

  const results = convertValue(value, unit);
  const calculatedResistance = calculateResistanceFromOhmsLaw();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Resistance Converter & Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setMode("convert")}
              className={`px-4 py-2 text-sm font-medium border rounded-l-md focus:z-10 focus:ring-2 focus:ring-blue-500 ${
                mode === "convert"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Convert
            </button>
            <button
              onClick={() => setMode("calculate")}
              className={`px-4 py-2 text-sm font-medium border rounded-r-md focus:z-10 focus:ring-2 focus:ring-blue-500 ${
                mode === "calculate"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mode === "convert" ? (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resistance
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Enter resistance"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    Precision (decimals)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={precision}
                    onChange={(e) => setPrecision(Math.max(0, Math.min(10, e.target.value)))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voltage (V)
                  </label>
                  <input
                    type="number"
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value)}
                    placeholder="Enter voltage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Volts</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current (I)
                  </label>
                  <input
                    type="number"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    placeholder="Enter current"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Amperes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precision (decimals)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={precision}
                    onChange={(e) => setPrecision(Math.max(0, Math.min(10, e.target.value)))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Results Section */}
          {(value || calculatedResistance) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mode === "convert" && value && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Conversions</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}:{" "}
                        {val.toFixed(precision).replace(/\.?0+$/, "")}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {mode === "calculate" && calculatedResistance && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">
                    Calculated Resistance (R = V/I)
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(conversionFactors).map(([unit, factor]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}:{" "}
                        {(calculatedResistance / factor)
                          .toFixed(precision)
                          .replace(/\.?0+$/, "")}
                      </p>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-600">Using Ohm’s Law: R = V/I</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Info</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between Ω, kΩ, MΩ, GΩ, mΩ, μΩ, nΩ</li>
            <li>Calculate resistance using Ohm’s Law (R = V/I)</li>
            <li>Adjustable precision (0-10 decimals)</li>
            <li>Conversion factors: 1 kΩ = 10³ Ω, 1 MΩ = 10⁶ Ω, etc.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResistanceConverter;