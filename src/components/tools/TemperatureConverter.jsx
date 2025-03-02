'use client';

import React, { useState } from 'react';

const TemperatureConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('C');
  const [difference, setDifference] = useState('');
  const [showDifference, setShowDifference] = useState(false);

  // Conversion functions to Celsius as base unit
  const convertToCelsius = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return null;
    const val = parseFloat(inputValue);
    
    switch (fromUnit) {
      case 'C': return val;
      case 'F': return (val - 32) * 5/9;
      case 'K': return val - 273.15;
      case 'R': return (val - 491.67) * 5/9;
      default: return null;
    }
  };

  const convertFromCelsius = (celsius, toUnit) => {
    switch (toUnit) {
      case 'C': return celsius;
      case 'F': return celsius * 9/5 + 32;
      case 'K': return celsius + 273.15;
      case 'R': return (celsius + 273.15) * 9/5;
      default: return null;
    }
  };

  const units = {
    C: '°C (Celsius)',
    F: '°F (Fahrenheit)',
    K: 'K (Kelvin)',
    R: '°R (Rankine)'
  };

  const convertAll = (inputValue, fromUnit) => {
    const celsius = convertToCelsius(inputValue, fromUnit);
    if (celsius === null) return {};
    
    return Object.keys(units).reduce((acc, u) => {
      acc[u] = convertFromCelsius(celsius, u);
      return acc;
    }, {});
  };

  const calculateDifference = (baseValue, diff) => {
    if (!baseValue || !diff || isNaN(diff)) return {};
    const celsiusBase = convertToCelsius(baseValue, unit);
    const celsiusDiff = parseFloat(diff);
    
    return Object.keys(units).reduce((acc, u) => {
      acc[u] = convertFromCelsius(celsiusBase + celsiusDiff, u);
      return acc;
    }, {});
  };

  const results = convertAll(value, unit);
  const differenceResults = showDifference ? calculateDifference(value, difference) : {};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Temperature Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter temperature"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(units).map(([u, name]) => (
                  <option key={u} value={u}>{name}</option>
                ))}
              </select>
            </div>

            {/* Difference Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature Difference (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={difference}
                  onChange={(e) => {
                    setDifference(e.target.value);
                    setShowDifference(true);
                  }}
                  placeholder="Enter difference (°C)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    setDifference('');
                    setShowDifference(false);
                  }}
                  className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Difference in Celsius</p>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([u, val]) => (
                    <p key={u}>{units[u]}: {val.toFixed(2)}</p>
                  ))}
                </div>
              </div>

              {showDifference && difference && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">After Difference:</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(differenceResults).map(([u, val]) => (
                      <p key={u}>{units[u]}: {val.toFixed(2)}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Conversion Formulas</summary>
            <ul className="list-disc list-inside mt-2">
              <li>°F = (°C × 9/5) + 32</li>
              <li>K = °C + 273.15</li>
              <li>°R = (°C + 273.15) × 9/5</li>
              <li>°C = K - 273.15</li>
              <li>°C = (°F - 32) × 5/9</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TemperatureConverter;