"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync } from "react-icons/fa";

const VaporPressureCalculator = () => {
  const [substance, setSubstance] = useState("water");
  const [temperature, setTemperature] = useState("");
  const [unit, setUnit] = useState("C"); // C (Celsius), K (Kelvin), F (Fahrenheit)
  const [pressureUnit, setPressureUnit] = useState("mmHg"); // mmHg, atm, kPa, bar, psi
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Extended Antoine coefficients (A, B, C) for more substances
  const substances = {
    water: { A: 8.07131, B: 1730.63, C: 233.426, range: [1, 100] }, // °C
    ethanol: { A: 8.20417, B: 1642.89, C: 230.3, range: [-57, 80] }, // °C
    benzene: { A: 6.90565, B: 1211.033, C: 220.79, range: [6, 81] }, // °C
    acetone: { A: 7.02447, B: 1161.0, C: 224.0, range: [-59, 56] }, // °C
    methanol: { A: 8.08097, B: 1582.271, C: 239.726, range: [-97, 65] }, // °C
    toluene: { A: 6.95464, B: 1344.8, C: 219.482, range: [-95, 111] }, // °C
  };

  // Extended pressure conversion factors
  const pressureConversions = {
    mmHg: 1,
    atm: 1 / 760,
    kPa: 101.325 / 760,
    bar: 0.00133322,
    psi: 0.0193368,
  };

  // Temperature conversion
  const convertToCelsius = (temp, unit) => {
    if (unit === "K") return temp - 273.15;
    if (unit === "F") return (temp - 32) * (5 / 9);
    return temp; // Already in Celsius
  };

  const calculateVaporPressure = useCallback(() => {
    setError("");
    setResult(null);

    if (!temperature || isNaN(temperature)) {
      setError("Please enter a valid temperature");
      return;
    }

    const temp = parseFloat(temperature);
    const coeffs = substances[substance];
    const tempInCelsius = convertToCelsius(temp, unit);

    // Validate temperature range
    if (tempInCelsius < coeffs.range[0] || tempInCelsius > coeffs.range[1]) {
      setError(
        `Temperature must be between ${coeffs.range[0]}°C and ${coeffs.range[1]}°C for ${substance}`
      );
      return;
    }

    try {
      // Antoine equation: log₁₀(P) = A - (B / (T + C))
      const logP = coeffs.A - coeffs.B / (tempInCelsius + coeffs.C);
      const pressureMmHg = Math.pow(10, logP);
      const pressure = pressureMmHg * pressureConversions[pressureUnit];

      const newResult = {
        pressure,
        unit: pressureUnit,
        temp: tempInCelsius,
        inputTemp: temp,
        inputUnit: unit,
        substance,
      };
      setResult(newResult);

      // Add to history
      setHistory((prev) => [newResult, ...prev.slice(0, 9)]); // Keep last 10
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [temperature, unit, pressureUnit, substance]);

  const formatNumber = (num, digits = 3) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  const reset = () => {
    setTemperature("");
    setUnit("C");
    setPressureUnit("mmHg");
    setSubstance("water");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Vapor Pressure Calculator
        </h1>

        <div className="space-y-6">
          {/* Substance Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Substance</label>
            <select
              value={substance}
              onChange={(e) => setSubstance(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(substances).map((sub) => (
                <option key={sub} value={sub}>
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="Enter temperature"
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="C">°C</option>
                <option value="K">K</option>
                <option value="F">°F</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Valid range for {substance}: {substances[substance].range[0]}°C to{" "}
              {substances[substance].range[1]}°C
            </p>
          </div>

          {/* Pressure Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pressure Unit
            </label>
            <select
              value={pressureUnit}
              onChange={(e) => setPressureUnit(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="mmHg">mmHg</option>
              <option value="atm">atm</option>
              <option value="kPa">kPa</option>
              <option value="bar">bar</option>
              <option value="psi">psi</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateVaporPressure}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Vapor Pressure:</h2>
              <p>
                {formatNumber(result.pressure)} {result.unit} at{" "}
                {formatNumber(result.inputTemp)}
                {result.inputUnit} ({formatNumber(result.temp)}°C)
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">Calculation History</h3>
              <ul className="text-sm text-blue-600 space-y-1 max-h-40 overflow-y-auto">
                {history.map((entry, index) => (
                  <li key={index}>
                    {entry.substance.charAt(0).toUpperCase() + entry.substance.slice(1)}: {formatNumber(entry.pressure)} {entry.unit} at{" "}
                    {formatNumber(entry.inputTemp)}
                    {entry.inputUnit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* About */}
          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About This Calculator</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates vapor pressure using the Antoine equation:</p>
                <p className="font-mono">log₁₀(P) = A - (B / (T + C))</p>
                <p>Where:</p>
                <ul className="list-disc list-inside">
                  <li>P = vapor pressure (mmHg)</li>
                  <li>T = temperature (°C)</li>
                  <li>A, B, C = substance-specific constants</li>
                </ul>
                <p>Data sourced from NIST Chemistry WebBook.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaporPressureCalculator;