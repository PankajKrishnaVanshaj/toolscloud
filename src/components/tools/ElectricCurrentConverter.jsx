"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const ElectricCurrentConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("A");
  const [voltage, setVoltage] = useState("");
  const [voltageUnit, setVoltageUnit] = useState("V");
  const [resistance, setResistance] = useState("");
  const [resistanceUnit, setResistanceUnit] = useState("Ω");
  const [displayPrecision, setDisplayPrecision] = useState(4);

  // Conversion factors to Ampere (A)
  const currentFactors = {
    A: 1,
    mA: 1e-3,
    uA: 1e-6,
    nA: 1e-9,
    kA: 1e3,
    MA: 1e6,
    abA: 10,
    statA: 3.335641e-10,
  };

  const currentDisplayNames = {
    A: "A",
    mA: "mA",
    uA: "μA",
    nA: "nA",
    kA: "kA",
    MA: "MA",
    abA: "abA",
    statA: "statA",
  };

  // Voltage conversion factors to Volt (V)
  const voltageFactors = {
    V: 1,
    mV: 1e-3,
    uV: 1e-6,
    kV: 1e3,
    MV: 1e6,
  };

  const voltageDisplayNames = {
    V: "V",
    mV: "mV",
    uV: "μV",
    kV: "kV",
    MV: "MV",
  };

  // Resistance conversion factors to Ohm (Ω)
  const resistanceFactors = {
    Ω: 1,
    mΩ: 1e-3,
    kΩ: 1e3,
    MΩ: 1e6,
  };

  const resistanceDisplayNames = {
    Ω: "Ω",
    mΩ: "mΩ",
    kΩ: "kΩ",
    MΩ: "MΩ",
  };

  // Convert current
  const convertCurrent = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInAmpere = inputValue * currentFactors[fromUnit];
    return Object.keys(currentFactors).reduce((acc, unit) => {
      acc[unit] = valueInAmpere / currentFactors[unit];
      return acc;
    }, {});
  }, []);

  // Calculate power (P = I × V)
  const calculatePower = useCallback(() => {
    if (!value || !voltage || isNaN(value) || isNaN(voltage)) return null;
    const currentInAmpere = value * currentFactors[unit];
    const voltageInVolts = voltage * voltageFactors[voltageUnit];
    return currentInAmpere * voltageInVolts;
  }, [value, unit, voltage, voltageUnit]);

  // Calculate resistance (R = V / I)
  const calculateResistance = useCallback(() => {
    if (!value || !voltage || isNaN(value) || isNaN(voltage)) return null;
    const currentInAmpere = value * currentFactors[unit];
    const voltageInVolts = voltage * voltageFactors[voltageUnit];
    return voltageInVolts / currentInAmpere;
  }, [value, unit, voltage, voltageUnit]);

  // Convert resistance if provided
  const convertResistance = useCallback(() => {
    if (!resistance || isNaN(resistance)) return null;
    const resistanceInOhms = resistance * resistanceFactors[resistanceUnit];
    return Object.keys(resistanceFactors).reduce((acc, unit) => {
      acc[unit] = resistanceInOhms / resistanceFactors[unit];
      return acc;
    }, {});
  }, [resistance, resistanceUnit]);

  const currentResults = convertCurrent(value, unit);
  const power = calculatePower();
  const calculatedResistance = calculateResistance();
  const resistanceResults = convertResistance();

  // Reset all inputs
  const reset = () => {
    setValue("");
    setUnit("A");
    setVoltage("");
    setVoltageUnit("V");
    setResistance("");
    setResistanceUnit("Ω");
    setDisplayPrecision(4);
  };

  // Copy result to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Electric Current Converter
        </h1>

        {/* Input Section */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Current */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter current"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(currentFactors).map((u) => (
                <option key={u} value={u}>
                  {currentDisplayNames[u]}
                </option>
              ))}
            </select>
          </div>

          {/* Voltage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Voltage</label>
            <input
              type="number"
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              placeholder="Enter voltage"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={voltageUnit}
              onChange={(e) => setVoltageUnit(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(voltageFactors).map((u) => (
                <option key={u} value={u}>
                  {voltageDisplayNames[u]}
                </option>
              ))}
            </select>
          </div>

          {/* Resistance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resistance</label>
            <input
              type="number"
              value={resistance}
              onChange={(e) => setResistance(e.target.value)}
              placeholder="Enter resistance (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={resistanceUnit}
              onChange={(e) => setResistanceUnit(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(resistanceFactors).map((u) => (
                <option key={u} value={u}>
                  {resistanceDisplayNames[u]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Display Precision */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Precision (decimal places)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={displayPrecision}
            onChange={(e) => setDisplayPrecision(Math.max(0, Math.min(10, e.target.value)))}
            className="w-full sm:w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Results Section */}
        {(value || voltage || resistance) && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Current Conversions */}
            {value && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
                  Current Conversions
                  <button
                    onClick={() =>
                      copyToClipboard(
                        Object.entries(currentResults)
                          .map(([u, v]) => `${currentDisplayNames[u]}: ${v.toFixed(displayPrecision)}`)
                          .join("\n")
                      )
                    }
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaCopy />
                  </button>
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(currentResults).map(([unit, val]) => (
                    <p key={unit}>
                      {currentDisplayNames[unit]}: {val.toFixed(displayPrecision)}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Power */}
            {power && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
                  Power (P = I × V)
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `W: ${power.toFixed(displayPrecision)}\nmW: ${(power * 1e3).toFixed(displayPrecision)}\nkW: ${(power * 1e-3).toFixed(displayPrecision)}`
                      )
                    }
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaCopy />
                  </button>
                </h2>
                <p>Watts (W): {power.toFixed(displayPrecision)}</p>
                <p>Milliwatts (mW): {(power * 1e3).toFixed(displayPrecision)}</p>
                <p>Kilowatts (kW): {(power * 1e-3).toFixed(displayPrecision)}</p>
              </div>
            )}

            {/* Resistance */}
            {(resistance || calculatedResistance) && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
                  Resistance {resistance ? "" : "(R = V / I)"}
                  <button
                    onClick={() =>
                      copyToClipboard(
                        Object.entries(resistanceResults || { Ω: calculatedResistance })
                          .map(([u, v]) => `${resistanceDisplayNames[u]}: ${v.toFixed(displayPrecision)}`)
                          .join("\n")
                      )
                    }
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaCopy />
                  </button>
                </h2>
                {(resistanceResults || { Ω: calculatedResistance }) &&
                  Object.entries(resistanceResults || { Ω: calculatedResistance }).map(([unit, val]) => (
                    <p key={unit}>
                      {resistanceDisplayNames[unit]}: {val.toFixed(displayPrecision)}
                    </p>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Reset Button */}
        <div className="mt-6">
          <button
            onClick={reset}
            className="w-full sm:w-auto py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Formulas</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between A, mA, μA, nA, kA, MA, abA, statA</li>
            <li>Voltage: V, mV, μV, kV, MV</li>
            <li>Resistance: Ω, mΩ, kΩ, MΩ</li>
            <li>Power: P = I × V</li>
            <li>Resistance: R = V / I (if not provided)</li>
            <li>Adjustable display precision</li>
            <li>Copy results to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ElectricCurrentConverter;