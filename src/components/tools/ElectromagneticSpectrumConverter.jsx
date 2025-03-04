'use client'
import React, { useState } from 'react';

const ElectromagneticSpectrumConverter = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState('wavelength'); // wavelength, frequency, energy
  const [unit, setUnit] = useState('m'); // Varies by input type
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const c = 299792458; // Speed of light (m/s)
  const h = 6.62607015e-34; // Planck constant (J·s)
  const eV = 1.60217662e-19; // Joules per eV

  // Unit conversion factors
  const wavelengthUnits = {
    m: 1,
    nm: 1e-9,
    μm: 1e-6,
    mm: 1e-3,
    cm: 1e-2,
    km: 1e3,
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

  // EM Spectrum ranges (wavelength in meters)
  const spectrumRanges = [
    { name: 'Radio', min: 1e-3, max: Infinity, color: '#FF9999' },
    { name: 'Microwave', min: 1e-6, max: 1e-3, color: '#FFCC99' },
    { name: 'Infrared', min: 7e-7, max: 1e-6, color: '#FFFF99' },
    { name: 'Visible', min: 4e-7, max: 7e-7, color: '#CCFF99' },
    { name: 'Ultraviolet', min: 1e-8, max: 4e-7, color: '#99CCFF' },
    { name: 'X-ray', min: 1e-11, max: 1e-8, color: '#CC99FF' },
    { name: 'Gamma Ray', min: 0, max: 1e-11, color: '#FF99FF' },
  ];

  const convertEMProperties = () => {
    setError('');
    setResult(null);

    if (!inputValue || isNaN(inputValue) || inputValue <= 0) {
      setError('Please enter a valid positive value');
      return;
    }

    const value = parseFloat(inputValue);
    let wavelength, frequency, energy;

    try {
      if (inputType === 'wavelength') {
        wavelength = value * wavelengthUnits[unit];
        frequency = c / wavelength;
        energy = h * frequency;
      } else if (inputType === 'frequency') {
        frequency = value * frequencyUnits[unit];
        wavelength = c / frequency;
        energy = h * frequency;
      } else {
        energy = value * energyUnits[unit];
        frequency = energy / h;
        wavelength = c / frequency;
      }

      const spectrumRegion = spectrumRanges.find(
        range => wavelength > range.min && wavelength <= range.max
      );

      setResult({
        wavelength,
        frequency,
        energy,
        region: spectrumRegion || { name: 'Beyond Known Spectrum', color: '#CCCCCC' },
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
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Electromagnetic Spectrum Converter
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
                setUnit(Object.keys(
                  e.target.value === 'wavelength' ? wavelengthUnits :
                  e.target.value === 'frequency' ? frequencyUnits :
                  energyUnits
                )[0]);
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="wavelength">Wavelength</option>
              <option value="frequency">Frequency</option>
              <option value="energy">Energy</option>
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
                {Object.keys(
                  inputType === 'wavelength' ? wavelengthUnits :
                  inputType === 'frequency' ? frequencyUnits :
                  energyUnits
                ).map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Convert Button */}
          <button
            onClick={convertEMProperties}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Convert
          </button>

          {/* Results */}
          {result && (
            <div
              className="p-4 rounded-md"
              style={{ backgroundColor: result.region.color }}
            >
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Wavelength: {formatNumber(result.wavelength)} m ({formatNumber(result.wavelength / wavelengthUnits.nm)} nm)</p>
              <p>Frequency: {formatNumber(result.frequency)} Hz ({formatNumber(result.frequency / frequencyUnits.GHz)} GHz)</p>
              <p>Energy: {formatNumber(result.energy)} J ({formatNumber(result.energy / energyUnits.eV)} eV)</p>
              <p>Spectrum Region: {result.region.name}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Spectrum Visualizer */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">EM Spectrum</h3>
            <div className="flex h-6 rounded overflow-hidden">
              {spectrumRanges.map(range => (
                <div
                  key={range.name}
                  style={{ backgroundColor: range.color, flex: 1 }}
                  title={range.name}
                  className="transition-all duration-300 hover:flex-[1.5]"
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Gamma</span>
              <span>Visible</span>
              <span>Radio</span>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Converts between electromagnetic wave properties:</p>
                <ul className="list-disc list-inside">
                  <li>c = λf (speed of light = wavelength × frequency)</li>
                  <li>E = hf (energy = Planck constant × frequency)</li>
                </ul>
                <p>Identifies position in the EM spectrum.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectromagneticSpectrumConverter;