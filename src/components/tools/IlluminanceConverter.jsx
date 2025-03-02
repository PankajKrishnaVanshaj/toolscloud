'use client';

import React, { useState } from 'react';

const IlluminanceConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('lx');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('m2');

  // Conversion factors to Lux (lx)
  const conversionFactors = {
    lx: 1,          // Lux
    fc: 10.76391,   // Foot-candle
    ph: 1e4,        // Phot
    nx: 1e-3,       // Nox
    lm_m2: 1,       // Lumen per square meter (equivalent to Lux)
    lm_cm2: 1e4,    // Lumen per square centimeter
    lm_ft2: 10.76391 // Lumen per square foot (equivalent to Foot-candle)
  };

  // Display names for units
  const unitDisplayNames = {
    lx: 'lx',
    fc: 'fc',
    ph: 'ph',
    nx: 'nx',
    lm_m2: 'lm/m²',
    lm_cm2: 'lm/cm²',
    lm_ft2: 'lm/ft²'
  };

  // Area conversion factors to square meters (m²)
  const areaConversion = {
    m2: 1,
    cm2: 1e-4,
    mm2: 1e-6,
    ft2: 9.2903e-2,
    in2: 6.4516e-4
  };

  const areaDisplayNames = {
    m2: 'm²',
    cm2: 'cm²',
    mm2: 'mm²',
    ft2: 'ft²',
    in2: 'in²'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInLux = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInLux / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateLuminousFlux = () => {
    if (!value || !area || isNaN(value) || isNaN(area)) return null;
    
    const illuminanceInLux = value * conversionFactors[unit];
    const areaInSquareMeters = area * areaConversion[areaUnit];
    
    // Luminous flux (Φv) = E × A (Lumens = Lux × m²)
    const luminousFlux = illuminanceInLux * areaInSquareMeters;
    return luminousFlux;
  };

  const results = convertValue(value, unit);
  const luminousFlux = calculateLuminousFlux();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Illuminance Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Illuminance
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
                Area (for Flux)
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
              
              {luminousFlux && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Luminous Flux:</h2>
                  <p>Lumens (lm): {luminousFlux.toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Φv = E × A
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
              <li>1 lx = 1 lm/m²</li>
              <li>1 fc = 10.76391 lx</li>
              <li>1 ph = 10⁴ lx</li>
              <li>1 nx = 10⁻³ lx</li>
              <li>1 lm/ft² = 10.76391 lx</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default IlluminanceConverter;