"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaQuestionCircle } from "react-icons/fa";

const PlancksConstantCalculator = () => {
  const [calculationType, setCalculationType] = useState("energy");
  const [inputValue, setInputValue] = useState("");
  const [unit, setUnit] = useState("Hz");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [significantDigits, setSignificantDigits] = useState(4);
  const [history, setHistory] = useState([]);

  // Constants
  const h = 6.62607015e-34; // Planck's constant (J·s)
  const c = 299792458; // Speed of light (m/s)
  const eV = 1.60217662e-19; // Joules per eV

  // Unit conversion factors
  const frequencyUnits = { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9, THz: 1e12 };
  const wavelengthUnits = { m: 1, cm: 1e-2, mm: 1e-3, μm: 1e-6, nm: 1e-9, Å: 1e-10 };
  const energyUnits = { J: 1, eV: eV, keV: eV * 1e3, MeV: eV * 1e6, GeV: eV * 1e9 };

  // Calculation function
  const calculateWithPlanck = useCallback(() => {
    setError("");
    setResult(null);

    if (!inputValue || isNaN(inputValue) || inputValue <= 0) {
      setError("Please enter a valid positive value");
      return;
    }

    const value = parseFloat(inputValue);
    let energy, frequency, wavelength;

    try {
      switch (calculationType) {
        case "energy":
          frequency = value * frequencyUnits[unit];
          energy = h * frequency;
          wavelength = c / frequency;
          break;
        case "frequency":
          energy = value * energyUnits[unit];
          frequency = energy / h;
          wavelength = c / frequency;
          break;
        case "wavelength":
          wavelength = value * wavelengthUnits[unit];
          frequency = c / wavelength;
          energy = h * frequency;
          break;
        default:
          throw new Error("Invalid calculation type");
      }

      const newResult = { energy, frequency, wavelength };
      setResult(newResult);
      setHistory((prev) => [
        { input: `${value} ${unit}`, type: calculationType, ...newResult },
        ...prev.slice(0, 9), // Keep last 10 entries
      ]);
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [inputValue, unit, calculationType]);

  // Format numbers with significant digits
  const formatNumber = (num) => {
    if (num === 0) return "0";
    if (Math.abs(num) < 1e-6 || Math.abs(num) > 1e6) {
      return num.toExponential(significantDigits - 1);
    }
    return num.toLocaleString("en-US", { maximumSignificantDigits: significantDigits });
  };

  // Reset function
  const reset = () => {
    setInputValue("");
    setUnit(calculationType === "energy" ? "Hz" : calculationType === "frequency" ? "J" : "m");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Planck's Constant Calculator
        </h1>

        <div className="space-y-6">
          {/* Calculation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculate From
            </label>
            <select
              value={calculationType}
              onChange={(e) => {
                setCalculationType(e.target.value);
                setInputValue("");
                setUnit(
                  e.target.value === "energy" ? "Hz" : e.target.value === "frequency" ? "J" : "m"
                );
                setResult(null);
                setError("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="energy">Frequency → Energy</option>
              <option value="frequency">Energy → Frequency</option>
              <option value="wavelength">Wavelength → Energy</option>
            </select>
          </div>

          {/* Input and Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Value</label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
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
                {Object.keys(
                  calculationType === "energy"
                    ? frequencyUnits
                    : calculationType === "frequency"
                    ? energyUnits
                    : wavelengthUnits
                ).map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Significant Digits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Significant Digits ({significantDigits})
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={significantDigits}
              onChange={(e) => setSignificantDigits(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateWithPlanck}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Results:</h2>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>
                  Energy: {formatNumber(result.energy)} J ({formatNumber(result.energy / eV)} eV)
                </li>
                <li>
                  Frequency: {formatNumber(result.frequency)} Hz (
                  {formatNumber(result.frequency / 1e12)} THz)
                </li>
                <li>
                  Wavelength: {formatNumber(result.wavelength)} m (
                  {formatNumber(result.wavelength / 1e-9)} nm)
                </li>
              </ul>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700 text-sm">{error}</div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { type: "energy", value: 5e14, unit: "Hz", label: "Visible Light (500 THz)" },
                { type: "wavelength", value: 550, unit: "nm", label: "Green Light (550 nm)" },
                { type: "frequency", value: 2, unit: "eV", label: "UV Photon (2 eV)" },
                { type: "wavelength", value: 0.1, unit: "nm", label: "X-Ray (0.1 nm)" },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCalculationType(preset.type);
                    setInputValue(preset.value);
                    setUnit(preset.unit);
                    setResult(null);
                    setError("");
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calculation History */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2 text-blue-700">History</h2>
              <ul className="space-y-2 text-sm text-blue-600 max-h-40 overflow-y-auto">
                {history.map((entry, idx) => (
                  <li
                    key={idx}
                    className="cursor-pointer hover:bg-blue-100 p-1 rounded"
                    onClick={() => {
                      setCalculationType(entry.type);
                      setInputValue(entry.input.split(" ")[0]);
                      setUnit(entry.input.split(" ")[1]);
                      setResult({ energy: entry.energy, frequency: entry.frequency, wavelength: entry.wavelength });
                      setError("");
                    }}
                  >
                    {entry.type === "energy" ? "Freq" : entry.type === "frequency" ? "Energy" : "Wavelength"}: {entry.input} → E: {formatNumber(entry.energy)} J, ν: {formatNumber(entry.frequency)} Hz, λ: {formatNumber(entry.wavelength)} m
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-gray-50 rounded-md text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium flex items-center gap-2">
                <FaQuestionCircle /> About Planck's Constant
              </summary>
              <div className="mt-2 space-y-2">
                <p>Planck's constant (h = 6.62607015 × 10⁻³⁴ J·s) relates photon properties:</p>
                <ul className="list-disc list-inside">
                  <li>E = hν (Energy = Planck's constant × frequency)</li>
                  <li>ν = c/λ (Frequency = speed of light / wavelength)</li>
                </ul>
                <p>Useful in quantum mechanics for calculating photon energy, frequency, and wavelength.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlancksConstantCalculator;