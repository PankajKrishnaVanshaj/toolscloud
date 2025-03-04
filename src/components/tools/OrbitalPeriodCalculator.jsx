'use client'
import React, { useState } from 'react';

const OrbitalPeriodCalculator = () => {
  const [mass, setMass] = useState(1.989e30); // Mass of central body (kg, default: Sun)
  const [massUnit, setMassUnit] = useState('kg'); // kg, solar, earth
  const [semiMajorAxis, setSemiMajorAxis] = useState(1.496e11); // Distance (m, default: 1 AU)
  const [distanceUnit, setDistanceUnit] = useState('m'); // m, km, au
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const G = 6.67430e-11; // Gravitational constant (m³ kg⁻¹ s⁻²)
  const solarMass = 1.989e30; // kg
  const earthMass = 5.972e24; // kg
  const auToM = 1.496e11; // meters per AU
  const kmToM = 1e3; // meters per km

  const calculateOrbitalPeriod = () => {
    setError('');
    setResult(null);

    const m = parseFloat(mass);
    const a = parseFloat(semiMajorAxis);

    if (isNaN(m) || m <= 0 || isNaN(a) || a <= 0) {
      setError('Please enter valid positive values for mass and distance');
      return;
    }

    try {
      // Convert to SI units (kg and m)
      let massKg = m;
      switch (massUnit) {
        case 'solar': massKg *= solarMass; break;
        case 'earth': massKg *= earthMass; break;
        default: break; // kg
      }

      let distanceM = a;
      switch (distanceUnit) {
        case 'au': distanceM *= auToM; break;
        case 'km': distanceM *= kmToM; break;
        default: break; // m
      }

      // Kepler's Third Law: T = 2π √(a³ / GM)
      const periodSeconds = 2 * Math.PI * Math.sqrt(Math.pow(distanceM, 3) / (G * massKg));

      setResult({
        periodSeconds,
        periodDays: periodSeconds / (24 * 3600),
        periodYears: periodSeconds / (365.25 * 24 * 3600),
        mass: massKg,
        semiMajorAxis: distanceM,
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
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Orbital Period Calculator
        </h1>

        <div className="space-y-6">
          {/* Mass Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Central Body Mass
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={massUnit}
                onChange={(e) => setMassUnit(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="kg">kg</option>
                <option value="solar">Solar Masses</option>
                <option value="earth">Earth Masses</option>
              </select>
            </div>
          </div>

          {/* Semi-Major Axis Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semi-Major Axis
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={semiMajorAxis}
                onChange={(e) => setSemiMajorAxis(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="m">m</option>
                <option value="km">km</option>
                <option value="au">AU</option>
              </select>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateOrbitalPeriod}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Orbital Period:</h2>
              <p>{formatNumber(result.periodSeconds)} seconds</p>
              <p>{formatNumber(result.periodDays)} days</p>
              <p>{formatNumber(result.periodYears)} years</p>
              <p className="text-sm text-gray-600 mt-2">
                Mass: {formatNumber(result.mass)} kg | Distance: {formatNumber(result.semiMajorAxis)} m
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
                  setMass(1.989e30);
                  setMassUnit('kg');
                  setSemiMajorAxis(1.496e11);
                  setDistanceUnit('m');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Earth around Sun
              </button>
              <button
                onClick={() => {
                  setMass(5.972e24);
                  setMassUnit('kg');
                  setSemiMajorAxis(384400);
                  setDistanceUnit('km');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Moon around Earth
              </button>
              <button
                onClick={() => {
                  setMass(1.989e30);
                  setMassUnit('kg');
                  setSemiMajorAxis(5.791e10);
                  setDistanceUnit('m');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Mercury around Sun
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates orbital period using Kepler's Third Law:</p>
                <p>T = 2π √(a³ / GM)</p>
                <p>Where:</p>
                <ul className="list-disc list-inside">
                  <li>T = Orbital period</li>
                  <li>a = Semi-major axis</li>
                  <li>G = Gravitational constant</li>
                  <li>M = Mass of central body</li>
                </ul>
                <p>Assumes circular orbit for simplicity.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrbitalPeriodCalculator;