"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaInfoCircle } from "react-icons/fa";

const PhotonEnergyCalculator = () => {
  const [inputType, setInputType] = useState("wavelength");
  const [inputValue, setInputValue] = useState("");
  const [unit, setUnit] = useState("nm");
  const [energyUnit, setEnergyUnit] = useState("eV"); // New: Selectable energy output unit
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false); // Toggle for detailed output

  // Constants
  const h = 6.62607015e-34; // Planck constant (J·s)
  const c = 299792458; // Speed of light (m/s)
  const eV = 1.60217662e-19; // Joules per eV

  // Unit conversion factors
  const wavelengthUnits = {
    m: 1,
    cm: 1e-2,
    mm: 1e-3,
    μm: 1e-6,
    nm: 1e-9,
    Å: 1e-10,
  };

  const frequencyUnits = {
    Hz: 1,
    kHz: 1e3,
    MHz: 1e6,
    GHz: 1e9,
    THz: 1e12,
    PHz: 1e15,
  };

  const energyUnits = {
    J: 1,
    eV: eV,
    keV: eV * 1e3,
    MeV: eV * 1e6,
    GeV: eV * 1e9,
  };

  // Calculate photon energy
  const calculatePhotonEnergy = useCallback(() => {
    setError("");
    setResult(null);

    if (!inputValue || isNaN(inputValue) || inputValue <= 0) {
      setError("Please enter a valid positive value");
      return;
    }

    const value = parseFloat(inputValue);
    let energy, frequency, wavelength;

    try {
      if (inputType === "wavelength") {
        wavelength = value * wavelengthUnits[unit];
        frequency = c / wavelength;
        energy = h * frequency;
      } else {
        frequency = value * frequencyUnits[unit];
        energy = h * frequency;
        wavelength = c / frequency;
      }

      setResult({
        energy,
        frequency,
        wavelength,
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [inputType, inputValue, unit]);

  // Format numbers for display
  const formatNumber = (num, digits = 4) => {
    if (num < 1e-6 || num > 1e6) {
      return num.toExponential(digits);
    }
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  // Reset all fields
  const reset = () => {
    setInputType("wavelength");
    setInputValue("");
    setUnit("nm");
    setEnergyUnit("eV");
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Photon Energy Calculator
        </h1>

        <div className="space-y-6">
          {/* Input Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Type
            </label>
            <select
              value={inputType}
              onChange={(e) => {
                setInputType(e.target.value);
                setInputValue("");
                setUnit(e.target.value === "wavelength" ? "nm" : "Hz");
                setResult(null);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="wavelength">Wavelength</option>
              <option value="frequency">Frequency</option>
            </select>
          </div>

          {/* Input Value and Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(inputType === "wavelength" ? wavelengthUnits : frequencyUnits).map(
                  (u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Energy Output Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Energy Unit
            </label>
            <select
              value={energyUnit}
              onChange={(e) => setEnergyUnit(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(energyUnits).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={calculatePhotonEnergy}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Photon Properties:</h2>
              <div className="space-y-2">
                <p>
                  Energy: {formatNumber(result.energy / energyUnits[energyUnit])} {energyUnit}{" "}
                  {energyUnit !== "J" && (
                    <span className="text-sm text-gray-500">
                      ({formatNumber(result.energy)} J)
                    </span>
                  )}
                </p>
                <p>
                  Frequency: {formatNumber(result.frequency)} Hz{" "}
                  <span className="text-sm text-gray-500">
                    ({formatNumber(result.frequency / frequencyUnits.THz)} THz)
                  </span>
                </p>
                <p>
                  Wavelength: {formatNumber(result.wavelength)} m{" "}
                  <span className="text-sm text-gray-500">
                    ({formatNumber(result.wavelength / wavelengthUnits.nm)} nm)
                  </span>
                </p>
                {showDetails && (
                  <div className="text-sm text-gray-600 mt-2">
                    <p>Additional Units:</p>
                    <ul className="list-disc list-inside">
                      <li>
                        Energy: {formatNumber(result.energy / energyUnits.MeV)} MeV
                      </li>
                      <li>
                        Wavelength: {formatNumber(result.wavelength / wavelengthUnits.Å)} Å
                      </li>
                      <li>
                        Frequency: {formatNumber(result.frequency / frequencyUnits.PHz)} PHz
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                {showDetails ? "Hide Details" : "Show More Details"}
              </button>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { type: "wavelength", unit: "nm", value: 650, label: "Red Light" },
                { type: "wavelength", unit: "nm", value: 450, label: "Blue Light" },
                { type: "frequency", unit: "GHz", value: 2.45, label: "Microwave" },
                { type: "wavelength", unit: "nm", value: 550, label: "Green Light" },
                { type: "frequency", unit: "PHz", value: 1, label: "X-Ray" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setInputType(preset.type);
                    setUnit(preset.unit);
                    setInputValue(preset.value);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.label} ({preset.value} {preset.unit})
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> About
            </h3>
            <div className="text-sm text-blue-600 space-y-1">
              <p>Calculates photon energy using:</p>
              <ul className="list-disc list-inside">
                <li>E = hf (Energy = Planck constant × frequency)</li>
                <li>c = λf (Speed of light = wavelength × frequency)</li>
              </ul>
              <p>Constants: h = 6.62607015 × 10⁻³⁴ J·s, c = 299,792,458 m/s</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotonEnergyCalculator;