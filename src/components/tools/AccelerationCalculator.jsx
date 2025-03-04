'use client'
import React, { useState } from 'react';

const AccelerationCalculator = () => {
  const [mode, setMode] = useState('velocity'); // velocity, force, distance
  const [inputs, setInputs] = useState({
    initialVelocity: '', // m/s
    finalVelocity: '',   // m/s
    time: '',            // s
    force: '',           // N
    mass: '',            // kg
    distance: '',        // m
  });
  const [unit, setUnit] = useState('m/s²'); // m/s², ft/s², g
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Conversion factors
  const g = 9.80665; // Standard gravity (m/s²)
  const mToFt = 3.28084; // Meters to feet

  const calculateAcceleration = () => {
    setError('');
    setResult(null);

    const values = Object.fromEntries(
      Object.entries(inputs).map(([key, value]) => [key, parseFloat(value) || 0])
    );

    let acceleration;

    try {
      switch (mode) {
        case 'velocity':
          if (!values.time || values.time <= 0) {
            setError('Time must be positive');
            return;
          }
          acceleration = (values.finalVelocity - values.initialVelocity) / values.time;
          break;
        case 'force':
          if (!values.mass || values.mass <= 0) {
            setError('Mass must be positive');
            return;
          }
          acceleration = values.force / values.mass;
          break;
        case 'distance':
          if (!values.time || values.time <= 0) {
            setError('Time must be positive');
            return;
          }
          // Using v = at (assuming initial velocity = 0) and s = ½at²
          acceleration = (2 * values.distance) / (values.time * values.time);
          break;
        default:
          throw new Error('Invalid mode');
      }

      // Convert to selected unit
      let convertedAcceleration;
      switch (unit) {
        case 'm/s²':
          convertedAcceleration = acceleration;
          break;
        case 'ft/s²':
          convertedAcceleration = acceleration * mToFt;
          break;
        case 'g':
          convertedAcceleration = acceleration / g;
          break;
        default:
          throw new Error('Invalid unit');
      }

      setResult({
        acceleration,
        convertedAcceleration,
        unit,
        method: mode,
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const resetInputs = () => {
    setInputs({
      initialVelocity: '',
      finalVelocity: '',
      time: '',
      force: '',
      mass: '',
      distance: '',
    });
    setResult(null);
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Acceleration Calculator
        </h1>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculation Mode
            </label>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                resetInputs();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="velocity">Δv / t (Velocity Change)</option>
              <option value="force">F / m (Force and Mass)</option>
              <option value="distance">s / t² (Distance and Time)</option>
            </select>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            {mode === 'velocity' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Velocity (m/s)
                  </label>
                  <input
                    type="number"
                    value={inputs.initialVelocity}
                    onChange={(e) => handleInputChange('initialVelocity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Final Velocity (m/s)
                  </label>
                  <input
                    type="number"
                    value={inputs.finalVelocity}
                    onChange={(e) => handleInputChange('finalVelocity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time (s)
                  </label>
                  <input
                    type="number"
                    value={inputs.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            {mode === 'force' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Force (N)
                  </label>
                  <input
                    type="number"
                    value={inputs.force}
                    onChange={(e) => handleInputChange('force', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mass (kg)
                  </label>
                  <input
                    type="number"
                    value={inputs.mass}
                    onChange={(e) => handleInputChange('mass', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            {mode === 'distance' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (m)
                  </label>
                  <input
                    type="number"
                    value={inputs.distance}
                    onChange={(e) => handleInputChange('distance', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time (s)
                  </label>
                  <input
                    type="number"
                    value={inputs.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="m/s²">m/s²</option>
              <option value="ft/s²">ft/s²</option>
              <option value="g">g (9.80665 m/s²)</option>
            </select>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateAcceleration}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Acceleration:</h2>
              <p>{formatNumber(result.convertedAcceleration)} {unit}</p>
              {unit !== 'm/s²' && (
                <p>{formatNumber(result.acceleration)} m/s²</p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                Method: {result.method === 'velocity' ? 'Δv/t' : result.method === 'force' ? 'F/m' : '2s/t²'}
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
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMode('velocity');
                  setInputs({ initialVelocity: '0', finalVelocity: '10', time: '2', force: '', mass: '', distance: '' });
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Car (0-10 m/s in 2s)
              </button>
              <button
                onClick={() => {
                  setMode('force');
                  setInputs({ initialVelocity: '', finalVelocity: '', time: '', force: '100', mass: '2', distance: '' });
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Push (100N, 2kg)
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates acceleration using different methods:</p>
                <ul className="list-disc list-inside">
                  <li>Δv/t: a = (v_f - v_i) / t</li>
                  <li>F/m: a = F / m (Newton's 2nd Law)</li>
                  <li>2s/t²: a = 2s / t² (assuming v_i = 0)</li>
                </ul>
                <p>Supports unit conversions to ft/s² and g.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccelerationCalculator;