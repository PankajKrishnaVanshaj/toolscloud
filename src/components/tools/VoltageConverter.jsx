"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaHistory } from "react-icons/fa";

const VoltageConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("V");
  const [current, setCurrent] = useState("");
  const [currentUnit, setCurrentUnit] = useState("A");
  const [history, setHistory] = useState([]);
  const [decimalPlaces, setDecimalPlaces] = useState(4);

  // Conversion factors to Volts (V)
  const conversionFactors = {
    V: 1, // Volt
    mV: 1e-3, // Millivolt
    uV: 1e-6, // Microvolt
    nV: 1e-9, // Nanovolt
    kV: 1e3, // Kilovolt
    MV: 1e6, // Megavolt
    abV: 1e-8, // Abvolt
    statV: 299.792458, // Statvolt
  };

  const unitDisplayNames = {
    V: "V",
    mV: "mV",
    uV: "μV",
    nV: "nV",
    kV: "kV",
    MV: "MV",
    abV: "abV",
    statV: "statV",
  };

  // Current conversion factors to Amperes (A)
  const currentConversion = {
    A: 1, // Ampere
    mA: 1e-3, // Milliampere
    uA: 1e-6, // Microampere
    nA: 1e-9, // Nanoampere
    kA: 1e3, // Kiloampere
  };

  const currentDisplayNames = {
    A: "A",
    mA: "mA",
    uA: "μA",
    nA: "nA",
    kA: "kA",
  };

  // Convert voltage
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInVolts = inputValue * conversionFactors[fromUnit];
      const result = Object.keys(conversionFactors).reduce((acc, unit) => {
        acc[unit] = valueInVolts / conversionFactors[unit];
        return acc;
      }, {});
      // Add to history
      setHistory((prev) => [
        { voltage: inputValue, unit: fromUnit, result },
        ...prev.slice(0, 4),
      ]); // Keep last 5 entries
      return result;
    },
    [conversionFactors]
  );

  // Calculate power
  const calculatePower = useCallback(() => {
    if (!value || !current || isNaN(value) || isNaN(current)) return null;
    const voltageInVolts = value * conversionFactors[unit];
    const currentInAmperes = current * currentConversion[currentUnit];
    return voltageInVolts * currentInAmperes; // Power in Watts
  }, [value, unit, current, currentUnit, conversionFactors, currentConversion]);

  // Reset inputs
  const reset = () => {
    setValue("");
    setUnit("V");
    setCurrent("");
    setCurrentUnit("A");
    setHistory([]);
    setDecimalPlaces(4);
  };

  const results = convertValue(value, unit);
  const power = calculatePower();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Voltage & Power Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voltage
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter voltage"
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
                Current (for Power)
              </label>
              <input
                type="number"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter current"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={currentUnit}
                onChange={(e) => setCurrentUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(currentConversion).map((u) => (
                  <option key={u} value={u}>
                    {currentDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Places ({decimalPlaces})
              </label>
              <input
                type="range"
                min="0"
                max="8"
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <button
              onClick={reset}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {(value || power) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {value && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Voltage Conversions</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}:{" "}
                        {val.toFixed(decimalPlaces).replace(/\.?0+$/, "")}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {power && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Power Calculations</h2>
                  <div className="text-sm">
                    <p>Watts (W): {power.toFixed(decimalPlaces).replace(/\.?0+$/, "")}</p>
                    <p>
                      Milliwatts (mW):{" "}
                      {(power * 1e3).toFixed(decimalPlaces).replace(/\.?0+$/, "")}
                    </p>
                    <p>
                      Kilowatts (kW):{" "}
                      {(power * 1e-3).toFixed(decimalPlaces).replace(/\.?0+$/, "")}
                    </p>
                    <p>Megawatts (MW): {(power * 1e-6).toFixed(decimalPlaces)}</p>
                    <p className="mt-2 text-gray-600">P = V × I</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                <FaHistory className="mr-2" /> Conversion History
              </h2>
              <ul className="text-sm text-gray-700 space-y-1 max-h-40 overflow-y-auto">
                {history.map((entry, index) => (
                  <li key={index}>
                    {entry.voltage} {unitDisplayNames[entry.unit]} →{" "}
                    {Object.entries(entry.result)
                      .map(([u, v]) => `${unitDisplayNames[u]}: ${v.toFixed(2)}`)
                      .join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details>
              <summary className="cursor-pointer font-semibold text-blue-700">
                Features & References
              </summary>
              <div className="mt-2 text-sm text-blue-600">
                <p className="font-medium">Features:</p>
                <ul className="list-disc list-inside">
                  <li>Convert between multiple voltage units</li>
                  <li>Calculate power with current input</li>
                  <li>Adjustable decimal precision</li>
                  <li>Conversion history tracking</li>
                </ul>
                <p className="mt-2 font-medium">Voltage Conversion References:</p>
                <ul className="list-disc list-inside">
                  <li>1 V = 10³ mV = 10⁶ μV</li>
                  <li>1 kV = 10³ V</li>
                  <li>1 MV = 10⁶ V</li>
                  <li>1 abV = 10⁻⁸ V</li>
                  <li>1 statV ≈ 299.792458 V</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoltageConverter;