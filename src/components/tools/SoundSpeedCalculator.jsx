'use client'
import React, { useState } from 'react';

const SoundSpeedCalculator = () => {
  const [medium, setMedium] = useState('air'); // air, water, steel
  const [temperature, setTemperature] = useState(20); // Celsius
  const [pressure, setPressure] = useState(101325); // Pascals (1 atm)
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const R = 287.05; // Specific gas constant for dry air (J/(kg·K))
  const gammaAir = 1.4; // Adiabatic index for air
  const rhoWater = 1000; // Density of water (kg/m³)
  const BWater = 2.2e9; // Bulk modulus of water (Pa)
  const rhoSteel = 7850; // Density of steel (kg/m³)
  const BSteel = 1.6e11; // Bulk modulus of steel (Pa)

  const calculateSoundSpeed = () => {
    setError('');
    setResult(null);

    const tempK = parseFloat(temperature) + 273.15; // Convert to Kelvin
    if (isNaN(tempK) || tempK < 0) {
      setError('Please enter a valid temperature');
      return;
    }

    const press = parseFloat(pressure);
    if (isNaN(press) || press <= 0) {
      setError('Please enter a valid pressure');
      return;
    }

    try {
      let speed;
      let method;

      switch (medium) {
        case 'air':
          // Speed of sound in air: v = √(γRT/M)
          speed = Math.sqrt(gammaAir * R * tempK);
          method = 'Using ideal gas approximation';
          break;
        case 'water':
          // Speed of sound in liquid: v = √(B/ρ)
          // Adjusted for temperature (simplified empirical formula)
          const v0 = 1481; // Speed at 20°C
          const tempEffect = 4.0 * (tempK - 293.15); // Approx 4 m/s per °C
          speed = v0 + tempEffect;
          method = 'Using simplified empirical formula for water';
          break;
        case 'steel':
          // Speed of sound in solid: v = √(B/ρ)
          speed = Math.sqrt(BSteel / rhoSteel);
          method = 'Using bulk modulus and density';
          break;
        default:
          throw new Error('Unknown medium');
      }

      setResult({
        speed,
        medium,
        temperature: tempK - 273.15,
        pressure: press,
        method,
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
          Sound Speed Calculator
        </h1>

        <div className="space-y-6">
          {/* Medium Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medium
            </label>
            <select
              value={medium}
              onChange={(e) => {
                setMedium(e.target.value);
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="air">Air</option>
              <option value="water">Water</option>
              <option value="steel">Steel</option>
            </select>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature (°C)
            </label>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pressure (only for air) */}
          {medium === 'air' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pressure (Pa)
              </label>
              <input
                type="number"
                value={pressure}
                onChange={(e) => setPressure(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Standard: 101325 Pa (1 atm)</p>
            </div>
          )}

          {/* Calculate Button */}
          <button
            onClick={calculateSoundSpeed}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Speed of Sound:</h2>
              <p>{formatNumber(result.speed)} m/s</p>
              <p>{formatNumber(result.speed * 3.6)} km/h</p>
              <p>{formatNumber(result.speed * 2.23694)} mph</p>
              <p className="text-sm text-gray-600 mt-2">
                Medium: {result.medium} | Temp: {formatNumber(result.temperature)}°C
                {result.medium === 'air' && ` | Pressure: ${formatNumber(result.pressure)} Pa`}
              </p>
              <p className="text-xs text-gray-500 mt-1">{result.method}</p>
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
                  setMedium('air');
                  setTemperature(20);
                  setPressure(101325);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Air (20°C)
              </button>
              <button
                onClick={() => {
                  setMedium('water');
                  setTemperature(20);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Water (20°C)
              </button>
              <button
                onClick={() => {
                  setMedium('steel');
                  setTemperature(20);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Steel
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates speed of sound in different media:</p>
                <ul className="list-disc list-inside">
                  <li>Air: v = √(γRT) (ideal gas)</li>
                  <li>Water: Empirical adjustment from 1481 m/s at 20°C</li>
                  <li>Steel: v = √(B/ρ) (bulk modulus/density)</li>
                </ul>
                <p>Note: Simplified models; real values may vary with conditions.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundSpeedCalculator;