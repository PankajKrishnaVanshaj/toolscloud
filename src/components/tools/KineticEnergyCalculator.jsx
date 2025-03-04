'use client'
import React, { useState } from 'react';

const KineticEnergyCalculator = () => {
  const [mass, setMass] = useState('');
  const [velocity, setVelocity] = useState('');
  const [massUnit, setMassUnit] = useState('kg'); // kg, g, lb
  const [velocityUnit, setVelocityUnit] = useState('m/s'); // m/s, km/h, mph
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Unit conversion factors to base SI units (kg and m/s)
  const massUnits = {
    kg: 1,
    g: 0.001,
    lb: 0.453592,
  };

  const velocityUnits = {
    'm/s': 1,
    'km/h': 0.277778, // 1000 m / 3600 s
    mph: 0.44704, // 1609.34 m / 3600 s
  };

  const calculateKineticEnergy = () => {
    setError('');
    setResult(null);

    if (!mass || !velocity || isNaN(mass) || isNaN(velocity)) {
      setError('Please enter valid numeric values for mass and velocity');
      return;
    }

    const m = parseFloat(mass) * massUnits[massUnit];
    const v = parseFloat(velocity) * velocityUnits[velocityUnit];

    if (m <= 0 || v < 0) {
      setError('Mass must be positive and velocity cannot be negative');
      return;
    }

    try {
      // KE = ½mv²
      const ke = 0.5 * m * v * v;

      setResult({
        ke, // Joules
        mass: m,
        velocity: v,
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
          Kinetic Energy Calculator
        </h1>

        <div className="space-y-6">
          {/* Mass Input */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mass
              </label>
              <input
                type="number"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
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
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          {/* Velocity Input */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Velocity
              </label>
              <input
                type="number"
                value={velocity}
                onChange={(e) => setVelocity(e.target.value)}
                placeholder="Enter velocity"
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
                <option value="m/s">m/s</option>
                <option value="km/h">km/h</option>
                <option value="mph">mph</option>
              </select>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateKineticEnergy}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Kinetic Energy:</h2>
              <p>{formatNumber(result.ke)} J</p>
              <p>{formatNumber(result.ke / 1000)} kJ</p>
              <p>{formatNumber(result.ke / 3600000)} kWh</p>
              <p className="text-sm text-gray-600 mt-2">
                Mass: {formatNumber(result.mass)} kg | Velocity: {formatNumber(result.velocity)} m/s
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
                  setMass(1);
                  setMassUnit('kg');
                  setVelocity(10);
                  setVelocityUnit('m/s');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                1 kg at 10 m/s
              </button>
              <button
                onClick={() => {
                  setMass(1000);
                  setMassUnit('kg');
                  setVelocity(100);
                  setVelocityUnit('km/h');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Car (1000 kg, 100 km/h)
              </button>
              <button
                onClick={() => {
                  setMass(0.05);
                  setMassUnit('kg');
                  setVelocity(400);
                  setVelocityUnit('m/s');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Bullet (50g, 400 m/s)
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates kinetic energy using:</p>
                <p>KE = ½mv²</p>
                <p>Where:</p>
                <ul className="list-disc list-inside">
                  <li>m = mass (kg)</li>
                  <li>v = velocity (m/s)</li>
                  <li>KE = kinetic energy (Joules)</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KineticEnergyCalculator;