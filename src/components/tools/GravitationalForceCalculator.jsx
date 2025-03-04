'use client'
import React, { useState } from 'react';

const GravitationalForceCalculator = () => {
  const [mass1, setMass1] = useState(''); // Mass of object 1
  const [mass2, setMass2] = useState(''); // Mass of object 2
  const [distance, setDistance] = useState(''); // Distance between objects
  const [massUnit, setMassUnit] = useState('kg'); // kg, g, tonnes
  const [distanceUnit, setDistanceUnit] = useState('m'); // m, km, AU
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const G = 6.67430e-11; // Gravitational constant (m³ kg⁻¹ s⁻²)

  // Unit conversion factors
  const massUnits = {
    kg: 1,
    g: 1e-3,
    tonnes: 1e3,
  };

  const distanceUnits = {
    m: 1,
    km: 1e3,
    AU: 1.496e11, // Astronomical Unit (average distance Earth-Sun)
  };

  const calculateForce = () => {
    setError('');
    setResult(null);

    if (!mass1 || !mass2 || !distance || isNaN(mass1) || isNaN(mass2) || isNaN(distance)) {
      setError('Please enter valid numeric values for masses and distance');
      return;
    }

    const m1 = parseFloat(mass1) * massUnits[massUnit];
    const m2 = parseFloat(mass2) * massUnits[massUnit];
    const r = parseFloat(distance) * distanceUnits[distanceUnit];

    if (m1 <= 0 || m2 <= 0 || r <= 0) {
      setError('Masses and distance must be positive');
      return;
    }

    try {
      // Newton's Law of Gravitation: F = G * (m1 * m2) / r²
      const force = (G * m1 * m2) / (r * r);

      setResult({
        force, // in Newtons
        m1,
        m2,
        r,
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
          Gravitational Force Calculator
        </h1>

        <div className="space-y-6">
          {/* Mass 1 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mass 1
              </label>
              <input
                type="number"
                value={mass1}
                onChange={(e) => setMass1(e.target.value)}
                placeholder="Enter mass"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={massUnit}
                onChange={(e) => setMassUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="tonnes">tonnes</option>
              </select>
            </div>
          </div>

          {/* Mass 2 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mass 2
              </label>
              <input
                type="number"
                value={mass2}
                onChange={(e) => setMass2(e.target.value)}
                placeholder="Enter mass"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={massUnit}
                onChange={(e) => setMassUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="tonnes">tonnes</option>
              </select>
            </div>
          </div>

          {/* Distance */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance
              </label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Enter distance"
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
                <option value="m">m</option>
                <option value="km">km</option>
                <option value="AU">AU</option>
              </select>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateForce}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Force
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Gravitational Force:</h2>
              <p>{formatNumber(result.force)} N</p>
              <p>{formatNumber(result.force * 1e3)} mN</p>
              <p>{formatNumber(result.force / 9.80665)} kgf (force in kg)</p>
              <p className="text-sm text-gray-600 mt-2">
                m₁: {formatNumber(result.m1)} kg | m₂: {formatNumber(result.m2)} kg | r: {formatNumber(result.r)} m
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
                  setMass1(5.972e24); // Earth mass
                  setMass2(7.342e22); // Moon mass
                  setDistance(384400); // Average Earth-Moon distance
                  setMassUnit('kg');
                  setDistanceUnit('km');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Earth-Moon
              </button>
              <button
                onClick={() => {
                  setMass1(1.989e30); // Sun mass
                  setMass2(5.972e24); // Earth mass
                  setDistance(1); // 1 AU
                  setMassUnit('kg');
                  setDistanceUnit('AU');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Sun-Earth
              </button>
              <button
                onClick={() => {
                  setMass1(1); // 1 kg
                  setMass2(1); // 1 kg
                  setDistance(1); // 1 m
                  setMassUnit('kg');
                  setDistanceUnit('m');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Two 1kg Objects
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates gravitational force using Newton's Law:</p>
                <p>F = G * (m₁ * m₂) / r²</p>
                <p>Where G = 6.67430 × 10⁻¹¹ m³ kg⁻¹ s⁻²</p>
                <p>Supports multiple units for mass and distance.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GravitationalForceCalculator;