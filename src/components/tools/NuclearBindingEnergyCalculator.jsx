"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const NuclearBindingEnergyCalculator = () => {
  const [Z, setZ] = useState(""); // Number of protons
  const [N, setN] = useState(""); // Number of neutrons
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("MeV"); // Energy unit selector
  const [history, setHistory] = useState([]); // Calculation history

  // Constants for semi-empirical mass formula (in MeV)
  const aV = 15.67; // Volume term
  const aS = 17.23; // Surface term
  const aC = 0.72; // Coulomb term
  const aA = 23.2; // Asymmetry term
  const aP = 34; // Pairing term
  const MeVToJ = 1.60217662e-13; // MeV to Joules conversion

  // Preset examples (common isotopes)
  const presets = [
    { name: "Helium-4", Z: 2, N: 2 },
    { name: "Carbon-12", Z: 6, N: 6 },
    { name: "Iron-56", Z: 26, N: 30 },
    { name: "Uranium-238", Z: 92, N: 146 },
  ];

  const calculateBindingEnergy = useCallback(() => {
    setError("");
    setResult(null);

    const protons = parseInt(Z);
    const neutrons = parseInt(N);
    const A = protons + neutrons; // Mass number

    if (isNaN(protons) || isNaN(neutrons) || protons <= 0 || neutrons < 0) {
      setError("Please enter valid positive numbers for protons and neutrons");
      return;
    }

    try {
      // Semi-empirical mass formula terms
      const volumeTerm = aV * A;
      const surfaceTerm = -aS * Math.pow(A, 2 / 3);
      const coulombTerm = -aC * protons * (protons - 1) / Math.pow(A, 1 / 3);
      const asymmetryTerm = -aA * Math.pow(protons - neutrons, 2) / A;

      // Pairing term
      let pairingTerm = 0;
      if (protons % 2 === 0 && neutrons % 2 === 0) {
        pairingTerm = aP / Math.pow(A, 1 / 2); // Even-even
      } else if (protons % 2 === 1 && neutrons % 2 === 1) {
        pairingTerm = -aP / Math.pow(A, 1 / 2); // Odd-odd
      }

      // Total binding energy in MeV
      const bindingEnergyMeV = volumeTerm + surfaceTerm + coulombTerm + asymmetryTerm + pairingTerm;
      const bindingEnergy = unit === "MeV" ? bindingEnergyMeV : bindingEnergyMeV * MeVToJ;
      const bindingEnergyPerNucleonMeV = bindingEnergyMeV / A;
      const bindingEnergyPerNucleon =
        unit === "MeV" ? bindingEnergyPerNucleonMeV : bindingEnergyPerNucleonMeV * MeVToJ;

      // Mass defect (Δm = B/c²)
      const massDefect = (bindingEnergyMeV * MeVToJ) / (299792458 * 299792458);

      const newResult = {
        bindingEnergy,
        bindingEnergyPerNucleon,
        massDefect,
        A,
        Z: protons,
        N: neutrons,
      };

      setResult(newResult);
      setHistory((prev) => [...prev, { ...newResult, timestamp: new Date().toLocaleString() }].slice(-5)); // Keep last 5
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [Z, N, unit]);

  const formatNumber = (num, digits = 3) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  const getStabilityInfo = (bindingPerNucleonMeV) => {
    if (bindingPerNucleonMeV > 8.5) return "Very stable (iron-peak region)";
    if (bindingPerNucleonMeV > 7) return "Stable";
    return "Less stable";
  };

  const reset = () => {
    setZ("");
    setN("");
    setResult(null);
    setError("");
    setUnit("MeV");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Nuclear Binding Energy Calculator
        </h1>

        <div className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Protons (Z)
              </label>
              <input
                type="number"
                min="1"
                value={Z}
                onChange={(e) => setZ(e.target.value)}
                placeholder="e.g., 26"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Neutrons (N)
              </label>
              <input
                type="number"
                min="0"
                value={N}
                onChange={(e) => setN(e.target.value)}
                placeholder="e.g., 30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Unit Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Energy Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="MeV">MeV</option>
              <option value="J">Joules</option>
            </select>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Presets</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setZ(preset.Z.toString());
                    setN(preset.N.toString());
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
              onClick={calculateBindingEnergy}
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
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h2 className="text-lg font-semibold text-gray-800">Results:</h2>
              <p>
                Binding Energy: {formatNumber(result.bindingEnergy)}{" "}
                {unit === "MeV" ? "MeV" : "J"}
              </p>
              <p>
                Binding Energy per Nucleon:{" "}
                {formatNumber(result.bindingEnergyPerNucleon)}{" "}
                {unit === "MeV" ? "MeV" : "J"}
              </p>
              <p>Mass Defect: {formatNumber(result.massDefect * 1e27)} × 10⁻²⁷ kg</p>
              <p>Mass Number (A): {result.A}</p>
              <p>
                Stability:{" "}
                {getStabilityInfo(unit === "MeV" ? result.bindingEnergyPerNucleon : result.bindingEnergyPerNucleon / MeVToJ)}
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
                {history.slice().reverse().map((entry, index) => (
                  <li key={index}>
                    {entry.timestamp}: Z={entry.Z}, N={entry.N}, B={formatNumber(entry.bindingEnergy)} {unit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium flex items-center gap-2">
                <FaInfoCircle /> About the Calculation
              </summary>
              <div className="mt-2 space-y-2">
                <p>Uses the semi-empirical mass formula:</p>
                <p>B = aᵥA - aₛA²ᐟ³ - a꜀Z(Z-1)A⁻¹ᐟ³ - aₐ(N-Z)²/A ± δ</p>
                <ul className="list-disc list-inside">
                  <li>aᵥ = Volume term (15.67 MeV)</li>
                  <li>aₛ = Surface term (17.23 MeV)</li>
                  <li>a꜀ = Coulomb term (0.72 MeV)</li>
                  <li>aₐ = Asymmetry term (23.2 MeV)</li>
                  <li>δ = Pairing term (±34/A¹ᐟ² MeV)</li>
                </ul>
                <p>Results are approximations based on nuclear physics models.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuclearBindingEnergyCalculator;