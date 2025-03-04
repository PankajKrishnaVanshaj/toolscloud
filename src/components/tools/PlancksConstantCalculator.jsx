'use client'
import React, { useState } from 'react';

const PlancksConstantCalculator = () => {
  const [calculationType, setCalculationType] = useState('energy'); // energy, frequency, wavelength
  const [inputValue, setInputValue] = useState('');
  const [unit, setUnit] = useState('Hz'); // Default unit based on frequency
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const h = 6.62607015e-34; // Planck's constant (J·s)
  const c = 299792458; // Speed of light (m/s)
  const eV = 1.60217662e-19; // Joules per eV

  // Unit conversion factors
  const frequencyUnits = {
    Hz: 1,
    kHz: 1e3,
    MHz: 1e6,
    GHz: 1e9,
    THz: 1e12,
  };

  const wavelengthUnits = {
    m: 1,
    nm: 1e-9,
    μm: 1e-6,
    mm: 1e-3,
    cm: 1e-2,
  };

  const energyUnits = {
    J: 1,
    eV: eV,
    keV: eV * 1e3,
    MeV: eV * 1e6,
  };

  const calculateWithPlanck = () => {
    setError('');
    setResult(null);

    if (!inputValue || isNaN(inputValue) || inputValue <= 0) {
      setError('Please enter a valid positive value');
      return;
    }

    const value = parseFloat(inputValue);
    let energy, frequency, wavelength;

    try {
      switch (calculationType) {
        case 'energy':
          frequency = value * frequencyUnits[unit];
          energy = h * frequency;
          wavelength = c / frequency;
          break;
        case 'frequency':
          energy = value * energyUnits[unit];
          frequency = energy / h;
          wavelength = c / frequency;
          break;
        case 'wavelength':
          wavelength = value * wavelengthUnits[unit];
          frequency = c / wavelength;
          energy = h * frequency;
          break;
        default:
          throw new Error('Invalid calculation type');
      }

      setResult({
        energy,
        frequency,
        wavelength,
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 4) => {
    if (num < 1e-6 || num > 1e6) {
      return num.toExponential(digits);
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Planck's Constant Calculator
        </h1>

        <div className="space-y-6">
          {/* Calculation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculate From
            </label>
            <select
              value={calculationType}
              onChange={(e) => {
                setCalculationType(e.target.value);
                setInputValue('');
                setUnit(
                  e.target.value === 'energy' ? 'Hz' :
                  e.target.value === 'frequency' ? 'J' :
                  'm'
                );
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="energy">Frequency → Energy</option>
              <option value="frequency">Energy → Frequency</option>
              <option value="wavelength">Wavelength → Energy</option>
            </select>
          </div>

          {/* Input Value and Unit */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Value
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(
                  calculationType === 'energy' ? frequencyUnits :
                  calculationType === 'frequency' ? energyUnits :
                  wavelengthUnits
                ).map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateWithPlanck}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Energy: {formatNumber(result.energy)} J ({formatNumber(result.energy / eV)} eV)</p>
              <p>Frequency: {formatNumber(result.frequency)} Hz ({formatNumber(result.frequency / 1e12)} THz)</p>
              <p>Wavelength: {formatNumber(result.wavelength)} m ({formatNumber(result.wavelength / 1e-9)} nm)</p>
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
                  setCalculationType('energy');
                  setInputValue(5e14);
                  setUnit('Hz');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Visible Light (500 THz)
              </button>
              <button
                onClick={() => {
                  setCalculationType('wavelength');
                  setInputValue(550);
                  setUnit('nm');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Green Light (550 nm)
              </button>
              <button
                onClick={() => {
                  setCalculationType('frequency');
                  setInputValue(2);
                  setUnit('eV');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                UV Photon (2 eV)
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Uses Planck's constant (h = 6.62607015 × 10⁻³⁴ J·s) to relate photon properties:</p>
                <ul className="list-disc list-inside">
                  <li>E = hν (Energy = Planck's constant × frequency)</li>
                  <li>ν = c/λ (Frequency = speed of light / wavelength)</li>
                </ul>
                <p>Useful for quantum mechanics and photon energy calculations.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlancksConstantCalculator;