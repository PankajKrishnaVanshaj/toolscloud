'use client';

import React, { useState } from 'react';

const SurfaceTensionConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('N_m');
  const [length, setLength] = useState('');
  const [lengthUnit, setLengthUnit] = useState('m');

  // Conversion factors to N/m (Newton per meter)
  const conversionFactors = {
    N_m: 1,           // Newton per meter
    dyn_cm: 1e-3,     // Dyne per centimeter
    mN_m: 1e-3,       // Millinewton per meter
    uN_m: 1e-6,       // Micronewton per meter
    erg_cm2: 1e-3,    // Erg per square centimeter
    lb_in: 17.4975,   // Pound-force per inch
    gf_cm: 0.980665,  // Gram-force per centimeter
    pdl_in: 2.41125   // Poundal per inch
  };

  // Display names for units
  const unitDisplayNames = {
    N_m: 'N/m',
    dyn_cm: 'dyn/cm',
    mN_m: 'mN/m',
    uN_m: 'μN/m',
    erg_cm2: 'erg/cm²',
    lb_in: 'lb/in',
    gf_cm: 'gf/cm',
    pdl_in: 'pdl/in'
  };

  // Length conversion factors to meters (m)
  const lengthConversion = {
    m: 1,
    cm: 0.01,
    mm: 0.001,
    in: 0.0254,
    ft: 0.3048
  };

  const lengthDisplayNames = {
    m: 'm',
    cm: 'cm',
    mm: 'mm',
    in: 'in',
    ft: 'ft'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInNm = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInNm / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateForce = () => {
    if (!value || !length || isNaN(value) || isNaN(length)) return null;
    
    const surfaceTensionInNm = value * conversionFactors[unit];
    const lengthInMeters = length * lengthConversion[lengthUnit];
    
    // Force = Surface Tension × Length (F = γ × L)
    const force = surfaceTensionInNm * lengthInMeters;
    return force;
  };

  const results = convertValue(value, unit);
  const force = calculateForce();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Surface Tension Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surface Tension
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

            {/* Length Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (for Force)
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="Enter length"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={lengthUnit}
                onChange={(e) => setLengthUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(lengthConversion).map((u) => (
                  <option key={u} value={u}>{lengthDisplayNames[u]}</option>
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
              
              {force && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Resulting Force:</h2>
                  <p>Newton (N): {force.toExponential(4)}</p>
                  <p>Dyne: {(force * 1e5).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    F = γ × L
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
              <li>1 N/m = 10³ dyn/cm</li>
              <li>1 N/m = 10³ erg/cm²</li>
              <li>1 N/m = 17.4975 lb/in</li>
              <li>1 N/m = 0.980665 gf/cm</li>
              <li>1 dyn/cm = 10⁻⁵ N</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default SurfaceTensionConverter;