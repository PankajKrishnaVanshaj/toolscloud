'use client';

import React, { useState } from 'react';

const MagneticFluxConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('Wb');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('m2');

  // Conversion factors to Weber (Wb)
  const conversionFactors = {
    Wb: 1,          // Weber
    mWb: 1e-3,      // Milliweber
    uWb: 1e-6,      // Microweber
    nWb: 1e-9,      // Nanoweber
    Mx: 1e-8,       // Maxwell
    kMx: 1e-5,      // Kilomaxwell
    MMx: 1e-2,      // Megamaxwell
    line: 1e-8      // Line (equivalent to Maxwell)
  };

  // Display names for flux units
  const unitDisplayNames = {
    Wb: 'Wb',
    mWb: 'mWb',
    uWb: 'μWb',
    nWb: 'nWb',
    Mx: 'Mx',
    kMx: 'kMx',
    MMx: 'MMx',
    line: 'line'
  };

  // Area conversion factors to square meters (m²)
  const areaConversion = {
    m2: 1,
    cm2: 1e-4,
    mm2: 1e-6,
    in2: 6.4516e-4,
    ft2: 9.2903e-2
  };

  const areaDisplayNames = {
    m2: 'm²',
    cm2: 'cm²',
    mm2: 'mm²',
    in2: 'in²',
    ft2: 'ft²'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInWeber = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInWeber / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateFluxDensity = () => {
    if (!value || !area || isNaN(value) || isNaN(area)) return null;
    
    const fluxInWeber = value * conversionFactors[unit];
    const areaInSquareMeters = area * areaConversion[areaUnit];
    
    // Flux density (B) = Φ / A (Tesla = Weber / m²)
    const fluxDensity = fluxInWeber / areaInSquareMeters;
    return fluxDensity;
  };

  const results = convertValue(value, unit);
  const fluxDensity = calculateFluxDensity();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Magnetic Flux Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Magnetic Flux
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
                {Object.keys(conversionFactors).map((u) => (
                  <option key={u} value={u}>{unitDisplayNames[u]}</option>
                ))}
              </select>
            </div>

            {/* Area Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (for Flux Density)
              </label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Enter area"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(areaConversion).map((u) => (
                  <option key={u} value={u}>{areaDisplayNames[u]}</option>
                ))}
              </select>
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
              
              {fluxDensity && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Flux Density:</h2>
                  <p>Tesla (T): {fluxDensity.toExponential(4)}</p>
                  <p>Gauss (G): {(fluxDensity * 1e4).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    B = Φ / A
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
              <li>1 Wb = 10⁸ Mx</li>
              <li>1 Wb = 10⁸ lines</li>
              <li>1 kMx = 10³ Mx</li>
              <li>1 MMx = 10⁶ Mx</li>
              <li>1 T = 1 Wb/m²</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default MagneticFluxConverter;