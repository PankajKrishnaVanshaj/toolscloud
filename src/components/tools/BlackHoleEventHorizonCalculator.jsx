'use client'
import React, { useState } from 'react';

const BlackHoleEventHorizonCalculator = () => {
  const [mass, setMass] = useState('');
  const [unit, setUnit] = useState('kg');
  const [rotation, setRotation] = useState(0); // Angular momentum parameter (0-1)
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Physical constants
  const G = 6.67430e-11; // m³ kg⁻¹ s⁻²
  const c = 299792458; // m/s
  const solarMass = 1.989e30; // kg
  const earthMass = 5.972e24; // kg
  const jupiterMass = 1.898e27; // kg

  // Preset examples
  const presets = [
    { name: 'Sun', mass: 1, unit: 'solar' },
    { name: 'Earth', mass: 1, unit: 'earth' },
    { name: 'Sagittarius A*', mass: 4.1e6, unit: 'solar' },
  ];

  const calculateBlackHoleProperties = () => {
    setError('');
    setResult(null);

    if (!mass || isNaN(mass) || mass <= 0) {
      setError('Please enter a valid positive mass');
      return;
    }

    if (rotation < 0 || rotation > 1) {
      setError('Rotation parameter must be between 0 and 1');
      return;
    }

    try {
      let massInKg = parseFloat(mass);
      switch (unit) {
        case 'solar': massInKg *= solarMass; break;
        case 'earth': massInKg *= earthMass; break;
        case 'jupiter': massInKg *= jupiterMass; break;
        default: break; // kg
      }

      // Schwarzschild radius (non-rotating)
      const schwarzschildRadius = (2 * G * massInKg) / (c * c);
      
      // Kerr parameters (rotating black hole)
      const a = rotation * schwarzschildRadius / 2; // Spin parameter
      const eventHorizon = (schwarzschildRadius + Math.sqrt(schwarzschildRadius * schwarzschildRadius - 4 * a * a)) / 2;
      
      // Surface gravity (κ = c⁴/(4GM) for non-rotating)
      const surfaceGravity = (c * c * c * c) / (4 * G * massInKg);
      
      // Escape velocity at event horizon is c, but let's calculate theoretical max
      const escapeVelocity = Math.sqrt(2 * G * massInKg / schwarzschildRadius);

      setResult({
        schwarzschildRadius,
        eventHorizon: rotation > 0 ? eventHorizon : schwarzschildRadius,
        surfaceGravity,
        escapeVelocity,
        massInKg
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  const getComparison = (radius) => {
    if (radius < 0.01) return 'Smaller than a grape';
    if (radius < 1) return 'About the size of a basketball';
    if (radius < 6371e3) return 'Smaller than Earth';
    if (radius < 696000e3) return 'Smaller than the Sun';
    return 'Larger than the Sun';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Advanced Black Hole Calculator
        </h1>

        <div className="space-y-6">
          {/* Mass Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mass
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                placeholder="Enter mass"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="kg">Kilograms</option>
                <option value="solar">Solar Masses</option>
                <option value="earth">Earth Masses</option>
                <option value="jupiter">Jupiter Masses</option>
              </select>
            </div>
          </div>

          {/* Rotation Parameter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rotation Parameter (0-1)
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={rotation}
              onChange={(e) => setRotation(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">0 = Non-rotating, 1 = Maximally rotating</p>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex gap-2">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setMass(preset.mass);
                    setUnit(preset.unit);
                    setRotation(0);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateBlackHoleProperties}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Properties
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md space-y-2">
              <h2 className="text-lg font-semibold mb-2">Black Hole Properties:</h2>
              <p>Event Horizon: {formatNumber(result.eventHorizon / 1000)} km</p>
              {rotation > 0 && (
                <p>Schwarzschild Radius (non-rotating): {formatNumber(result.schwarzschildRadius / 1000)} km</p>
              )}
              <p>Surface Gravity: {formatNumber(result.surfaceGravity)} m/s²</p>
              <p>Escape Velocity: {formatNumber(result.escapeVelocity / 1000)} km/s</p>
              <p>Mass: {formatNumber(result.massInKg)} kg</p>
              <p className="text-sm text-gray-600">
                Size comparison: {getComparison(result.eventHorizon)}
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
                <p>Calculates properties for Schwarzschild (non-rotating) and Kerr (rotating) black holes.</p>
                <p>Key equations:</p>
                <ul className="list-disc list-inside">
                  <li>Rs = 2GM/c² (Schwarzschild radius)</li>
                  <li>R+ = (Rs + √(Rs² - 4a²))/2 (Kerr event horizon)</li>
                  <li>κ = c⁴/(4GM) (Surface gravity, simplified)</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlackHoleEventHorizonCalculator;