"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaInfoCircle } from "react-icons/fa";

const OsmoticPressureCalculator = () => {
  const [concentration, setConcentration] = useState("");
  const [concUnit, setConcUnit] = useState("M"); // M, mM, μM, mol/kg
  const [temperature, setTemperature] = useState("");
  const [tempUnit, setTempUnit] = useState("K"); // K, °C, °F
  const [vanthoff, setVanthoff] = useState(1);
  const [result, setResult] = useState(null);
  const [pressureUnit, setPressureUnit] = useState("atm"); // atm, kPa, bar, psi, mmHg
  const [error, setError] = useState("");
  const [solventDensity, setSolventDensity] = useState(1); // g/mL, for mol/kg

  // Constants
  const R = 0.08206; // Gas constant in L·atm/(mol·K)

  // Conversion factors
  const concConversions = { M: 1, mM: 1e-3, μM: 1e-6, "mol/kg": 1 };
  const tempConversions = {
    K: (t) => t,
    "°C": (t) => t + 273.15,
    "°F": (t) => (t - 32) * (5 / 9) + 273.15,
  };
  const pressureConversions = {
    atm: 1,
    kPa: 101.325,
    bar: 1.01325,
    psi: 14.6959,
    mmHg: 760,
  };

  // Preset examples
  const presets = [
    { name: "0.9% NaCl (saline)", conc: 0.154, concUnit: "M", temp: 310, tempUnit: "K", i: 2 },
    { name: "0.1 M Glucose", conc: 0.1, concUnit: "M", temp: 298, tempUnit: "K", i: 1 },
    { name: "0.05 M CaCl₂", conc: 0.05, concUnit: "M", temp: 25, tempUnit: "°C", i: 3 },
    { name: "0.01 mol/kg Sucrose", conc: 0.01, concUnit: "mol/kg", temp: 20, tempUnit: "°C", i: 1 },
  ];

  // Calculation logic
  const calculateOsmoticPressure = useCallback(() => {
    setError("");
    setResult(null);

    if (
      !concentration ||
      !temperature ||
      isNaN(concentration) ||
      isNaN(temperature) ||
      isNaN(vanthoff) ||
      isNaN(solventDensity)
    ) {
      setError("Please enter valid numeric values");
      return;
    }

    const C = parseFloat(concentration);
    const T = parseFloat(temperature);
    const i = parseFloat(vanthoff);
    const density = parseFloat(solventDensity);

    if (C <= 0 || i <= 0 || density <= 0) {
      setError("Concentration, van 't Hoff factor, and solvent density must be positive");
      return;
    }
    if (T <= -273.15 && tempUnit === "°C") {
      setError("Temperature must be above absolute zero (-273.15°C)");
      return;
    }
    if (T <= 0 && tempUnit === "K") {
      setError("Temperature must be above absolute zero (0 K)");
      return;
    }
    if (T <= -459.67 && tempUnit === "°F") {
      setError("Temperature must be above absolute zero (-459.67°F)");
      return;
    }

    try {
      // Convert concentration to mol/L
      let concInM =
        concUnit === "mol/kg" ? (C * density * 1000) / 1000 : C * concConversions[concUnit];

      // Convert temperature to Kelvin
      let tempInK = tempConversions[tempUnit](T);

      // Calculate osmotic pressure in atm (π = iCRT)
      const pressureAtm = i * concInM * R * tempInK;

      // Convert to selected pressure unit
      const pressure = pressureAtm * pressureConversions[pressureUnit];

      setResult({
        pressure,
        unit: pressureUnit,
        osmolarity: i * concInM,
        osmoticConcentration: concInM,
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [concentration, concUnit, temperature, tempUnit, vanthoff, pressureUnit, solventDensity]);

  // Reset form
  const reset = () => {
    setConcentration("");
    setConcUnit("M");
    setTemperature("");
    setTempUnit("K");
    setVanthoff(1);
    setPressureUnit("atm");
    setSolventDensity(1);
    setResult(null);
    setError("");
  };

  const formatNumber = (num, digits = 3) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Osmotic Pressure Calculator
        </h1>

        <div className="space-y-6">
          {/* Concentration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Concentration</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={concentration}
                onChange={(e) => setConcentration(e.target.value)}
                placeholder="e.g., 0.1"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={concUnit}
                onChange={(e) => setConcUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="M">M (mol/L)</option>
                <option value="mM">mM</option>
                <option value="μM">μM</option>
                <option value="mol/kg">mol/kg</option>
              </select>
            </div>
          </div>

          {/* Solvent Density (for mol/kg) */}
          {concUnit === "mol/kg" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solvent Density (g/mL)
              </label>
              <input
                type="number"
                value={solventDensity}
                onChange={(e) => setSolventDensity(Math.max(0, parseFloat(e.target.value) || 1))}
                placeholder="e.g., 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Typically 1 g/mL for water at room temperature
              </p>
            </div>
          )}

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="e.g., 298"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="K">Kelvin (K)</option>
                <option value="°C">Celsius (°C)</option>
                <option value="°F">Fahrenheit (°F)</option>
              </select>
            </div>
          </div>

          {/* van 't Hoff Factor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              van 't Hoff Factor (i)
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={vanthoff}
              onChange={(e) => setVanthoff(Math.max(1, parseFloat(e.target.value) || 1))}
              placeholder="e.g., 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of particles per solute molecule (e.g., 2 for NaCl)
            </p>
          </div>

          {/* Pressure Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pressure Unit</label>
            <select
              value={pressureUnit}
              onChange={(e) => setPressureUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="atm">atm</option>
              <option value="kPa">kPa</option>
              <option value="bar">bar</option>
              <option value="psi">psi</option>
              <option value="mmHg">mmHg</option>
            </select>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setConcentration(preset.conc);
                    setConcUnit(preset.concUnit);
                    setTemperature(preset.temp);
                    setTempUnit(preset.tempUnit);
                    setVanthoff(preset.i);
                    setSolventDensity(1); // Default for presets
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={calculateOsmoticPressure}
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

          {/* Result */}
          {result && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold text-green-700 mb-2">Results:</h2>
              <p>
                Osmotic Pressure: {formatNumber(result.pressure)} {result.unit}
              </p>
              <p>Osmolarity: {formatNumber(result.osmolarity)} osM</p>
              <p>
                Effective Concentration: {formatNumber(result.osmoticConcentration)} M
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> About
            </h3>
            <div className="text-sm text-blue-600 space-y-2">
              <p>Calculates osmotic pressure using the van 't Hoff equation:</p>
              <p className="font-mono">π = iCRT</p>
              <ul className="list-disc list-inside">
                <li>i = van 't Hoff factor</li>
                <li>C = concentration (mol/L)</li>
                <li>R = gas constant (0.08206 L·atm/(mol·K))</li>
                <li>T = temperature (K)</li>
              </ul>
              <p>Osmolarity = i × C (osM)</p>
              <p>For mol/kg, assumes solvent density conversion to mol/L.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OsmoticPressureCalculator;