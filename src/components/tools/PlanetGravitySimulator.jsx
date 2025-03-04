'use client'
import React, { useState } from 'react';

const PlanetGravitySimulator = () => {
  const [massPlanet, setMassPlanet] = useState(''); // kg
  const [radiusPlanet, setRadiusPlanet] = useState(''); // m
  const [massObject, setMassObject] = useState(1); // kg
  const [height, setHeight] = useState(10); // m
  const [usePreset, setUsePreset] = useState(true);
  const [preset, setPreset] = useState('earth');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Gravitational constant
  const G = 6.67430e-11; // m³ kg⁻¹ s⁻²

  // Preset planetary data
  const presets = {
    earth: { mass: 5.972e24, radius: 6.371e6, name: 'Earth' },
    moon: { mass: 7.342e22, radius: 1.738e6, name: 'Moon' },
    mars: { mass: 6.417e23, radius: 3.39e6, name: 'Mars' },
    jupiter: { mass: 1.898e27, radius: 6.991e7, name: 'Jupiter' },
  };

  const calculateGravity = () => {
    setError('');
    setResult(null);

    let mPlanet, rPlanet;
    if (usePreset) {
      mPlanet = presets[preset].mass;
      rPlanet = presets[preset].radius;
    } else {
      mPlanet = parseFloat(massPlanet);
      rPlanet = parseFloat(radiusPlanet);
    }

    const mObject = parseFloat(massObject);
    const h = parseFloat(height);

    if (isNaN(mPlanet) || isNaN(rPlanet) || isNaN(mObject) || isNaN(h)) {
      setError('Please enter valid numeric values');
      return;
    }

    if (mPlanet <= 0 || rPlanet <= 0 || mObject <= 0 || h < 0) {
      setError('Values must be positive (height can be zero)');
      return;
    }

    try {
      // Gravitational acceleration: g = GM/r²
      const g = (G * mPlanet) / (rPlanet * rPlanet);
      
      // Gravitational force: F = GMm/r²
      const force = (G * mPlanet * mObject) / (rPlanet * rPlanet);
      
      // Time to fall: t = √(2h/g)
      const fallTime = Math.sqrt(2 * h / g);
      
      // Final velocity: v = √(2gh)
      const finalVelocity = Math.sqrt(2 * g * h);

      setResult({
        g,
        force,
        fallTime,
        finalVelocity,
        planetName: usePreset ? presets[preset].name : 'Custom Body',
        massPlanet: mPlanet,
        radiusPlanet: rPlanet,
      });
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Planet Gravity Simulator
        </h1>

        <div className="space-y-6">
          {/* Preset or Custom Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Planet Selection
            </label>
            <select
              value={usePreset ? 'preset' : 'custom'}
              onChange={(e) => setUsePreset(e.target.value === 'preset')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="preset">Use Preset Planet</option>
              <option value="custom">Custom Planet</option>
            </select>
          </div>

          {/* Preset Planet */}
          {usePreset && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Planet
              </label>
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(presets).map(([key, { name }]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Planet Inputs */}
          {!usePreset && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planet Mass (kg)
                </label>
                <input
                  type="number"
                  value={massPlanet}
                  onChange={(e) => setMassPlanet(e.target.value)}
                  placeholder="e.g., 5.972e24"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planet Radius (m)
                </label>
                <input
                  type="number"
                  value={radiusPlanet}
                  onChange={(e) => setRadiusPlanet(e.target.value)}
                  placeholder="e.g., 6.371e6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Object Parameters */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Object Mass (kg)
              </label>
              <input
                type="number"
                value={massObject}
                onChange={(e) => setMassObject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drop Height (m)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateGravity}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Gravity Results ({result.planetName}):</h2>
              <p>Gravitational Acceleration: {formatNumber(result.g)} m/s²</p>
              <p>Gravitational Force: {formatNumber(result.force)} N</p>
              <p>Fall Time from {height}m: {formatNumber(result.fallTime)} s</p>
              <p>Final Velocity: {formatNumber(result.finalVelocity)} m/s</p>
              <p className="text-sm text-gray-600 mt-2">
                Planet Mass: {formatNumber(result.massPlanet)} kg | Radius: {formatNumber(result.radiusPlanet)} m
              </p>
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
                <p>Simulates gravity on planetary bodies:</p>
                <ul className="list-disc list-inside">
                  <li>g = GM/r² (acceleration)</li>
                  <li>F = GMm/r² (force)</li>
                  <li>t = √(2h/g) (fall time)</li>
                  <li>v = √(2gh) (final velocity)</li>
                </ul>
                <p>G = 6.67430 × 10⁻¹¹ m³ kg⁻¹ s⁻²</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetGravitySimulator;