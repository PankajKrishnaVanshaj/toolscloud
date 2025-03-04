'use client'
import React, { useState } from 'react';

const ThermodynamicEfficiencyCalculator = () => {
  const [cycleType, setCycleType] = useState('carnot'); // carnot, rankine (future expansion)
  const [tempHot, setTempHot] = useState(500); // Hot reservoir temperature (K)
  const [tempCold, setTempCold] = useState(300); // Cold reservoir temperature (K)
  const [unit, setUnit] = useState('K'); // K, C, F
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const convertToKelvin = (temp, unit) => {
    switch (unit) {
      case 'C': return temp + 273.15;
      case 'F': return (temp - 32) * 5/9 + 273.15;
      case 'K': return temp;
      default: return temp;
    }
  };

  const calculateEfficiency = () => {
    setError('');
    setResult(null);

    const tHot = parseFloat(tempHot);
    const tCold = parseFloat(tempCold);

    if (isNaN(tHot) || isNaN(tCold)) {
      setError('Please enter valid temperatures');
      return;
    }

    const tHotK = convertToKelvin(tHot, unit);
    const tColdK = convertToKelvin(tCold, unit);

    if (tHotK <= tColdK) {
      setError('Hot temperature must be greater than cold temperature');
      return;
    }

    if (tColdK <= 0) {
      setError('Temperatures must be above absolute zero');
      return;
    }

    try {
      let efficiency;
      let description;

      switch (cycleType) {
        case 'carnot':
          // Carnot efficiency: η = 1 - (T_cold / T_hot)
          efficiency = 1 - (tColdK / tHotK);
          description = 'Maximum theoretical efficiency for a heat engine between two reservoirs';
          break;
        // Future expansion for other cycles (e.g., Rankine) can be added here
        default:
          throw new Error('Unsupported cycle type');
      }

      setResult({
        efficiency: efficiency * 100, // Convert to percentage
        tHotK,
        tColdK,
        description,
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
          Thermodynamic Efficiency Calculator
        </h1>

        <div className="space-y-6">
          {/* Cycle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cycle Type
            </label>
            <select
              value={cycleType}
              onChange={(e) => {
                setCycleType(e.target.value);
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="carnot">Carnot Cycle</option>
              {/* Add more cycle types here in the future */}
            </select>
          </div>

          {/* Temperature Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="K">Kelvin (K)</option>
              <option value="C">Celsius (°C)</option>
              <option value="F">Fahrenheit (°F)</option>
            </select>
          </div>

          {/* Temperatures */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hot Temperature ({unit})
              </label>
              <input
                type="number"
                value={tempHot}
                onChange={(e) => setTempHot(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cold Temperature ({unit})
              </label>
              <input
                type="number"
                value={tempCold}
                onChange={(e) => setTempCold(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateEfficiency}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Efficiency
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Efficiency:</h2>
              <p>{formatNumber(result.efficiency)}%</p>
              <p className="text-sm text-gray-600 mt-2">
                T_hot: {formatNumber(result.tHotK)} K ({formatNumber(convertToKelvin(tempHot, unit) - 273.15)}°C)
              </p>
              <p className="text-sm text-gray-600">
                T_cold: {formatNumber(result.tColdK)} K ({formatNumber(convertToKelvin(tempCold, unit) - 273.15)}°C)
              </p>
              <p className="text-xs text-gray-500 mt-1">{result.description}</p>
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
                  setCycleType('carnot');
                  setUnit('K');
                  setTempHot(500);
                  setTempCold(300);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Carnot (500K/300K)
              </button>
              <button
                onClick={() => {
                  setCycleType('carnot');
                  setUnit('C');
                  setTempHot(100);
                  setTempCold(20);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Carnot (100°C/20°C)
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates thermodynamic efficiency:</p>
                <ul className="list-disc list-inside">
                  <li>Carnot: η = 1 - (T_cold / T_hot)</li>
                  <li>Temperatures must be in absolute scale (Kelvin)</li>
                </ul>
                <p>Future expansions could include Rankine, Brayton, etc.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermodynamicEfficiencyCalculator;