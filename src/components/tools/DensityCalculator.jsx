'use client';
import React, { useState } from 'react';

const DensityCalculator = () => {
  const [calculateFor, setCalculateFor] = useState('density'); // density, mass, volume
  const [density, setDensity] = useState('');
  const [densityUnit, setDensityUnit] = useState('kg/m³');
  const [mass, setMass] = useState('');
  const [massUnit, setMassUnit] = useState('kg');
  const [volume, setVolume] = useState('');
  const [volumeUnit, setVolumeUnit] = useState('m³');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Unit conversion factors (to base units: kg, m³)
  const densityUnits = {
    'kg/m³': 1,
    'g/cm³': 1000,
    'kg/L': 1000,
  };

  const massUnits = {
    'kg': 1,
    'g': 0.001,
    'mg': 0.000001,
  };

  const volumeUnits = {
    'm³': 1,
    'L': 0.001,
    'mL': 0.000001,
    'cm³': 0.000001,
  };

  const calculateDensityValues = () => {
    setError('');
    setResult(null);

    // Convert inputs to base units (kg, m³)
    const rho = density ? parseFloat(density) * densityUnits[densityUnit] : null;
    const m = mass ? parseFloat(mass) * massUnits[massUnit] : null;
    const V = volume ? parseFloat(volume) * volumeUnits[volumeUnit] : null;

    // Validation
    const inputs = { rho, m, V };
    const required = calculateFor === 'density' ? ['m', 'V'] :
                    calculateFor === 'mass' ? ['rho', 'V'] :
                    ['rho', 'm'];

    for (let key of required) {
      if (inputs[key] === null || isNaN(inputs[key])) {
        setError(`Please enter a valid ${key === 'rho' ? 'density' : key === 'm' ? 'mass' : 'volume'}`);
        return;
      }
      if (inputs[key] <= 0) {
        setError(`${key === 'rho' ? 'Density' : key === 'm' ? 'Mass' : 'Volume'} must be positive`);
        return;
      }
    }

    try {
      let calculatedValue;
      let displayUnit;

      switch (calculateFor) {
        case 'density':
          calculatedValue = m / V;
          displayUnit = densityUnit;
          calculatedValue /= densityUnits[densityUnit]; // Convert to chosen unit
          setResult({
            density: calculatedValue,
            mass: parseFloat(mass),
            volume: parseFloat(volume),
            units: { density: densityUnit, mass: massUnit, volume: volumeUnit },
          });
          break;

        case 'mass':
          calculatedValue = rho * V;
          displayUnit = massUnit;
          calculatedValue /= massUnits[massUnit]; // Convert to chosen unit
          setResult({
            density: parseFloat(density),
            mass: calculatedValue,
            volume: parseFloat(volume),
            units: { density: densityUnit, mass: massUnit, volume: volumeUnit },
          });
          break;

        case 'volume':
          calculatedValue = m / rho;
          displayUnit = volumeUnit;
          calculatedValue /= volumeUnits[volumeUnit]; // Convert to chosen unit
          setResult({
            density: parseFloat(density),
            mass: parseFloat(mass),
            volume: calculatedValue,
            units: { density: densityUnit, mass: massUnit, volume: volumeUnit },
          });
          break;

        default:
          throw new Error('Invalid calculation type');
      }
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 2) => {
    if (num < 1e-6 || num > 1e6) {
      return num.toExponential(digits);
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  const resetInputs = () => {
    setDensity('');
    setMass('');
    setVolume('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Density Calculator
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="density">Density (ρ)</option>
              <option value="mass">Mass (m)</option>
              <option value="volume">Volume (V)</option>
            </select>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            {calculateFor !== 'density' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Density
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    placeholder="e.g., 1000"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={densityUnit}
                    onChange={(e) => setDensityUnit(e.target.value)}
                    className="w-28 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="kg/m³">kg/m³</option>
                    <option value="g/cm³">g/cm³</option>
                    <option value="kg/L">kg/L</option>
                  </select>
                </div>
              </div>
            )}
            {calculateFor !== 'mass' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mass
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={mass}
                    onChange={(e) => setMass(e.target.value)}
                    placeholder="e.g., 1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={massUnit}
                    onChange={(e) => setMassUnit(e.target.value)}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="mg">mg</option>
                  </select>
                </div>
              </div>
            )}
            {calculateFor !== 'volume' && (
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={volumeUnit}
                    onChange={(e) => setVolumeUnit(e.target.value)}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="m³">m³</option>
                    <option value="L">L</option>
                    <option value="mL">mL</option>
                    <option value="cm³">cm³</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateDensityValues}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Density: {formatNumber(result.density)} {result.units.density}</p>
              <p>Mass: {formatNumber(result.mass)} {result.units.mass}</p>
              <p>Volume: {formatNumber(result.volume)} {result.units.volume}</p>
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
                  setCalculateFor('density');
                  setMass(1);
                  setMassUnit('kg');
                  setVolume(1);
                  setVolumeUnit('L');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Water (1 kg, 1 L)
              </button>
              <button
                onClick={() => {
                  setCalculateFor('mass');
                  setDensity(2700);
                  setDensityUnit('kg/m³');
                  setVolume(0.001);
                  setVolumeUnit('m³');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Aluminum (1 L)
              </button>
              <button
                onClick={() => {
                  setCalculateFor('volume');
                  setDensity(11.34);
                  setDensityUnit('g/cm³');
                  setMass(113.4);
                  setMassUnit('g');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Lead (113.4 g)
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Uses the density formula: ρ = m / V</p>
                <ul className="list-disc list-inside">
                  <li>ρ = Density</li>
                  <li>m = Mass</li>
                  <li>V = Volume</li>
                </ul>
                <p>Supports multiple units with automatic conversion.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DensityCalculator;