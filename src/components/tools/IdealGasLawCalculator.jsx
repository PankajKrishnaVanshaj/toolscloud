"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const IdealGasLawCalculator = () => {
  const [calculateFor, setCalculateFor] = useState("P");
  const [pressure, setPressure] = useState("");
  const [pressureUnit, setPressureUnit] = useState("atm");
  const [volume, setVolume] = useState("");
  const [volumeUnit, setVolumeUnit] = useState("L");
  const [moles, setMoles] = useState("");
  const [temperature, setTemperature] = useState("");
  const [tempUnit, setTempUnit] = useState("K");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [precision, setPrecision] = useState(2); // Decimal places for results

  // Constants
  const R = {
    atm: 0.08206, // L·atm/(mol·K)
    Pa: 8.314, // J/(mol·K) = Pa·m³/(mol·K)
    kPa: 8.314, // Adjusted later
    bar: 0.08314, // L·bar/(mol·K)
  };

  // Unit conversion factors (to base units: Pa, m³, K)
  const pressureUnits = {
    Pa: 1,
    kPa: 1e3,
    atm: 101325,
    bar: 1e5,
  };

  const volumeUnits = {
    L: 0.001, // Convert to m³
    mL: 1e-6,
    "cm³": 1e-6,
    "m³": 1,
  };

  const temperatureUnits = {
    K: (val) => val,
    C: (val) => val + 273.15,
    F: (val) => (val - 32) * (5 / 9) + 273.15,
  };

  const reverseTemperatureUnits = {
    K: (val) => val,
    C: (val) => val - 273.15,
    F: (val) => (val - 273.15) * (9 / 5) + 32,
  };

  // Calculation logic
  const calculateIdealGas = useCallback(() => {
    setError("");
    setResult(null);

    // Convert inputs to base units (Pa, m³, mol, K)
    const P = pressure ? parseFloat(pressure) * pressureUnits[pressureUnit] : null;
    const V = volume ? parseFloat(volume) * volumeUnits[volumeUnit] : null;
    const n = moles ? parseFloat(moles) : null;
    const T = temperature ? temperatureUnits[tempUnit](parseFloat(temperature)) : null;

    // Validation
    const inputs = { P, V, n, T };
    const required = calculateFor === "P" ? ["V", "n", "T"] :
                    calculateFor === "V" ? ["P", "n", "T"] :
                    calculateFor === "n" ? ["P", "V", "T"] :
                    ["P", "V", "n"];

    for (let key of required) {
      if (inputs[key] === null || isNaN(inputs[key])) {
        setError(
          `Please enter a valid ${key === "P" ? "pressure" : key === "V" ? "volume" : key === "n" ? "moles" : "temperature"}`
        );
        return;
      }
      if (inputs[key] <= 0) {
        setError(
          `${key === "P" ? "Pressure" : key === "V" ? "Volume" : key === "n" ? "Moles" : "Temperature"} must be positive`
        );
        return;
      }
    }

    if (calculateFor === "T" && T <= 0) {
      setError("Temperature must be above absolute zero (0 K)");
      return;
    }

    try {
      let calculatedValue;
      const R_value =
        pressureUnit === "atm" ? R.atm :
        pressureUnit === "bar" ? R.bar :
        R.Pa / (pressureUnit === "kPa" ? 1e3 : 1);

      switch (calculateFor) {
        case "P":
          calculatedValue = (n * R_value * T) / V;
          calculatedValue /= pressureUnits[pressureUnit] / pressureUnits.atm; // Convert to chosen unit
          setResult({
            P: calculatedValue,
            V: parseFloat(volume),
            n: parseFloat(moles),
            T: parseFloat(temperature),
            units: { P: pressureUnit, V: volumeUnit, T: tempUnit },
          });
          break;
        case "V":
          calculatedValue = (n * R_value * T) / (P / pressureUnits.atm);
          calculatedValue /= volumeUnits[volumeUnit]; // Convert to chosen unit
          setResult({
            P: parseFloat(pressure),
            V: calculatedValue,
            n: parseFloat(moles),
            T: parseFloat(temperature),
            units: { P: pressureUnit, V: volumeUnit, T: tempUnit },
          });
          break;
        case "n":
          calculatedValue = (P * V) / (R_value * T);
          setResult({
            P: parseFloat(pressure),
            V: parseFloat(volume),
            n: calculatedValue,
            T: parseFloat(temperature),
            units: { P: pressureUnit, V: volumeUnit, T: tempUnit },
          });
          break;
        case "T":
          calculatedValue = (P * V) / (n * R_value);
          calculatedValue = reverseTemperatureUnits[tempUnit](calculatedValue);
          setResult({
            P: parseFloat(pressure),
            V: parseFloat(volume),
            n: parseFloat(moles),
            T: calculatedValue,
            units: { P: pressureUnit, V: volumeUnit, T: tempUnit },
          });
          break;
        default:
          throw new Error("Invalid calculation type");
      }
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [calculateFor, pressure, pressureUnit, volume, volumeUnit, moles, temperature, tempUnit]);

  // Format number with precision
  const formatNumber = (num) => {
    if (num === null || isNaN(num)) return "N/A";
    if (Math.abs(num) < 1e-6 || Math.abs(num) > 1e6) {
      return num.toExponential(precision);
    }
    return num.toLocaleString("en-US", { maximumFractionDigits: precision });
  };

  // Reset all inputs
  const resetInputs = () => {
    setPressure("");
    setVolume("");
    setMoles("");
    setTemperature("");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Ideal Gas Law Calculator
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
              <option value="P">Pressure (P)</option>
              <option value="V">Volume (V)</option>
              <option value="n">Moles (n)</option>
              <option value="T">Temperature (T)</option>
            </select>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 gap-4">
            {calculateFor !== "P" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pressure
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={pressure}
                    onChange={(e) => setPressure(e.target.value)}
                    placeholder="e.g., 1"
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={pressureUnit}
                    onChange={(e) => setPressureUnit(e.target.value)}
                    className="w-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pa">Pa</option>
                    <option value="kPa">kPa</option>
                    <option value="atm">atm</option>
                    <option value="bar">bar</option>
                  </select>
                </div>
              </div>
            )}
            {calculateFor !== "V" && (
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
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={volumeUnit}
                    onChange={(e) => setVolumeUnit(e.target.value)}
                    className="w-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">L</option>
                    <option value="mL">mL</option>
                    <option value="cm³">cm³</option>
                    <option value="m³">m³</option>
                  </select>
                </div>
              </div>
            )}
            {calculateFor !== "n" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moles (n)
                </label>
                <input
                  type="number"
                  value={moles}
                  onChange={(e) => setMoles(e.target.value)}
                  placeholder="e.g., 1"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {calculateFor !== "T" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="e.g., 298"
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={tempUnit}
                    onChange={(e) => setTempUnit(e.target.value)}
                    className="w-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="K">K</option>
                    <option value="C">°C</option>
                    <option value="F">°F</option>
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
              min="0"
              max="6"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateIdealGas}
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
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Results:</h2>
              <ul className="space-y-1 text-gray-700">
                <li>Pressure: {formatNumber(result.P)} {result.units.P}</li>
                <li>Volume: {formatNumber(result.V)} {result.units.V}</li>
                <li>Moles: {formatNumber(result.n)} mol</li>
                <li>Temperature: {formatNumber(result.T)} {result.units.T}</li>
              </ul>
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
                {
                  label: "STP (1 mol)",
                  values: { P: "V", V: 22.4, VUnit: "L", n: 1, T: 273, TUnit: "K" },
                },
                {
                  label: "0.5 mol, 25°C",
                  values: { P: 1, PUnit: "atm", V: "P", n: 0.5, T: 25, TUnit: "C" },
                },
                {
                  label: "1 bar, 300 K",
                  values: { P: 1, PUnit: "bar", V: 25, VUnit: "L", n: "T", T: 300, TUnit: "K" },
                },
              ].map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCalculateFor(Object.keys(preset.values).find((k) => preset.values[k] === calculateFor[0]) || "P");
                    setPressure(preset.values.PUnit ? preset.values.P : "");
                    setPressureUnit(preset.values.PUnit || "atm");
                    setVolume(preset.values.VUnit ? preset.values.V : "");
                    setVolumeUnit(preset.values.VUnit || "L");
                    setMoles(preset.values.n || "");
                    setTemperature(preset.values.T || "");
                    setTempUnit(preset.values.TUnit || "K");
                    setResult(null);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> About
            </h3>
            <div className="text-sm text-blue-600 space-y-2">
              <p>Uses the Ideal Gas Law: PV = nRT</p>
              <ul className="list-disc list-inside">
                <li>P = Pressure (Pa, kPa, atm, bar)</li>
                <li>V = Volume (L, mL, cm³, m³)</li>
                <li>n = Moles</li>
                <li>R = Gas constant (varies by unit)</li>
                <li>T = Temperature (K, °C, °F)</li>
              </ul>
              <p>
                R Values: 0.08206 L·atm/(mol·K), 8.314 Pa·m³/(mol·K), 0.08314 L·bar/(mol·K)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdealGasLawCalculator;