'use client';

import React, { useState } from 'react';

const LengthConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('m');
  const [system, setSystem] = useState('all'); // 'metric', 'imperial', or 'all'

  // Conversion factors to meters (m)
  const conversionFactors = {
    // Metric
    km: 1000,          // Kilometer
    m: 1,             // Meter
    cm: 0.01,         // Centimeter
    mm: 0.001,        // Millimeter
    um: 1e-6,         // Micrometer
    nm: 1e-9,         // Nanometer
    // Imperial
    mi: 1609.34,      // Mile
    yd: 0.9144,       // Yard
    ft: 0.3048,       // Foot
    in: 0.0254,       // Inch
    // Other
    ly: 9.461e15,     // Light-year
    au: 1.496e11,     // Astronomical Unit
    pc: 3.086e16      // Parsec
  };

  // Display names for units
  const unitDisplayNames = {
    km: 'km',
    m: 'm',
    cm: 'cm',
    mm: 'mm',
    um: 'μm',
    nm: 'nm',
    mi: 'mi',
    yd: 'yd',
    ft: 'ft',
    in: 'in',
    ly: 'ly',
    au: 'AU',
    pc: 'pc'
  };

  // Unit systems for filtering
  const unitSystems = {
    metric: ['km', 'm', 'cm', 'mm', 'um', 'nm'],
    imperial: ['mi', 'yd', 'ft', 'in'],
    astronomical: ['ly', 'au', 'pc']
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInMeters = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInMeters / conversionFactors[unit];
      return acc;
    }, {});
  };

  const getFilteredUnits = () => {
    if (system === 'all') return Object.keys(conversionFactors);
    if (system === 'astronomical') return unitSystems.astronomical;
    if (system === 'metric') return unitSystems.metric;
    return unitSystems.imperial;
  };

  const results = convertValue(value, unit);
  const filteredUnits = getFilteredUnits();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Length Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Length
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(conversionFactors).map((u) => (
                  <option key={u} value={u}>{unitDisplayNames[u]}</option>
                ))}
              </select>
            </div>

            {/* Unit System Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit System
              </label>
              <div className="flex gap-2">
                {['all', 'metric', 'imperial', 'astronomical'].map((sys) => (
                  <button
                    key={sys}
                    onClick={() => setSystem(sys)}
                    className={`px-3 py-1 rounded-md capitalize ${
                      system === sys
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {sys}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {filteredUnits.map((unit) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {results[unit].toExponential(4)}
                    </p>
                  ))}
                </div>
              </div>

              {/* Visual Comparison */}
              {value && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Comparison:</h2>
                  <div className="space-y-2 text-sm">
                    <p>
                      {value} {unitDisplayNames[unit]} is approximately:
                    </p>
                    <ul className="list-disc list-inside">
                      {unit === 'm' && value >= 1 && (
                        <li>{Math.round(value / 0.9144)} football fields</li>
                      )}
                      {unit === 'km' && value >= 1 && (
                        <li>{Math.round(value * 1000 / 40075 * 100)}% of Earth&apos;s circumference</li>
                      )}
                      {unit === 'mi' && value >= 1 && (
                        <li>{Math.round(value / 238855 * 100)}% to the Moon</li>
                      )}
                      {unit === 'ly' && value > 0 && (
                        <li>{(value * 9.461e12).toExponential(2)} km</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Conversion References</summary>
            <ul className="list-disc list-inside mt-2">
              <li>1 km = 1000 m</li>
              <li>1 mi = 1609.34 m</li>
              <li>1 ft = 0.3048 m</li>
              <li>1 ly = 9.461 × 10¹⁵ m</li>
              <li>1 AU = 1.496 × 10¹¹ m</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default LengthConverter;