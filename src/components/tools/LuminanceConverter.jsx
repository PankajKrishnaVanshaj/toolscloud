'use client';

import React, { useState } from 'react';

const LuminanceConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('cd_m2');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('m2');

  // Conversion factors to candela per square meter (cd/m²)
  const conversionFactors = {
    cd_m2: 1,          // Candela per square meter (nit)
    fL: 3.426,        // Foot-lambert
    nt: 1,            // Nit (same as cd/m²)
    mL: 3.183e-3,     // Millilambert
    L: 3.183,         // Lambert
    sb: 1e4,          // Stilb
    cd_cm2: 1e4,      // Candela per square centimeter
    cd_ft2: 10.764,   // Candela per square foot
    cd_in2: 1550      // Candela per square inch
  };

  // Display names for units
  const unitDisplayNames = {
    cd_m2: 'cd/m²',
    fL: 'fL',
    nt: 'nt',
    mL: 'mL',
    L: 'L',
    sb: 'sb',
    cd_cm2: 'cd/cm²',
    cd_ft2: 'cd/ft²',
    cd_in2: 'cd/in²'
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
    const valueInCdM2 = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInCdM2 / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateIlluminance = () => {
    if (!value || !area || isNaN(value) || isNaN(area)) return null;
    
    const luminanceInCdM2 = value * conversionFactors[unit];
    const areaInSquareMeters = area * areaConversion[areaUnit];
    
    // Illuminance (E) = L × A (lux = cd/m² × m²)
    const illuminance = luminanceInCdM2 * areaInSquareMeters;
    return illuminance;
  };

  const results = convertValue(value, unit);
  const illuminance = calculateIlluminance();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Luminance Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Luminance
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
                Area (for Illuminance)
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
              
              {illuminance && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Illuminance:</h2>
                  <p>Lux (lx): {illuminance.toExponential(4)}</p>
                  <p>Foot-candles (fc): {(illuminance / 10.764).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    E = L × A
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
              <li>1 cd/m² = 1 nit</li>
              <li>1 cd/m² = 0.2919 fL</li>
              <li>1 L = 3,183 cd/m²</li>
              <li>1 sb = 10⁴ cd/m²</li>
              <li>1 lx = 0.0929 fc</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default LuminanceConverter;