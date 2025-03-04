'use client'
import React, { useState } from 'react';

const QuantumEnergyLevelCalculator = () => {
  const [system, setSystem] = useState('particleBox'); // particleBox, hydrogen, harmonic
  const [n, setN] = useState(1); // Quantum number
  const [L, setL] = useState(1); // Box length (nm) or other length scale
  const [m, setM] = useState(9.1093837e-31); // Mass (kg, default: electron)
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const hbar = 1.0545718e-34; // Reduced Planck constant (J·s)
  const e = 1.60217662e-19; // Elementary charge (C)
  const epsilon0 = 8.854187817e-12; // Vacuum permittivity (F/m)
  const nmToM = 1e-9; // nm to meters conversion

  const calculateEnergy = () => {
    setError('');
    setResult(null);

    const quantumN = parseInt(n);
    const mass = parseFloat(m);
    const length = parseFloat(L);

    if (isNaN(quantumN) || quantumN < 1) {
      setError('Quantum number must be a positive integer');
      return;
    }
    if (isNaN(mass) || mass <= 0) {
      setError('Mass must be a positive number');
      return;
    }
    if (isNaN(length) || length <= 0) {
      setError('Length parameter must be a positive number');
      return;
    }

    try {
      let energy;
      let description;

      switch (system) {
        case 'particleBox':
          // Particle in a 1D box: E = n²π²ℏ² / (2mL²)
          const Lm = length * nmToM;
          energy = (quantumN * quantumN * Math.PI * Math.PI * hbar * hbar) / (2 * mass * Lm * Lm);
          description = 'Particle in a 1D infinite potential well';
          break;

        case 'hydrogen':
          // Hydrogen atom: E = -13.6 eV / n² (simplified, in eV)
          energy = (-13.6 * e) / (quantumN * quantumN); // Convert eV to Joules
          description = 'Hydrogen atom (Bohr model approximation)';
          break;

        case 'harmonic':
          // Quantum harmonic oscillator: E = ℏω(n + 1/2), where ω = √(k/m)
          // Assume k = 1 N/m for simplicity, L as a scaling factor
          const omega = Math.sqrt(1 / mass); // Simplified spring constant
          energy = hbar * omega * (quantumN - 0.5); // n starts at 1
          description = 'Quantum harmonic oscillator (k = 1 N/m)';
          break;

        default:
          throw new Error('Unknown quantum system');
      }

      setResult({
        energy,
        system: description,
        n: quantumN,
        mass,
        length,
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 4) => {
    if (Math.abs(num) < 1e-6 || Math.abs(num) > 1e6) {
      return num.toExponential(digits);
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Quantum Energy Level Calculator
        </h1>

        <div className="space-y-6">
          {/* System Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantum System
            </label>
            <select
              value={system}
              onChange={(e) => {
                setSystem(e.target.value);
                setResult(null);
                if (e.target.value === 'hydrogen') {
                  setL(1); // Not used in hydrogen
                  setM(9.1093837e-31); // Electron mass
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="particleBox">Particle in a Box</option>
              <option value="hydrogen">Hydrogen Atom</option>
              <option value="harmonic">Harmonic Oscillator</option>
            </select>
          </div>

          {/* Quantum Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantum Number (n)
            </label>
            <input
              type="number"
              min="1"
              value={n}
              onChange={(e) => setN(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Length (for particleBox) */}
          {system === 'particleBox' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Box Length (nm)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={L}
                onChange={(e) => setL(Math.max(0.1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Mass */}
          {system !== 'hydrogen' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mass (kg)
              </label>
              <input
                type="number"
                step="1e-31"
                value={m}
                onChange={(e) => setM(Math.max(1e-35, parseFloat(e.target.value) || 9.1093837e-31))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Default: Electron mass (9.109e-31 kg)</p>
            </div>
          )}

          {/* Calculate Button */}
          <button
            onClick={calculateEnergy}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Energy
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Energy Level:</h2>
              <p>{formatNumber(result.energy)} J</p>
              <p>{formatNumber(result.energy / e)} eV</p>
              <p className="text-sm text-gray-600 mt-2">
                System: {result.system}<br />
                n: {result.n}<br />
                {system === 'particleBox' && `Box Length: ${formatNumber(result.length)} nm`}<br />
                {system !== 'hydrogen' && `Mass: ${formatNumber(result.mass)} kg`}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setSystem('particleBox');
                  setN(1);
                  setL(1);
                  setM(9.1093837e-31);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Electron in 1nm Box
              </button>
              <button
                onClick={() => {
                  setSystem('hydrogen');
                  setN(1);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Hydrogen Ground State
              </button>
              <button
                onClick={() => {
                  setSystem('harmonic');
                  setN(1);
                  setM(9.1093837e-31);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Harmonic Oscillator
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates quantum energy levels:</p>
                <ul className="list-disc list-inside">
                  <li>Particle in Box: E = n²π²ℏ² / (2mL²)</li>
                  <li>Hydrogen: E = -13.6 eV / n²</li>
                  <li>Harmonic: E = ℏω(n - 1/2), ω = √(k/m), k = 1 N/m</li>
                </ul>
                <p>Simplified models for educational purposes.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumEnergyLevelCalculator;