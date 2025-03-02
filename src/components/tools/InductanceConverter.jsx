'use client';

import React, { useState } from 'react';

const InductanceConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('H');
  const [current, setCurrent] = useState('');
  
  // Conversion factors to Henry (H)
  const conversionFactors = {
    H: 1,          // Henry
    mH: 1e-3,      // Millihenry
    uH: 1e-6,      // Microhenry
    nH: 1e-9,      // Nanohenry
    kH: 1e3,       // Kilohenry
    MH: 1e6,       // Megahenry
    GH: 1e9,       // Gigahenry
    abH: 1e-9,     // Abhenry
    stH: 8.987552e11 // Stathenry
  };

  // Display names for units
  const unitDisplayNames = {
    H: 'H',
    mH: 'mH',
    uH: 'μH',
    nH: 'nH',
    kH: 'kH',
    MH: 'MH',
    GH: 'GH',
    abH: 'abH',
    stH: 'stH'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInHenry = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInHenry / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateEnergy = () => {
    if (!value || !current || isNaN(value) || isNaN(current)) return null;
    
    const inductanceInHenry = value * conversionFactors[unit];
    const currentInAmperes = parseFloat(current);
    
    // Energy stored in an inductor: E = (1/2) × L × I² (Joules)
    const energy = 0.5 * inductanceInHenry * currentInAmperes * currentInAmperes;
    return energy;
  };

  const results = convertValue(value, unit);
  const energyStored = calculateEnergy();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Inductance Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inductance
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter inductance"
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

            {/* Current Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current (A)
              </label>
              <input
                type="number"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter current"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                For energy calculation
              </p>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>{unitDisplayNames[unit]}: {val.toExponential(4)}</p>
                  ))}
                </div>
              </div>
              
              {energyStored && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Stored Energy:</h2>
                  <p>Joules (J): {energyStored.toExponential(4)}</p>
                  <p>mJ: {(energyStored * 1e3).toExponential(4)}</p>
                  <p>μJ: {(energyStored * 1e6).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    E = ½ × L × I²
                  </p>
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
              <li>1 H = 10³ mH = 10⁶ μH</li>
              <li>1 H = 10⁻⁹ abH</li>
              <li>1 stH ≈ 8.987552 × 10¹¹ H</li>
              <li>1 kH = 10³ H</li>
              <li>1 MH = 10⁶ H</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default InductanceConverter;