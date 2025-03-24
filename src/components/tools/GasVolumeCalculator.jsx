"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const GasVolumeCalculator = () => {
  const [pressure, setPressure] = useState(1); // Default: 1 atm
  const [pressureUnit, setPressureUnit] = useState("atm");
  const [temperature, setTemperature] = useState(273.15); // Default: 0°C in K
  const [tempUnit, setTempUnit] = useState("K");
  const [moles, setMoles] = useState(1); // Default: 1 mole
  const [volumeUnit, setVolumeUnit] = useState("L"); // Default volume unit
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Constants
  const R = 0.08205736; // Gas constant in L·atm/(mol·K)
  const R_SI = 8.314462618; // Gas constant in J/(mol·K) = Pa·m³/(mol·K)

  // Unit conversion factors
  const pressureUnits = {
    atm: 1,
    Pa: 101325,
    kPa: 101.325,
    bar: 1.01325,
    psi: 14.6959,
  };

  const volumeUnits = {
    L: 1,
    mL: 1000,
    "m³": 0.001,
    "cm³": 1000,
    gal: 0.264172, // US gallons
  };

  const tempConversions = {
    K: (t) => t,
    C: (t) => t + 273.15,
    F: (t) => ((t - 32) * 5) / 9 + 273.15,
  };

  // Calculate volume
  const calculateVolume = useCallback(() => {
    setError("");
    setResult(null);

    const P = parseFloat(pressure);
    const T = parseFloat(temperature);
    const n = parseFloat(moles);

    if (isNaN(P) || isNaN(T) || isNaN(n) || P <= 0 || T <= 0 || n <= 0) {
      setError("Please enter valid positive values for pressure, temperature, and moles");
      return;
    }

    try {
      const P_SI = P / pressureUnits[pressureUnit]; // Convert to atm
      const T_K = tempConversions[tempUnit](T); // Convert to Kelvin

      if (T_K <= 0) {
        setError("Temperature in Kelvin must be positive");
        return;
      }

      const volume_L = (n * R * T_K) / P_SI; // Volume in liters
      const resultData = {
        volume_L,
        pressure: P_SI,
        temperature: T_K,
        moles: n,
        pressureUnit,
        tempUnit,
        volumeUnit,
      };

      setResult(resultData);
      setHistory((prev) => [...prev, resultData].slice(-5)); // Keep last 5 calculations
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [pressure, temperature, moles, pressureUnit, tempUnit, volumeUnit]);

  // Reset inputs
  const reset = () => {
    setPressure(1);
    setPressureUnit("atm");
    setTemperature(273.15);
    setTempUnit("K");
    setMoles(1);
    setVolumeUnit("L");
    setResult(null);
    setError("");
  };

  // Download result as text
  const downloadResult = () => {
    if (!result) return;
    const text = `
Gas Volume Calculation Result:
Pressure: ${formatNumber(result.pressure)} atm (${formatNumber(pressure)} ${pressureUnit})
Temperature: ${formatNumber(result.temperature)} K (${formatNumber(temperature)} ${tempUnit})
Moles: ${formatNumber(result.moles)} mol
Volume: ${formatNumber(result.volume_L)} L
Volume in ${volumeUnit}: ${formatNumber(result.volume_L * volumeUnits[volumeUnit])} ${volumeUnit}
    `;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `gas-volume-${Date.now()}.txt`;
    link.click();
  };

  const formatNumber = (num, digits = 3) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Gas Volume Calculator
        </h1>

        <div className="space-y-6">
          {/* Inputs */}
          {[
            {
              label: "Pressure",
              value: pressure,
              setValue: setPressure,
              unit: pressureUnit,
              setUnit: setPressureUnit,
              units: pressureUnits,
            },
            {
              label: "Temperature",
              value: temperature,
              setValue: setTemperature,
              unit: tempUnit,
              setUnit: setTempUnit,
              units: tempConversions,
            },
            {
              label: "Moles of Gas",
              value: moles,
              setValue: setMoles,
            },
          ].map(({ label, value, setValue, unit, setUnit, units }) => (
            <div key={label} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step={label === "Moles of Gas" ? 0.1 : 0.01}
                />
              </div>
              {units && (
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(units).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}

          {/* Volume Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume Unit
            </label>
            <select
              value={volumeUnit}
              onChange={(e) => setVolumeUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(volumeUnits).map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateVolume}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={downloadResult}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
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
              <h2 className="text-lg font-semibold mb-2">Results</h2>
              <p>
                Volume: {formatNumber(result.volume_L * volumeUnits[volumeUnit])}{" "}
                {volumeUnit}
              </p>
              {Object.keys(volumeUnits).map(
                (unit) =>
                  unit !== volumeUnit && (
                    <p key={unit}>
                      {formatNumber(result.volume_L * volumeUnits[unit])} {unit}
                    </p>
                  )
              )}
              <p className="text-sm text-gray-600 mt-2">
                Conditions: {formatNumber(pressure)} {pressureUnit},{" "}
                {formatNumber(temperature)} {tempUnit}, {formatNumber(moles)} mol
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "STP (0°C, 1 atm)", P: 1, PU: "atm", T: 0, TU: "C", n: 1 },
                { label: "Room Temp (25°C)", P: 1, PU: "atm", T: 25, TU: "C", n: 1 },
                { label: "High Pressure (10 bar)", P: 10, PU: "bar", T: 25, TU: "C", n: 1 },
              ].map(({ label, P, PU, T, TU, n }) => (
                <button
                  key={label}
                  onClick={() => {
                    setPressure(P);
                    setPressureUnit(PU);
                    setTemperature(T);
                    setTempUnit(TU);
                    setMoles(n);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">Calculation History</h3>
              <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                {history.slice().reverse().map((item, index) => (
                  <li key={index}>
                    {formatNumber(item.volume_L * volumeUnits[item.volumeUnit])}{" "}
                    {item.volumeUnit} at {formatNumber(item.pressure)} atm,{" "}
                    {formatNumber(item.temperature)} K, {formatNumber(item.moles)} mol
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Supports multiple pressure (atm, Pa, kPa, bar, psi) and temperature (K, °C, °F) units</li>
              <li>Volume output in L, mL, m³, cm³, gal</li>
              <li>Preset conditions (STP, Room Temp, High Pressure)</li>
              <li>Calculation history (last 5)</li>
              <li>Download results as text file</li>
            </ul>
          </div>

          {/* About */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About the Ideal Gas Law</summary>
              <div className="mt-2 space-y-2">
                <p>PV = nRT</p>
                <p>Where:</p>
                <ul className="list-disc list-inside">
                  <li>P = Pressure</li>
                  <li>V = Volume</li>
                  <li>n = Number of moles</li>
                  <li>R = Gas constant (0.08206 L·atm/(mol·K))</li>
                  <li>T = Temperature in Kelvin</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GasVolumeCalculator;