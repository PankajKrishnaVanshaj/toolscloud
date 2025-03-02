'use client';

import React, { useState } from 'react';

const KinematicViscosityConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('m2_s');
  const [density, setDensity] = useState('');
  const [densityUnit, setDensityUnit] = useState('kg_m3');

  // Conversion factors to m²/s
  const conversionFactors = {
    m2_s: 1,          // Square meters per second
    cm2_s: 1e-4,      // Square centimeters per second (Stokes)
    mm2_s: 1e-6,      // Square millimeters per second
    ft2_s: 9.2903e-2, // Square feet per second
    in2_s: 6.4516e-4, // Square inches per second
    St: 1e-4,         // Stokes
    cSt: 1e-6,        // Centistokes
  };

  // Display names for viscosity units
  const unitDisplayNames = {
    m2_s: 'm²/s',
    cm2_s: 'cm²/s (St)',
    mm2_s: 'mm²/s',
    ft2_s: 'ft²/s',
    in2_s: 'in²/s',
    St: 'St',
    cSt: 'cSt',
  };

  // Density conversion factors to kg/m³
  const densityConversion = {
    kg_m3: 1,         // Kilograms per cubic meter
    g_cm3: 1000,      // Grams per cubic centimeter
    lb_ft3: 16.0185,  // Pounds per cubic foot
    kg_l: 1000,       // Kilograms per liter
  };

  const densityDisplayNames = {
    kg_m3: 'kg/m³',
    g_cm3: 'g/cm³',
    lb_ft3: 'lb/ft³',
    kg_l: 'kg/L',
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInM2s = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInM2s / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateDynamicViscosity = () => {
    if (!value || !density || isNaN(value) || isNaN(density)) return null;
    
    const kinematicViscosityInM2s = value * conversionFactors[unit];
    const densityInKgM3 = density * densityConversion[densityUnit];
    
    // Dynamic viscosity (μ) = ν × ρ (Pa·s = m²/s × kg/m³)
    const dynamicViscosity = kinematicViscosityInM2s * densityInKgM3;
    return dynamicViscosity;
  };

  const results = convertValue(value, unit);
  const dynamicViscosity = calculateDynamicViscosity();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Kinematic Viscosity Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kinematic Viscosity
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

            {/* Density Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Density (for Dynamic Viscosity)
              </label>
              <input
                type="number"
                value={density}
                onChange={(e) => setDensity(e.target.value)}
                placeholder="Enter density"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={densityUnit}
                onChange={(e) => setDensityUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(densityConversion).map((u) => (
                  <option key={u} value={u}>{densityDisplayNames[u]}</option>
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
              
              {dynamicViscosity && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Dynamic Viscosity:</h2>
                  <p>Pa·s: {dynamicViscosity.toExponential(4)}</p>
                  <p>cP: {(dynamicViscosity * 1000).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    μ = ν × ρ
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
              <li>1 m²/s = 10⁴ St</li>
              <li>1 St = 10² cSt</li>
              <li>1 cm²/s = 1 St</li>
              <li>1 Pa·s = 10³ cP</li>
              <li>1 ft²/s = 929.03 St</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default KinematicViscosityConverter;