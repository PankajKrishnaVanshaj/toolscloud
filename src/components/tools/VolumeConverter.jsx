'use client';

import React, { useState } from 'react';

const VolumeConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('L');

  // Conversion factors to Liters (L)
  const conversionFactors = {
    L: 1,              // Liter
    mL: 1e-3,          // Milliliter
    cm3: 1e-3,         // Cubic centimeter (cm³)
    m3: 1e3,           // Cubic meter (m³)
    in3: 0.0163871,    // Cubic inch (in³)
    ft3: 28.3168,      // Cubic foot (ft³)
    galUS: 3.78541,    // US Gallon
    galUK: 4.54609,    // UK/Imperial Gallon
    qtUS: 0.946353,    // US Quart
    qtUK: 1.13652,     // UK/Imperial Quart
    ptUS: 0.473176,    // US Pint
    ptUK: 0.568261,    // UK/Imperial Pint
    fl_ozUS: 0.0295735,// US Fluid Ounce
    fl_ozUK: 0.0284131,// UK/Imperial Fluid Ounce
    tbsp: 0.0147868,   // Tablespoon (US)
    tsp: 0.00492892    // Teaspoon (US)
  };

  // Display names for units
  const unitDisplayNames = {
    L: 'L',
    mL: 'mL',
    cm3: 'cm³',
    m3: 'm³',
    in3: 'in³',
    ft3: 'ft³',
    galUS: 'gal (US)',
    galUK: 'gal (UK)',
    qtUS: 'qt (US)',
    qtUK: 'qt (UK)',
    ptUS: 'pt (US)',
    ptUK: 'pt (UK)',
    fl_ozUS: 'fl oz (US)',
    fl_ozUK: 'fl oz (UK)',
    tbsp: 'tbsp',
    tsp: 'tsp'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInLiters = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInLiters / conversionFactors[unit];
      return acc;
    }, {});
  };

  const results = convertValue(value, unit);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Volume Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter volume"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(conversionFactors).map((u) => (
                  <option key={u} value={u}>{unitDisplayNames[u]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(results).map(([unit, val]) => (
                  <p key={unit}>
                    {unitDisplayNames[unit]}: {val.toLocaleString('en-US', { 
                      maximumFractionDigits: 6,
                      useGrouping: true 
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
              <li>1 L = 1000 mL = 1000 cm³</li>
              <li>1 m³ = 1000 L</li>
              <li>1 gal (US) = 3.78541 L</li>
              <li>1 gal (UK) = 4.54609 L</li>
              <li>1 fl oz (US) = 29.5735 mL</li>
              <li>1 tbsp = 3 tsp = 14.7868 mL</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default VolumeConverter;