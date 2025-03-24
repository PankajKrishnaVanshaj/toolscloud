"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const DensityCalculator = () => {
  const [calculateFor, setCalculateFor] = useState("density");
  const [density, setDensity] = useState("");
  const [densityUnit, setDensityUnit] = useState("kg/m³");
  const [mass, setMass] = useState("");
  const [massUnit, setMassUnit] = useState("kg");
  const [volume, setVolume] = useState("");
  const [volumeUnit, setVolumeUnit] = useState("m³");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Unit conversion factors (to base units: kg, m³)
  const densityUnits = {
    "kg/m³": 1,
    "g/cm³": 1000,
    "kg/L": 1000,
    "lb/ft³": 16.0185,
  };

  const massUnits = {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
    lb: 0.453592,
  };

  const volumeUnits = {
    "m³": 1,        
    L: 0.001,
    mL: 0.000001,
    "cm³": 0.000001, 
    "ft³": 0.0283168,
  };

  const calculateDensityValues = useCallback(() => {
    setError("");
    setResult(null);

    const rho = density ? parseFloat(density) * densityUnits[densityUnit] : null;
    const m = mass ? parseFloat(mass) * massUnits[massUnit] : null;
    const V = volume ? parseFloat(volume) * volumeUnits[volumeUnit] : null;

    const inputs = { rho, m, V };
    const required =
      calculateFor === "density"
        ? ["m", "V"]
        : calculateFor === "mass"
        ? ["rho", "V"]
        : ["rho", "m"];

    for (let key of required) {
      if (inputs[key] === null || isNaN(inputs[key])) {
        setError(`Please enter a valid ${key === "rho" ? "density" : key === "m" ? "mass" : "volume"}`);
        return;
      }
      if (inputs[key] <= 0) {
        setError(`${key === "rho" ? "Density" : key === "m" ? "Mass" : "Volume"} must be positive`);
        return;
      }
    }

    try {
      let calculatedValue;
      let displayUnit;

      switch (calculateFor) {
        case "density":
          calculatedValue = m / V;
          displayUnit = densityUnit;
          calculatedValue /= densityUnits[densityUnit];
          break;
        case "mass":
          calculatedValue = rho * V;
          displayUnit = massUnit;
          calculatedValue /= massUnits[massUnit];
          break;
        case "volume":
          calculatedValue = m / rho;
          displayUnit = volumeUnit;
          calculatedValue /= volumeUnits[volumeUnit];
          break;
        default:
          throw new Error("Invalid calculation type");
      }

      const newResult = {
        density: calculateFor === "density" ? calculatedValue : parseFloat(density),
        mass: calculateFor === "mass" ? calculatedValue : parseFloat(mass),
        volume: calculateFor === "volume" ? calculatedValue : parseFloat(volume),
        units: { density: densityUnit, mass: massUnit, volume: volumeUnit },
        timestamp: new Date().toLocaleTimeString(),
      };

      setResult(newResult);
      setHistory((prev) => [newResult, ...prev.slice(0, 9)]); // Keep last 10 calculations
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [density, densityUnit, mass, massUnit, volume, volumeUnit, calculateFor]);

  const formatNumber = (num, digits = 2) => {
    if (num === null || isNaN(num)) return "N/A";
    if (num < 1e-6 || num > 1e6) return num.toExponential(digits);
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  const resetInputs = () => {
    setDensity("");
    setMass("");
    setVolume("");
    setResult(null);
    setError("");
  };

  const applyPreset = (preset) => {
    setCalculateFor(preset.calculateFor);
    setDensity(preset.density || "");
    setDensityUnit(preset.densityUnit || "kg/m³");
    setMass(preset.mass || "");
    setMassUnit(preset.massUnit || "kg");
    setVolume(preset.volume || "");
    setVolumeUnit(preset.volumeUnit || "m³");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Density Calculator
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="density">Density (ρ)</option>
              <option value="mass">Mass (m)</option>
              <option value="volume">Volume (V)</option>
            </select>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 gap-4">
            {calculateFor !== "density" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Density
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    placeholder="e.g., 1000"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={densityUnit}
                    onChange={(e) => setDensityUnit(e.target.value)}
                    className="w-28 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(densityUnits).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {calculateFor !== "mass" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mass
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={mass}
                    onChange={(e) => setMass(e.target.value)}
                    placeholder="e.g., 1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={massUnit}
                    onChange={(e) => setMassUnit(e.target.value)}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(massUnits).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {calculateFor !== "volume" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder="e.g., 1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={volumeUnit}
                    onChange={(e) => setVolumeUnit(e.target.value)}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(volumeUnits).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateDensityValues}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={resetInputs}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Result:</h2>
              <p>
                Density: {formatNumber(result.density)} {result.units.density}
              </p>
              <p>
                Mass: {formatNumber(result.mass)} {result.units.mass}
              </p>
              <p>
                Volume: {formatNumber(result.volume)} {result.units.volume}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Water", calculateFor: "density", mass: 1, massUnit: "kg", volume: 1, volumeUnit: "L" },
                { label: "Aluminum", calculateFor: "mass", density: 2700, densityUnit: "kg/m³", volume: 0.001, volumeUnit: "m³" },
                { label: "Lead", calculateFor: "volume", density: 11.34, densityUnit: "g/cm³", mass: 113.4, massUnit: "g" },
                { label: "Air", calculateFor: "density", mass: 0.001225, massUnit: "kg", volume: 1, volumeUnit: "m³" },
              ].map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-blue-700">Calculation History</h3>
              <ul className="text-sm text-blue-600 space-y-1 max-h-40 overflow-y-auto">
                {history.map((entry, index) => (
                  <li key={index}>
                    [{entry.timestamp}] ρ: {formatNumber(entry.density)} {entry.units.density}, m:{" "}
                    {formatNumber(entry.mass)} {entry.units.mass}, V: {formatNumber(entry.volume)}{" "}
                    {entry.units.volume}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> About
            </h3>
            <div className="text-sm text-green-600 space-y-1">
              <p>Formula: ρ = m / V</p>
              <ul className="list-disc list-inside">
                <li>ρ = Density</li>
                <li>m = Mass</li>
                <li>V = Volume</li>
              </ul>
              <p>Supports multiple units with automatic conversion.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DensityCalculator;