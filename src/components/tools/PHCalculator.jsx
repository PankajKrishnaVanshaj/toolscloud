"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaInfoCircle } from "react-icons/fa";

const PHCalculator = () => {
  const [inputType, setInputType] = useState("pH");
  const [inputValue, setInputValue] = useState("");
  const [temperature, setTemperature] = useState(25); // Temperature in °C
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Calculate Kw based on temperature (approximation)
  const calculateKw = (temp) => {
    // Simplified temperature dependence of Kw (approximation)
    const logKw = -4470.99 / (temp + 273.15) + 6.0875 - 0.01706 * (temp + 273.15);
    return Math.pow(10, logKw);
  };

  const calculatePH = useCallback(() => {
    setError("");
    setResult(null);

    if (!inputValue || isNaN(inputValue)) {
      setError("Please enter a valid number");
      return;
    }

    const value = parseFloat(inputValue);
    const Kw = calculateKw(temperature);
    let pH, pOH, hCon, ohCon;

    try {
      switch (inputType) {
        case "pH": {
          const maxPH = -Math.log10(Kw) / 2; // Theoretical max pH at given temp
          if (value < 0 || value > maxPH) {
            setError(`pH should be between 0 and ${maxPH.toFixed(1)} at ${temperature}°C`);
            return;
          }
          pH = value;
          hCon = Math.pow(10, -pH);
          ohCon = Kw / hCon;
          pOH = -Math.log10(ohCon);
          break;
        }
        case "pOH": {
          const maxPOH = -Math.log10(Kw) / 2;
          if (value < 0 || value > maxPOH) {
            setError(`pOH should be between 0 and ${maxPOH.toFixed(1)} at ${temperature}°C`);
            return;
          }
          pOH = value;
          ohCon = Math.pow(10, -pOH);
          hCon = Kw / ohCon;
          pH = -Math.log10(hCon);
          break;
        }
        case "H+": {
          if (value <= 0 || value > 1) {
            setError("[H⁺] should be between 0 and 1 mol/L");
            return;
          }
          hCon = value;
          pH = -Math.log10(hCon);
          ohCon = Kw / hCon;
          pOH = -Math.log10(ohCon);
          break;
        }
        case "OH-": {
          if (value <= 0 || value > 1) {
            setError("[OH⁻] should be between 0 and 1 mol/L");
            return;
          }
          ohCon = value;
          pOH = -Math.log10(ohCon);
          hCon = Kw / ohCon;
          pH = -Math.log10(hCon);
          break;
        }
        default:
          throw new Error("Invalid input type");
      }

      const newResult = { pH, pOH, hCon, ohCon, temperature };
      setResult(newResult);
      setHistory((prev) => [...prev, newResult].slice(-5)); // Keep last 5 calculations
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [inputType, inputValue, temperature]);

  const formatNumber = (num, isConcentration = false) => {
    if (isConcentration && (num < 1e-6 || num > 1e6)) {
      return num.toExponential(2);
    }
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  const reset = () => {
    setInputType("pH");
    setInputValue("");
    setTemperature(25);
    setResult(null);
    setError("");
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          pH Calculator
        </h1>

        <div className="space-y-6">
          {/* Input Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input Type</label>
            <select
              value={inputType}
              onChange={(e) => {
                setInputType(e.target.value);
                setInputValue("");
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pH">pH</option>
              <option value="pOH">pOH</option>
              <option value="H+">[H⁺] (mol/L)</option>
              <option value="OH-">[OH⁻] (mol/L)</option>
            </select>
          </div>

          {/* Input Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Enter ${inputType}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {inputType === "pH" || inputType === "pOH"
                ? `Range: 0 to ${(-Math.log10(calculateKw(temperature)) / 2).toFixed(1)}`
                : "Range: >0, ≤1"}
            </p>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature (°C)
            </label>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(Math.max(0, Math.min(100, e.target.value)))}
              min="0"
              max="100"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Range: 0-100°C (affects Kw)</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={calculatePH}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate
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
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>pH: {formatNumber(result.pH)}</p>
              <p>pOH: {formatNumber(result.pOH)}</p>
              <p>[H⁺]: {formatNumber(result.hCon, true)} mol/L</p>
              <p>[OH⁻]: {formatNumber(result.ohCon, true)} mol/L</p>
              <p className="text-sm text-gray-500 mt-2">
                Calculated at {result.temperature}°C (Kw = {calculateKw(result.temperature).toExponential(2)})
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Neutral (pH 7)", type: "pH", value: 7 },
                { label: "Acidic (pH 2)", type: "pH", value: 2 },
                { label: "Basic (pOH 3)", type: "pOH", value: 3 },
                { label: "[H⁺] 0.01M", type: "H+", value: 0.01 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setInputType(preset.type);
                    setInputValue(preset.value);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Calculation History</h2>
              <ul className="space-y-2 text-sm text-blue-700 max-h-40 overflow-y-auto">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index}>
                    pH: {formatNumber(entry.pH)} | pOH: {formatNumber(entry.pOH)} | T: {entry.temperature}°C
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-yellow-50 rounded-md text-sm text-yellow-700">
            <h3 className="font-semibold flex items-center mb-2">
              <FaInfoCircle className="mr-2" /> About
            </h3>
            <p>Calculates pH properties using:</p>
            <ul className="list-disc list-inside mt-1">
              <li>pH = -log₁₀[H⁺]</li>
              <li>pOH = -log₁₀[OH⁻]</li>
              <li>[H⁺][OH⁻] = Kw(T)</li>
              <li>pH + pOH = -log₁₀(Kw)</li>
            </ul>
            <p className="mt-2">
              Kw varies with temperature (approximated). Default: 25°C (Kw = 1×10⁻¹⁴).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PHCalculator;