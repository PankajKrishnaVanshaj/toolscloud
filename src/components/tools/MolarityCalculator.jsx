"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator, FaInfoCircle } from "react-icons/fa";

const MolarityCalculator = () => {
  const [calculateFor, setCalculateFor] = useState("molarity");
  const [molarity, setMolarity] = useState("");
  const [moles, setMoles] = useState("");
  const [volume, setVolume] = useState("");
  const [unit, setUnit] = useState("L");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [precision, setPrecision] = useState(3);

  const calculateMolarityValues = useCallback(() => {
    setError("");
    setResult(null);

    const volumeInLiters = unit === "mL" ? parseFloat(volume) / 1000 : parseFloat(volume);
    const inputs = {
      molarity: parseFloat(molarity),
      moles: parseFloat(moles),
      volume: volumeInLiters,
    };

    // Validation
    const validateInputs = () => {
      if (calculateFor === "molarity") {
        if (!moles || !volume || isNaN(inputs.moles) || isNaN(inputs.volume))
          return "Please enter valid moles and volume";
        if (inputs.moles < 0 || inputs.volume <= 0)
          return "Moles must be non-negative, volume must be positive";
      } else if (calculateFor === "moles") {
        if (!molarity || !volume || isNaN(inputs.molarity) || isNaN(inputs.volume))
          return "Please enter valid molarity and volume";
        if (inputs.molarity < 0 || inputs.volume <= 0)
          return "Molarity must be non-negative, volume must be positive";
      } else {
        if (!molarity || !moles || isNaN(inputs.molarity) || isNaN(inputs.moles))
          return "Please enter valid molarity and moles";
        if (inputs.molarity < 0 || inputs.moles < 0)
          return "Molarity and moles must be non-negative";
      }
      return "";
    };

    const errorMsg = validateInputs();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    try {
      let calculatedValue;
      let displayUnit = unit;

      switch (calculateFor) {
        case "molarity":
          calculatedValue = inputs.moles / inputs.volume;
          setResult({
            molarity: calculatedValue,
            moles: inputs.moles,
            volume: inputs.volume,
            displayVolume: parseFloat(volume),
            unit: "M",
          });
          break;
        case "moles":
          calculatedValue = inputs.molarity * inputs.volume;
          setResult({
            molarity: inputs.molarity,
            moles: calculatedValue,
            volume: inputs.volume,
            displayVolume: parseFloat(volume),
            unit: "mol",
          });
          break;
        case "volume":
          calculatedValue = inputs.moles / inputs.molarity;
          displayUnit = unit;
          setResult({
            molarity: inputs.molarity,
            moles: inputs.moles,
            volume: calculatedValue,
            displayVolume: unit === "mL" ? calculatedValue * 1000 : calculatedValue,
            unit: displayUnit,
          });
          break;
        default:
          throw new Error("Invalid calculation type");
      }

      setHistory((prev) => [
        ...prev,
        { calculateFor, ...inputs, result: calculatedValue, unit: displayUnit },
      ].slice(-10)); // Keep last 10 calculations
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [calculateFor, molarity, moles, volume, unit]);

  const formatNumber = (num) =>
    num < 1e-6 || num > 1e6
      ? num.toExponential(precision)
      : num.toLocaleString("en-US", { maximumFractionDigits: precision });

  const resetInputs = () => {
    setMolarity("");
    setMoles("");
    setVolume("");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Molarity Calculator
        </h1>

        <div className="space-y-6">
          {/* Calculate For */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculate For
            </label>
            <select
              value={calculateFor}
              onChange={(e) => {
                setCalculateFor(e.target.value);
                resetInputs();
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="molarity">Molarity (M)</option>
              <option value="moles">Moles (n)</option>
              <option value="volume">Volume (V)</option>
            </select>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {calculateFor !== "molarity" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Molarity (mol/L)
                </label>
                <input
                  type="number"
                  value={molarity}
                  onChange={(e) => setMolarity(e.target.value)}
                  placeholder="e.g., 0.1"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
              </div>
            )}
            {calculateFor !== "moles" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moles (mol)
                </label>
                <input
                  type="number"
                  value={moles}
                  onChange={(e) => setMoles(e.target.value)}
                  placeholder="e.g., 0.05"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
              </div>
            )}
            {calculateFor !== "volume" && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder={`e.g., ${unit === "L" ? "1" : "1000"}`}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    step="any"
                  />
                  <select
                    value={unit}
                    onChange={(e) => {
                      setUnit(e.target.value);
                      setVolume("");
                    }}
                    className="w-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">L</option>
                    <option value="mL">mL</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Precision Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decimal Precision ({precision})
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateMolarityValues}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={resetInputs}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Results:</h2>
              <p>Molarity: {formatNumber(result.molarity)} M</p>
              <p>Moles: {formatNumber(result.moles)} mol</p>
              <p>Volume: {formatNumber(result.displayVolume)} {result.unit}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Calculation History */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">History</h3>
              <ul className="text-sm text-blue-600 space-y-1 max-h-40 overflow-y-auto">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index}>
                    Calculated {entry.calculateFor}: {formatNumber(entry.result)}{" "}
                    {entry.unit === "M" ? "M" : entry.unit} (
                    M: {formatNumber(entry.molarity)}, n: {formatNumber(entry.moles)}, V:{" "}
                    {formatNumber(entry.volume * (entry.unit === "mL" ? 1000 : 1))}{" "}
                    {entry.unit})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { for: "molarity", moles: 0.1, volume: 1, unit: "L" },
                { for: "moles", molarity: 0.5, volume: 500, unit: "mL" },
                { for: "volume", molarity: 0.2, moles: 0.05, unit: "L" },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCalculateFor(preset.for);
                    setMolarity(preset.molarity || "");
                    setMoles(preset.moles || "");
                    setVolume(preset.volume || "");
                    setUnit(preset.unit);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.for === "molarity"
                    ? "0.1 M (1 L)"
                    : preset.for === "moles"
                    ? "0.5 M (500 mL)"
                    : "0.2 M (0.05 mol)"}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> About
            </h3>
            <div className="text-sm text-green-600 space-y-1">
              <p>Formula: M = n / V</p>
              <ul className="list-disc list-inside">
                <li>M = Molarity (mol/L)</li>
                <li>n = Moles of solute (mol)</li>
                <li>V = Volume of solution (L or mL)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MolarityCalculator;