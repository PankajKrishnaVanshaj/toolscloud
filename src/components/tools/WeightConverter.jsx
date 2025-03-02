'use client';

import React, { useState } from 'react';

const WeightConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('kg');
  const [system, setSystem] = useState('all'); // 'metric', 'imperial', or 'all'

  // Conversion factors to kilograms (kg)
  const conversionFactors = {
    // Metric units
    kg: 1,          // Kilogram
    g: 1e-3,        // Gram
    mg: 1e-6,       // Milligram
    ug: 1e-9,       // Microgram
    t: 1e3,         // Metric tonne
    // Imperial units
    lb: 0.453592,   // Pound
    oz: 0.0283495,  // Ounce
    st: 6.35029,    // Stone
    gr: 0.00006479891, // Grain
    cwt: 50.8023,   // Hundredweight (long)
    ton: 1016.047   // Imperial ton
  };

  const unitDisplayNames = {
    kg: 'kg',
    g: 'g',
    mg: 'mg',
    ug: 'µg',
    t: 't',
    lb: 'lb',
    oz: 'oz',
    st: 'st',
    gr: 'gr',
    cwt: 'cwt',
    ton: 'ton'
  };

  const metricUnits = ['kg', 'g', 'mg', 'ug', 't'];
  const imperialUnits = ['lb', 'oz', 'st', 'gr', 'cwt', 'ton'];

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInKg = inputValue * conversionFactors[fromUnit];
    
    const filteredUnits = system === 'metric' ? metricUnits 
      : system === 'imperial' ? imperialUnits 
      : Object.keys(conversionFactors);

    return filteredUnits.reduce((acc, unit) => {
      acc[unit] = valueInKg / conversionFactors[unit];
      return acc;
    }, {});
  };

  const results = convertValue(value, unit);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Weight Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter weight"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(conversionFactors).map((u) => (
                    <option key={u} value={u}>{unitDisplayNames[u]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Unit System Toggle */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setSystem('all')}
                className={`px-4 py-2 rounded-md ${system === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white transition-colors`}
              >
                All Units
              </button>
              <button
                onClick={() => setSystem('metric')}
                className={`px-4 py-2 rounded-md ${system === 'metric' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white transition-colors`}
              >
                Metric
              </button>
              <button
                onClick={() => setSystem('imperial')}
                className={`px-4 py-2 rounded-md ${system === 'imperial' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white transition-colors`}
              >
                Imperial
              </button>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(results).map(([unit, val]) => (
                  <p key={unit}>
                    {unitDisplayNames[unit]}: {val.toLocaleString(undefined, {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4
                    })}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Conversion References</summary>
            <ul className="list-disc list-inside mt-2">
              <li>1 kg = 2.20462 lb</li>
              <li>1 lb = 16 oz</li>
              <li>1 st = 14 lb</li>
              <li>1 t = 1000 kg</li>
              <li>1 ton = 2240 lb</li>
              <li>1 cwt = 112 lb</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default WeightConverter;