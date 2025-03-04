'use client'
import React, { useState } from 'react';

const MolarityCalculator = () => {
  const [calculateFor, setCalculateFor] = useState('molarity'); // molarity, moles, volume
  const [molarity, setMolarity] = useState('');
  const [moles, setMoles] = useState('');
  const [volume, setVolume] = useState('');
  const [unit, setUnit] = useState('L'); // L, mL
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculateMolarityValues = () => {
    setError('');
    setResult(null);

    // Convert volume to liters if in mL
    const volumeInLiters = unit === 'mL' ? parseFloat(volume) / 1000 : parseFloat(volume);

    // Validate inputs based on what we're calculating
    const inputs = {
      molarity: parseFloat(molarity),
      moles: parseFloat(moles),
      volume: volumeInLiters,
    };

    if (calculateFor === 'molarity') {
      if (!moles || !volume || isNaN(inputs.moles) || isNaN(inputs.volume)) {
        setError('Please enter valid moles and volume');
        return;
      }
      if (inputs.moles < 0 || inputs.volume <= 0) {
        setError('Moles must be non-negative, volume must be positive');
        return;
      }
    } else if (calculateFor === 'moles') {
      if (!molarity || !volume || isNaN(inputs.molarity) || isNaN(inputs.volume)) {
        setError('Please enter valid molarity and volume');
        return;
      }
      if (inputs.molarity < 0 || inputs.volume <= 0) {
        setError('Molarity must be non-negative, volume must be positive');
        return;
      }
    } else {
      if (!molarity || !moles || isNaN(inputs.molarity) || isNaN(inputs.moles)) {
        setError('Please enter valid molarity and moles');
        return;
      }
      if (inputs.molarity < 0 || inputs.moles < 0) {
        setError('Molarity and moles must be non-negative');
        return;
      }
    }

    try {
      let calculatedValue;
      let displayUnit = unit;

      switch (calculateFor) {
        case 'molarity':
          calculatedValue = inputs.moles / inputs.volume;
          setResult({
            molarity: calculatedValue,
            moles: inputs.moles,
            volume: inputs.volume,
            displayVolume: parseFloat(volume),
            unit: 'M',
          });
          break;

        case 'moles':
          calculatedValue = inputs.molarity * inputs.volume;
          setResult({
            molarity: inputs.molarity,
            moles: calculatedValue,
            volume: inputs.volume,
            displayVolume: parseFloat(volume),
            unit: 'mol',
          });
          break;

        case 'volume':
          calculatedValue = inputs.moles / inputs.molarity;
          displayUnit = unit; // Keep input unit for display
          setResult({
            molarity: inputs.molarity,
            moles: inputs.moles,
            volume: calculatedValue,
            displayVolume: unit === 'mL' ? calculatedValue * 1000 : calculatedValue,
            unit: displayUnit,
          });
          break;

        default:
          throw new Error('Invalid calculation type');
      }
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 3) => {
    if (num < 1e-6 || num > 1e6) {
      return num.toExponential(digits);
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  const resetInputs = () => {
    setMolarity('');
    setMoles('');
    setVolume('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Molarity Calculator
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
              <option value="molarity">Molarity (M)</option>
              <option value="moles">Moles (n)</option>
              <option value="volume">Volume (V)</option>
            </select>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            {calculateFor !== 'molarity' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Molarity (mol/L)
                </label>
                <input
                  type="number"
                  value={molarity}
                  onChange={(e) => setMolarity(e.target.value)}
                  placeholder="e.g., 0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {calculateFor !== 'moles' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moles (mol)
                </label>
                <input
                  type="number"
                  value={moles}
                  onChange={(e) => setMoles(e.target.value)}
                  placeholder="e.g., 0.05"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                    placeholder={`e.g., ${unit === 'L' ? '1' : '1000'}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={unit}
                    onChange={(e) => {
                      setUnit(e.target.value);
                      setVolume('');
                    }}
                    className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">L</option>
                    <option value="mL">mL</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateMolarityValues}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Molarity: {formatNumber(result.molarity)} M</p>
              <p>Moles: {formatNumber(result.moles)} mol</p>
              <p>Volume: {formatNumber(result.displayVolume)} {result.unit}</p>
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
                  setCalculateFor('molarity');
                  setMoles(0.1);
                  setVolume(1);
                  setUnit('L');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                0.1 M (1 L)
              </button>
              <button
                onClick={() => {
                  setCalculateFor('moles');
                  setMolarity(0.5);
                  setVolume(500);
                  setUnit('mL');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                0.5 M (500 mL)
              </button>
              <button
                onClick={() => {
                  setCalculateFor('volume');
                  setMolarity(0.2);
                  setMoles(0.05);
                  setUnit('L');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                0.2 M (0.05 mol)
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates molarity using:</p>
                <p>M = n / V</p>
                <ul className="list-disc list-inside">
                  <li>M = Molarity (mol/L)</li>
                  <li>n = Moles of solute (mol)</li>
                  <li>V = Volume of solution (L or mL)</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MolarityCalculator;