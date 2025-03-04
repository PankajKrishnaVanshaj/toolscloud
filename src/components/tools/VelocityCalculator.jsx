'use client'
import React, { useState } from 'react';

const VelocityCalculator = () => {
  const [mode, setMode] = useState('distance-time'); // distance-time or accel-time
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [initialVelocity, setInitialVelocity] = useState('');
  const [acceleration, setAcceleration] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('m');
  const [timeUnit, setTimeUnit] = useState('s');
  const [velocityUnit, setVelocityUnit] = useState('m/s');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Unit conversion factors to base units (m, s, m/s)
  const distanceUnits = {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    mi: 1609.34,
  };

  const timeUnits = {
    s: 1,
    min: 60,
    h: 3600,
    ms: 0.001,
  };

  const velocityUnits = {
    'm/s': 1,
    'km/h': 0.277778,
    'mph': 0.44704,
    'cm/s': 0.01,
  };

  const calculateVelocity = () => {
    setError('');
    setResult(null);

    try {
      if (mode === 'distance-time') {
        if (!distance || !time || isNaN(distance) || isNaN(time)) {
          setError('Please enter valid distance and time');
          return;
        }

        const d = parseFloat(distance) * distanceUnits[distanceUnit];
        const t = parseFloat(time) * timeUnits[timeUnit];

        if (t <= 0) {
          setError('Time must be positive');
          return;
        }

        const velocity = d / t; // m/s
        setResult({
          velocity,
          mode: 'Distance / Time',
          inputs: { distance: d, time: t },
        });
      } else {
        if (!initialVelocity || !acceleration || !time || 
            isNaN(initialVelocity) || isNaN(acceleration) || isNaN(time)) {
          setError('Please enter valid initial velocity, acceleration, and time');
          return;
        }

        const v0 = parseFloat(initialVelocity) * velocityUnits[velocityUnit];
        const a = parseFloat(acceleration) * velocityUnits[velocityUnit] / timeUnits.s; // Convert to m/s²
        const t = parseFloat(time) * timeUnits[timeUnit];

        if (t < 0) {
          setError('Time must be non-negative');
          return;
        }

        const velocity = v0 + a * t; // v = v₀ + at (m/s)
        setResult({
          velocity,
          mode: 'v₀ + at',
          inputs: { initialVelocity: v0, acceleration: a, time: t },
        });
      }
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  const convertVelocity = (velocity, unit) => {
    return velocity / velocityUnits[unit];
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Velocity Calculator
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
                setDistance('');
                setTime('');
                setInitialVelocity('');
                setAcceleration('');
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="distance-time">Distance / Time</option>
              <option value="accel-time">Initial Velocity + Acceleration × Time</option>
            </select>
          </div>

          {/* Inputs */}
          {mode === 'distance-time' ? (
            <>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance
                  </label>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={distanceUnit}
                    onChange={(e) => setDistanceUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(distanceUnits).map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="number"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(timeUnits).map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Velocity
                  </label>
                  <input
                    type="number"
                    value={initialVelocity}
                    onChange={(e) => setInitialVelocity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={velocityUnit}
                    onChange={(e) => setVelocityUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(velocityUnits).map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acceleration
                  </label>
                  <input
                    type="number"
                    value={acceleration}
                    onChange={(e) => setAcceleration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={velocityUnit}
                    onChange={(e) => setVelocityUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(velocityUnits).map(unit => (
                      <option key={unit} value={unit}>{unit}/s</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="number"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(timeUnits).map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Calculate Button */}
          <button
            onClick={calculateVelocity}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Velocity
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Velocity:</h2>
              <p>{formatNumber(result.velocity)} m/s</p>
              <p>{formatNumber(convertVelocity(result.velocity, 'km/h'))} km/h</p>
              <p>{formatNumber(convertVelocity(result.velocity, 'mph'))} mph</p>
              <p className="text-sm text-gray-600 mt-2">
                Calculated using: {result.mode}
              </p>
              {mode === 'distance-time' ? (
                <p className="text-sm text-gray-600">
                  Distance: {formatNumber(result.inputs.distance)} m | Time: {formatNumber(result.inputs.time)} s
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  v₀: {formatNumber(result.inputs.initialVelocity)} m/s | a: {formatNumber(result.inputs.acceleration)} m/s² | t: {formatNumber(result.inputs.time)} s
                </p>
              )}
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
                <p>Calculates velocity using two methods:</p>
                <ul className="list-disc list-inside">
                  <li>v = d/t (Distance / Time)</li>
                  <li>v = v₀ + at (Initial Velocity + Acceleration × Time)</li>
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

export default VelocityCalculator;