"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const EntropyCalculator = () => {
  const [type, setType] = useState("shannon");
  const [probabilities, setProbabilities] = useState("");
  const [temperature, setTemperature] = useState("");
  const [particles, setParticles] = useState("");
  const [volume, setVolume] = useState("0.0224"); // Default volume in m³
  const [mass, setMass] = useState("2.016e-27"); // Default hydrogen molecule mass
  const [base, setBase] = useState("2"); // Log base for Shannon entropy
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Constants
  const k = 1.380649e-23; // Boltzmann constant (J/K)
  const h = 6.62607015e-34; // Planck constant (J·s)

  // Preset examples
  const presets = [
    { name: "Coin Flip", type: "shannon", probs: "0.5, 0.5" },
    { name: "6-sided Die", type: "shannon", probs: "0.1667, 0.1667, 0.1667, 0.1667, 0.1667, 0.1667" },
    { name: "Gas at 300K", type: "thermodynamic", temp: "300", particles: "6.022e23", volume: "0.0224", mass: "2.016e-27" },
    { name: "Water Vapor", type: "thermodynamic", temp: "373", particles: "6.022e23", volume: "0.0305", mass: "2.988e-26" },
  ];

  const calculateEntropy = useCallback(() => {
    setError("");
    setResult(null);

    if (type === "shannon") {
      calculateShannonEntropy();
    } else {
      calculateThermodynamicEntropy();
    }
  }, [type, probabilities, temperature, particles, volume, mass, base]);

  const calculateShannonEntropy = () => {
    if (!probabilities.trim()) {
      setError("Please enter probabilities");
      return;
    }

    try {
      const probs = probabilities.split(",").map((p) => parseFloat(p.trim()));
      if (probs.some((p) => isNaN(p) || p < 0 || p > 1)) {
        setError("Probabilities must be numbers between 0 and 1");
        return;
      }

      const sum = probs.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1) > 0.01) {
        setError("Probabilities must sum to approximately 1");
        return;
      }

      const logBase = parseFloat(base);
      const logFunc = (x) => Math.log(x) / Math.log(logBase);
      const entropy = -probs
        .filter((p) => p > 0)
        .reduce((sum, p) => sum + p * logFunc(p), 0);

      const unit = base === "2" ? "bits" : base === "e" ? "nats" : "units";
      const newResult = { shannon: entropy, unit };
      setResult(newResult);
      setHistory((prev) => [...prev, { type, ...newResult }].slice(-5)); // Keep last 5
    } catch (err) {
      setError("Error calculating Shannon entropy: " + err.message);
    }
  };

  const calculateThermodynamicEntropy = () => {
    const T = parseFloat(temperature);
    const N = parseFloat(particles);
    const V = parseFloat(volume);
    const m = parseFloat(mass);

    if (!T || !N || !V || !m || isNaN(T) || isNaN(N) || isNaN(V) || isNaN(m)) {
      setError("Please enter valid numeric values for all fields");
      return;
    }

    if (T <= 0 || N <= 0 || V <= 0 || m <= 0) {
      setError("All values must be positive");
      return;
    }

    try {
      const lambda = h / Math.sqrt(2 * Math.PI * m * k * T); // Thermal wavelength
      const term = V / (N * Math.pow(lambda, 3));

      if (term <= 0) {
        setError("Invalid calculation parameters (term ≤ 0)");
        return;
      }

      const entropy = N * k * (Math.log(term) + 5 / 2);
      const newResult = { thermodynamic: entropy, unit: "J/K" };
      setResult(newResult);
      setHistory((prev) => [...prev, { type, ...newResult }].slice(-5));
    } catch (err) {
      setError("Error calculating thermodynamic entropy: " + err.message);
    }
  };

  const reset = () => {
    setProbabilities("");
    setTemperature("");
    setParticles("");
    setVolume("0.0224");
    setMass("2.016e-27");
    setBase("2");
    setResult(null);
    setError("");
  };

  const formatNumber = (num, digits = 4) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Entropy Calculator
        </h1>

        <div className="space-y-6">
          {/* Entropy Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entropy Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                reset();
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="shannon">Shannon (Information)</option>
              <option value="thermodynamic">Thermodynamic (Physical)</option>
            </select>
          </div>

          {/* Inputs */}
          {type === "shannon" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Probabilities (comma-separated)
                </label>
                <input
                  type="text"
                  value={probabilities}
                  onChange={(e) => setProbabilities(e.target.value)}
                  placeholder="e.g., 0.5, 0.5"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Must sum to ~1</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logarithmic Base
                </label>
                <select
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2">2 (bits)</option>
                  <option value="e">e (nats)</option>
                  <option value="10">10 (ban)</option>
                </select>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (K)
                </label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="e.g., 300"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Particles
                </label>
                <input
                  type="number"
                  value={particles}
                  onChange={(e) => setParticles(e.target.value)}
                  placeholder="e.g., 6.022e23"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume (m³)
                </label>
                <input
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Particle Mass (kg)
                </label>
                <input
                  type="number"
                  value={mass}
                  onChange={(e) => setMass(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setType(preset.type);
                    if (preset.type === "shannon") {
                      setProbabilities(preset.probs);
                      setTemperature("");
                      setParticles("");
                      setVolume("0.0224");
                      setMass("2.016e-27");
                    } else {
                      setTemperature(preset.temp);
                      setParticles(preset.particles);
                      setVolume(preset.volume);
                      setMass(preset.mass);
                      setProbabilities("");
                    }
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateEntropy}
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
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold text-green-700 mb-2">Result:</h2>
              <p className="text-green-600">
                {type === "shannon"
                  ? `${formatNumber(result.shannon)} ${result.unit}`
                  : `${formatNumber(result.thermodynamic)} ${result.unit}`}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Calculation History</h3>
              <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index}>
                    {entry.type === "shannon"
                      ? `Shannon: ${formatNumber(entry.shannon)} ${entry.unit}`
                      : `Thermodynamic: ${formatNumber(entry.thermodynamic)} ${entry.unit}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> About
            </h3>
            <div className="text-sm text-blue-600 space-y-2">
              <p>Calculates different types of entropy:</p>
              <ul className="list-disc list-inside">
                <li>Shannon: H = -∑(p * logₙ(p)) in bits, nats, or ban</li>
                <li>Thermodynamic: S = Nk[ln(V/Nλ³) + 5/2] in J/K</li>
              </ul>
              <p>
                Thermodynamic calculation uses ideal gas assumptions. Default values assume hydrogen gas at STP unless adjusted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntropyCalculator;