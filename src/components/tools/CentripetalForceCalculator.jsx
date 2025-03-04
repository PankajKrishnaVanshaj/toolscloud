'use client'
import React, { useState } from 'react';

const CentripetalForceCalculator = () => {
  const [mass, setMass] = useState(''); // Mass in kg
  const [velocity, setVelocity] = useState(''); // Linear velocity in m/s
  const [radius, setRadius] = useState(''); // Radius in meters
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculateCentripetalForce = () => {
    setError('');
    setResult(null);

    const m = parseFloat(mass);
    const v = parseFloat(velocity);
    const r = parseFloat(radius);

    if (isNaN(m) || isNaN(v) || isNaN(r) || m <= 0 || v < 0 || r <= 0) {
      setError('Please enter valid positive values for mass, velocity, and radius');
      return;
    }

    try {
      // Centripetal force: F = mv²/r
      const force = (m * v * v) / r;

      // Angular velocity: ω = v/r
      const angularVelocity = v / r;

      // Period: T = 2πr/v
      const period = (2 * Math.PI * r) / v;

      // Centripetal acceleration: a = v²/r
      const acceleration = (v * v) / r;

      setResult({
        force,
        angularVelocity,
        period,
        acceleration,
        mass: m,
        velocity: v,
        radius: r,
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Centripetal Force Calculator
        </h1>

        <div className="space-y-6">
          {/* Inputs */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mass (kg)
              </label>
              <input
                type="number"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                placeholder="e.g., 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Velocity (m/s)
              </label>
              <input
                type="number"
                value={velocity}
                onChange={(e) => setVelocity(e.target.value)}
                placeholder="e.g., 10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius (m)
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="e.g., 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateCentripetalForce}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Centripetal Force: {formatNumber(result.force)} N</p>
              <p>Centripetal Acceleration: {formatNumber(result.acceleration)} m/s²</p>
              <p>Angular Velocity: {formatNumber(result.angularVelocity)} rad/s</p>
              <p>Period: {formatNumber(result.period)} s</p>
              <p className="text-sm text-gray-600 mt-2">
                Mass: {formatNumber(result.mass)} kg | Velocity: {formatNumber(result.velocity)} m/s | Radius: {formatNumber(result.radius)} m
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
                  setMass(1);
                  setVelocity(10);
                  setRadius(2);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Car on Curve
              </button>
              <button
                onClick={() => {
                  setMass(0.1);
                  setVelocity(5);
                  setRadius(0.5);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Swinging Ball
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates properties of circular motion:</p>
                <ul className="list-disc list-inside">
                  <li>F = mv²/r (Centripetal Force)</li>
                  <li>a = v²/r (Centripetal Acceleration)</li>
                  <li>ω = v/r (Angular Velocity)</li>
                  <li>T = 2πr/v (Period)</li>
                </ul>
                <p>Assumes uniform circular motion.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentripetalForceCalculator;