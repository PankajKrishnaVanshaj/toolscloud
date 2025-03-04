'use client'
import React, { useState } from 'react';

const PhotonEnergyCalculator = () => {
  const [inputType, setInputType] = useState('wavelength'); // wavelength, frequency
  const [inputValue, setInputValue] = useState('');
  const [unit, setUnit] = useState('nm'); // Varies by input type
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const h = 6.62607015e-34; // Planck constant (J·s)
  const c = 299792458; // Speed of light (m/s)
  const eV = 1.60217662e-19; // Joules per eV

  // Unit conversion factors
  const wavelengthUnits = {
    m: 1,
    nm: 1e-9,
    μm: 1e-6,
    mm: 1e-3,
    cm: 1e-2,
  };

  const frequencyUnits = {
    Hz: 1,
    kHz: 1e3,
    MHz: 1e6,
    GHz: 1e9,
    THz: 1e12,
  };

  const energyUnits = {
    J: 1,
    eV: eV,
    keV: eV * 1e3,
    MeV: eV * 1e6,
  };

  const calculatePhotonEnergy = () => {
    setError('');
    setResult(null);

    if (!inputValue || isNaN(inputValue) || inputValue <= 0) {
      setError('Please enter a valid positive value');
      return;
    }

    const value = parseFloat(inputValue);
    let energy, frequency, wavelength;

    try {
      if (inputType === 'wavelength') {
        wavelength = value * wavelengthUnits[unit];
        frequency = c / wavelength;
        energy = h * frequency;
      } else {
        frequency = value * frequencyUnits[unit];
        energy = h * frequency;
        wavelength = c / frequency;
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
          Photon Energy Calculator
        </h1>

        <div className="space-y-6">
          {/* Input Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Type
            </label>
            <select
              value={inputType}
              onChange={(e) => {
                setInputType(e.target.value);
                setInputValue('');
                setUnit(e.target.value === 'wavelength' ? 'nm' : 'Hz');
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="wavelength">Wavelength</option>
              <option value="frequency">Frequency</option>
            </select>
          </div>

          {/* Input Value and Unit */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
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
                {Object.keys(inputType === 'wavelength' ? wavelengthUnits : frequencyUnits).map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculatePhotonEnergy}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Photon Properties:</h2>
              <p>Energy: {formatNumber(result.energy)} J ({formatNumber(result.energy / energyUnits.eV)} eV)</p>
              <p>Frequency: {formatNumber(result.frequency)} Hz ({formatNumber(result.frequency / frequencyUnits.THz)} THz)</p>
              <p>Wavelength: {formatNumber(result.wavelength)} m ({formatNumber(result.wavelength / wavelengthUnits.nm)} nm)</p>
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
                  setInputType('wavelength');
                  setUnit('nm');
                  setInputValue(650);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Red Light (650 nm)
              </button>
              <button
                onClick={() => {
                  setInputType('wavelength');
                  setUnit('nm');
                  setInputValue(450);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Blue Light (450 nm)
              </button>
              <button
                onClick={() => {
                  setInputType('frequency');
                  setUnit('THz');
                  setInputValue(2.45);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Microwave (2.45 THz)
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates photon energy using:</p>
                <ul className="list-disc list-inside">
                  <li>E = hf (Energy = Planck constant × frequency)</li>
                  <li>c = λf (Speed of light = wavelength × frequency)</li>
                </ul>
                <p>Constants: h = 6.62607015 × 10⁻³⁴ J·s, c = 299,792,458 m/s</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotonEnergyCalculator;