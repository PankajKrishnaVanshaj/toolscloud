'use client';

import React, { useState } from 'react';

const CookingMeasurementConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('cup');
  const [ingredientDensity, setIngredientDensity] = useState('1'); // g/mL, default to water

  // Conversion factors to milliliters (mL) for volume
  const volumeConversions = {
    cup: 236.588,     // US Cup
    tsp: 4.92892,     // Teaspoon
    tbsp: 14.7868,    // Tablespoon
    fl_oz: 29.5735,   // Fluid Ounce
    mL: 1,           // Milliliter
    L: 1000,         // Liter
    pint: 473.176,    // US Pint
    quart: 946.353,   // US Quart
    gallon: 3785.41   // US Gallon
  };

  // Weight conversions to grams (g)
  const weightConversions = {
    g: 1,          // Gram
    oz: 28.3495,   // Ounce
    lb: 453.592,   // Pound
    kg: 1000,      // Kilogram
    mg: 0.001      // Milligram
  };

  // Display names for units
  const unitDisplayNames = {
    cup: 'cup',
    tsp: 'tsp',
    tbsp: 'tbsp',
    fl_oz: 'fl oz',
    mL: 'mL',
    L: 'L',
    pint: 'pint',
    quart: 'quart',
    gallon: 'gallon',
    g: 'g',
    oz: 'oz',
    lb: 'lb',
    kg: 'kg',
    mg: 'mg'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return { volume: {}, weight: {} };

    // Determine if input is volume or weight
    const isVolume = Object.keys(volumeConversions).includes(fromUnit);
    const density = parseFloat(ingredientDensity) || 1;

    if (isVolume) {
      const valueInMl = inputValue * volumeConversions[fromUnit];
      const valueInGrams = valueInMl * density;

      return {
        volume: Object.keys(volumeConversions).reduce((acc, unit) => {
          acc[unit] = valueInMl / volumeConversions[unit];
          return acc;
        }, {}),
        weight: Object.keys(weightConversions).reduce((acc, unit) => {
          acc[unit] = valueInGrams / weightConversions[unit];
          return acc;
        }, {})
      };
    } else {
      const valueInGrams = inputValue * weightConversions[fromUnit];
      const valueInMl = valueInGrams / density;

      return {
        volume: Object.keys(volumeConversions).reduce((acc, unit) => {
          acc[unit] = valueInMl / volumeConversions[unit];
          return acc;
        }, {}),
        weight: Object.keys(weightConversions).reduce((acc, unit) => {
          acc[unit] = valueInGrams / weightConversions[unit];
          return acc;
        }, {})
      };
    }
  };

  const results = convertValue(value, unit);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Cooking Measurement Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Measurement
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="Volume">
                  {Object.keys(volumeConversions).map((u) => (
                    <option key={u} value={u}>{unitDisplayNames[u]}</option>
                  ))}
                </optgroup>
                <optgroup label="Weight">
                  {Object.keys(weightConversions).map((u) => (
                    <option key={u} value={u}>{unitDisplayNames[u]}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Density Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingredient Density (g/mL)
              </label>
              <input
                type="number"
                value={ingredientDensity}
                onChange={(e) => setIngredientDensity(e.target.value)}
                placeholder="Enter density (default: 1)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                e.g., Water: 1, Flour: ~0.6, Sugar: ~0.8
              </p>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Volume:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results.volume).map(([unit, val]) => (
                    <p key={unit}>{unitDisplayNames[unit]}: {val.toFixed(3)}</p>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Weight:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results.weight).map(([unit, val]) => (
                    <p key={unit}>{unitDisplayNames[unit]}: {val.toFixed(3)}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Conversion Notes</summary>
            <ul className="list-disc list-inside mt-2">
              <li>1 cup = 236.588 mL</li>
              <li>1 tbsp = 3 tsp = 14.7868 mL</li>
              <li>1 oz = 28.3495 g</li>
              <li>1 lb = 16 oz = 453.592 g</li>
              <li>Results depend on ingredient density</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default CookingMeasurementConverter;