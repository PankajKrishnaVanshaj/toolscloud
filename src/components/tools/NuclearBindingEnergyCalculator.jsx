'use client'
import React, { useState } from 'react';

const NuclearBindingEnergyCalculator = () => {
  const [Z, setZ] = useState(''); // Number of protons
  const [N, setN] = useState(''); // Number of neutrons
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants for semi-empirical mass formula (in MeV)
  const aV = 15.67; // Volume term
  const aS = 17.23; // Surface term
  const aC = 0.72;  // Coulomb term
  const aA = 23.2;  // Asymmetry term
  const aP = 34;    // Pairing term
  const MeVToJ = 1.60217662e-13; // MeV to Joules conversion

  // Preset examples (common isotopes)
  const presets = [
    { name: 'Helium-4', Z: 2, N: 2 },
    { name: 'Carbon-12', Z: 6, N: 6 },
    { name: 'Iron-56', Z: 26, N: 30 },
    { name: 'Uranium-238', Z: 92, N: 146 },
  ];

  const calculateBindingEnergy = () => {
    setError('');
    setResult(null);

    const protons = parseInt(Z);
    const neutrons = parseInt(N);
    const A = protons + neutrons; // Mass number

    if (isNaN(protons) || isNaN(neutrons) || protons <= 0 || neutrons < 0) {
      setError('Please enter valid positive numbers for protons and neutrons');
      return;
    }

    try {
      // Semi-empirical mass formula terms
      const volumeTerm = aV * A;
      const surfaceTerm = -aS * Math.pow(A, 2/3);
      const coulombTerm = -aC * protons * (protons - 1) / Math.pow(A, 1/3);
      const asymmetryTerm = -aA * Math.pow(protons - neutrons, 2) / A;

      // Pairing term
      let pairingTerm = 0;
      if (protons % 2 === 0 && neutrons % 2 === 0) {
        pairingTerm = aP / Math.pow(A, 1/2); // Even-even
      } else if (protons % 2 === 1 && neutrons % 2 === 1) {
        pairingTerm = -aP / Math.pow(A, 1/2); // Odd-odd
      }

      // Total binding energy
      const bindingEnergy = volumeTerm + surfaceTerm + coulombTerm + asymmetryTerm + pairingTerm;
      
      // Binding energy per nucleon
      const bindingEnergyPerNucleon = bindingEnergy / A;

      // Mass defect (Δm = B/c²)
      const massDefect = (bindingEnergy * MeVToJ) / (299792458 * 299792458);

      setResult({
        bindingEnergy,
        bindingEnergyPerNucleon,
        massDefect,
        A,
        Z: protons,
        N: neutrons
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 3) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  const getStabilityInfo = (bindingPerNucleon) => {
    if (bindingPerNucleon > 8.5) return 'Very stable (iron-peak region)';
    if (bindingPerNucleon > 7) return 'Stable';
    return 'Less stable';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Nuclear Binding Energy Calculator
        </h1>

        <div className="space-y-6">
          {/* Inputs */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Protons (Z)
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
                Number of Neutrons (N)
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

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex gap-2 flex-wrap">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setZ(preset.Z.toString());
                    setN(preset.N.toString());
                  }}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateBindingEnergy}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md space-y-2">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Binding Energy: {formatNumber(result.bindingEnergy)} MeV</p>
              <p>Binding Energy per Nucleon: {formatNumber(result.bindingEnergyPerNucleon)} MeV</p>
              <p>Mass Defect: {formatNumber(result.massDefect * 1e27)} × 10⁻²⁷ kg</p>
              <p>Mass Number (A): {result.A}</p>
              <p>Stability: {getStabilityInfo(result.bindingEnergyPerNucleon)}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates nuclear binding energy using the semi-empirical mass formula:</p>
                <p>B = aᵥA - aₛA²ᐟ³ - a꜀Z(Z-1)A⁻¹ᐟ³ - aₐ(N-Z)²/A ± δ</p>
                <ul className="list-disc list-inside">
                  <li>aᵥ = Volume term (15.67 MeV)</li>
                  <li>aₛ = Surface term (17.23 MeV)</li>
                  <li>a꜀ = Coulomb term (0.72 MeV)</li>
                  <li>aₐ = Asymmetry term (23.2 MeV)</li>
                  <li>δ = Pairing term (±34/A¹ᐟ² MeV)</li>
                </ul>
                <p>Results approximate real nuclear binding energies.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuclearBindingEnergyCalculator;