"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const KineticEnergyCalculator = () => {
  const [mass, setMass] = useState("");
  const [velocity, setVelocity] = useState("");
  const [massUnit, setMassUnit] = useState("kg");
  const [velocityUnit, setVelocityUnit] = useState("m/s");
  const [energyUnit, setEnergyUnit] = useState("J"); // New: J, kJ, MJ, kWh
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Unit conversion factors to base SI units (kg, m/s, J)
  const massUnits = {
    kg: 1,
    g: 0.001,
    lb: 0.453592,
    t: 1000, // Tonnes
  };

  const velocityUnits = {
    "m/s": 1,
    "km/h": 0.277778,
    mph: 0.44704,
    "ft/s": 0.3048,
  };

  const energyUnits = {
    J: 1,
    kJ: 0.001,
    MJ: 0.000001,
    kWh: 1 / 3600000,
  };

  // Calculate kinetic energy
  const calculateKineticEnergy = useCallback(() => {
    setError("");
    setResult(null);

    if (!mass || !velocity || isNaN(mass) || isNaN(velocity)) {
      setError("Please enter valid numeric values for mass and velocity");
      return;
    }

    const m = parseFloat(mass) * massUnits[massUnit];
    const v = parseFloat(velocity) * velocityUnits[velocityUnit];

    if (m <= 0 || v < 0) {
      setError("Mass must be positive and velocity cannot be negative");
      return;
    }

    try {
      const ke = 0.5 * m * v * v; // Joules
      const resultData = { ke, mass: m, velocity: v, massUnit, velocityUnit, energyUnit };
      setResult(resultData);
      setHistory((prev) => [...prev, resultData].slice(-5)); // Keep last 5 calculations
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [mass, velocity, massUnit, velocityUnit, energyUnit]);

  // Format number for display
  const formatNumber = (num, digits = 2) => {
    if (num < 1e-6 || num > 1e6) {
      return num.toExponential(digits);
    }
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  // Convert energy to selected unit
  const convertEnergy = (ke) => ke * (1 / energyUnits[energyUnit]);

  // Reset inputs
  const reset = () => {
    setMass("");
    setVelocity("");
    setMassUnit("kg");
    setVelocityUnit("m/s");
    setEnergyUnit("J");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Kinetic Energy Calculator
        </h1>

        <div className="space-y-6">
          {/* Mass Input */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mass</label>
              <input
                type="number"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                placeholder="Enter mass"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={massUnit}
                onChange={(e) => setMassUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(massUnits).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Velocity Input */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Velocity</label>
              <input
                type="number"
                value={velocity}
                onChange={(e) => setVelocity(e.target.value)}
                placeholder="Enter velocity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={velocityUnit}
                onChange={(e) => setVelocityUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(velocityUnits).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Energy Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Energy Unit
            </label>
            <select
              value={energyUnit}
              onChange={(e) => setEnergyUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(energyUnits).map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={calculateKineticEnergy}
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
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>
                Kinetic Energy: {formatNumber(convertEnergy(result.ke))} {energyUnit}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Mass: {formatNumber(result.mass)} kg | Velocity:{" "}
                {formatNumber(result.velocity)} m/s
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Presets</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { mass: 1, massUnit: "kg", velocity: 10, velocityUnit: "m/s", label: "1 kg at 10 m/s" },
                { mass: 1000, massUnit: "kg", velocity: 100, velocityUnit: "km/h", label: "Car (1000 kg, 100 km/h)" },
                { mass: 0.05, massUnit: "kg", velocity: 400, velocityUnit: "m/s", label: "Bullet (50g, 400 m/s)" },
                { mass: 0.145, massUnit: "kg", velocity: 45, velocityUnit: "m/s", label: "Baseball (145g, 45 m/s)" },
              ].map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMass(preset.mass);
                    setMassUnit(preset.massUnit);
                    setVelocity(preset.velocity);
                    setVelocityUnit(preset.velocityUnit);
                  }}
                  className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-700 mb-2">Calculation History</h3>
              <ul className="text-sm text-blue-600 space-y-1 max-h-40 overflow-y-auto">
                {history.slice().reverse().map((item, index) => (
                  <li key={index}>
                    {formatNumber(convertEnergy(item.ke))} {item.energyUnit} (m: {item.mass}{item.massUnit}, v: {item.velocity}{item.velocityUnit})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <details className="group">
              <summary className="flex items-center cursor-pointer text-sm font-medium text-gray-700">
                <FaInfoCircle className="mr-2" /> About
              </summary>
              <div className="mt-2 text-sm text-gray-600 space-y-2">
                <p>Calculates kinetic energy using the formula:</p>
                <p className="font-mono">KE = ½mv²</p>
                <p>Where:</p>
                <ul className="list-disc list-inside">
                  <li>m = mass (kg)</li>
                  <li>v = velocity (m/s)</li>
                  <li>KE = kinetic energy (Joules)</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KineticEnergyCalculator;