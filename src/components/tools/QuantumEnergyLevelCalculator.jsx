"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator } from "react-icons/fa";

const QuantumEnergyLevelCalculator = () => {
  const [system, setSystem] = useState("particleBox");
  const [n, setN] = useState(1); // Principal quantum number
  const [n2, setN2] = useState(1); // Secondary quantum number (e.g., l for hydrogen)
  const [L, setL] = useState(1); // Length scale (nm)
  const [m, setM] = useState(9.1093837e-31); // Mass (kg, default: electron)
  const [k, setK] = useState(1); // Spring constant for harmonic oscillator (N/m)
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("J"); // Energy unit: J or eV

  // Constants
  const hbar = 1.0545718e-34; // Reduced Planck constant (J·s)
  const e = 1.60217662e-19; // Elementary charge (C)
  const epsilon0 = 8.854187817e-12; // Vacuum permittivity (F/m)
  const nmToM = 1e-9; // nm to meters conversion

  const calculateEnergy = useCallback(() => {
    setError("");
    setResult(null);

    const quantumN = parseInt(n);
    const quantumN2 = parseInt(n2);
    const mass = parseFloat(m);
    const length = parseFloat(L);
    const springConstant = parseFloat(k);

    // Input validation
    if (isNaN(quantumN) || quantumN < 1) return setError("Quantum number n must be a positive integer");
    if (system === "hydrogen" && (isNaN(quantumN2) || quantumN2 < 0 || quantumN2 >= quantumN))
      return setError("Quantum number l must be 0 ≤ l < n");
    if (isNaN(mass) || mass <= 0) return setError("Mass must be a positive number");
    if (system === "particleBox" && (isNaN(length) || length <= 0))
      return setError("Length must be a positive number");
    if (system === "harmonic" && (isNaN(springConstant) || springConstant <= 0))
      return setError("Spring constant must be a positive number");

    try {
      let energy, description;

      switch (system) {
        case "particleBox":
          const Lm = length * nmToM;
          energy = (quantumN * quantumN * Math.PI * Math.PI * hbar * hbar) / (2 * mass * Lm * Lm);
          description = "Particle in a 1D infinite potential well";
          break;

        case "hydrogen":
          // Simplified hydrogen energy with l dependence (Rydberg-like)
          energy = (-13.6 * e) / (quantumN * quantumN) * (1 + quantumN2 / (quantumN * 10)); // Rough l correction
          description = "Hydrogen atom (simplified with l dependence)";
          break;

        case "harmonic":
          const omega = Math.sqrt(springConstant / mass);
          energy = hbar * omega * (quantumN - 0.5);
          description = `Quantum harmonic oscillator (k = ${springConstant} N/m)`;
          break;

        default:
          throw new Error("Unknown quantum system");
      }

      setResult({
        energy: unit === "eV" ? energy / e : energy,
        system: description,
        n: quantumN,
        n2: quantumN2,
        mass,
        length: system === "particleBox" ? length : null,
        k: system === "harmonic" ? springConstant : null,
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [system, n, n2, L, m, k, unit]);

  const formatNumber = (num, digits = 4) =>
    Math.abs(num) < 1e-6 || Math.abs(num) > 1e6
      ? num.toExponential(digits)
      : num.toLocaleString("en-US", { maximumFractionDigits: digits });

  const reset = () => {
    setSystem("particleBox");
    setN(1);
    setN2(1);
    setL(1);
    setM(9.1093837e-31);
    setK(1);
    setResult(null);
    setError("");
    setUnit("J");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Quantum Energy Level Calculator
        </h1>

        <div className="space-y-6">
          {/* System Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantum System</label>
            <select
              value={system}
              onChange={(e) => {
                setSystem(e.target.value);
                setResult(null);
                if (e.target.value === "hydrogen") {
                  setL(1);
                  setM(9.1093837e-31);
                }
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="particleBox">Particle in a Box</option>
              <option value="hydrogen">Hydrogen Atom</option>
              <option value="harmonic">Harmonic Oscillator</option>
            </select>
          </div>

          {/* Quantum Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantum Number (n)</label>
              <input
                type="number"
                min="1"
                value={n}
                onChange={(e) => setN(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {system === "hydrogen" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Angular Quantum Number (l)</label>
                <input
                  type="number"
                  min="0"
                  max={n - 1}
                  value={n2}
                  onChange={(e) => setN2(Math.max(0, Math.min(n - 1, parseInt(e.target.value) || 0)))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {system === "particleBox" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Box Length (nm)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={L}
                  onChange={(e) => setL(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {system !== "hydrogen" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mass (kg)</label>
                <input
                  type="number"
                  step="1e-31"
                  value={m}
                  onChange={(e) => setM(Math.max(1e-35, parseFloat(e.target.value) || 9.1093837e-31))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Default: 9.109e-31 kg (electron)</p>
              </div>
            )}
            {system === "harmonic" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spring Constant (N/m)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={k}
                  onChange={(e) => setK(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Energy Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="J">Joules (J)</option>
              <option value="eV">Electron Volts (eV)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateEnergy}
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

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Energy Level:</h2>
              <p className="text-xl font-bold">{formatNumber(result.energy)} {unit}</p>
              <p className="text-sm text-gray-600 mt-2">
                System: {result.system}<br />
                n: {result.n}
                {system === "hydrogen" && <><br />l: {result.n2}</>}
                {result.length && <><br />Box Length: {formatNumber(result.length)} nm</>}
                {result.mass && <><br />Mass: {formatNumber(result.mass)} kg</>}
                {result.k && <><br />Spring Constant: {formatNumber(result.k)} N/m</>}
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
                { label: "Electron in 1nm Box", system: "particleBox", n: 1, L: 1, m: 9.1093837e-31 },
                { label: "Hydrogen n=1, l=0", system: "hydrogen", n: 1, n2: 0 },
                { label: "Harmonic Electron", system: "harmonic", n: 1, m: 9.1093837e-31, k: 1 },
                { label: "Proton in 10nm Box", system: "particleBox", n: 1, L: 10, m: 1.6726219e-27 },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSystem(preset.system);
                    setN(preset.n);
                    setN2(preset.n2 || 1);
                    setL(preset.L || 1);
                    setM(preset.m || 9.1093837e-31);
                    setK(preset.k || 1);
                    setResult(null);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">About</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Particle in Box: E = n²π²ℏ² / (2mL²)</li>
              <li>Hydrogen: E ≈ -13.6 eV / n² (simplified with l correction)</li>
              <li>Harmonic: E = ℏω(n - 1/2), ω = √(k/m)</li>
              <li>Educational tool with simplified models</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumEnergyLevelCalculator;