'use client';

import React, { useState } from 'react';

const ViscosityConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('Pa_s');
  const [density, setDensity] = useState('');
  const [densityUnit, setDensityUnit] = useState('kg_m3');
  const [viscosityType, setViscosityType] = useState('dynamic');

  // Dynamic viscosity conversion factors to Pa·s
  const dynamicViscosityFactors = {
    Pa_s: 1,        // Pascal-second
    mPa_s: 1e-3,    // Millipascal-second
    cP: 1e-3,       // Centipoise
    P: 1e-1,        // Poise
    kg_m_s: 1,      // kg/(m·s)
    lb_ft_s: 1.488, // lb/(ft·s)
    lb_s_in2: 6894.76 // lb·s/in²
  };

  // Kinematic viscosity conversion factors to m²/s
  const kinematicViscosityFactors = {
    m2_s: 1,        // Square meter per second
    cm2_s: 1e-4,    // Square centimeter per second (Stokes)
    cSt: 1e-6,      // Centistokes
    ft2_s: 9.2903e-2, // Square feet per second
    in2_s: 6.4516e-4 // Square inches per second
  };

  // Density conversion factors to kg/m³
  const densityFactors = {
    kg_m3: 1,       // kg/m³
    g_cm3: 1000,    // g/cm³
    lb_ft3: 16.0185 // lb/ft³
  };

  const displayNames = {
    // Dynamic viscosity
    Pa_s: 'Pa·s',
    mPa_s: 'mPa·s',
    cP: 'cP',
    P: 'P',
    kg_m_s: 'kg/(m·s)',
    lb_ft_s: 'lb/(ft·s)',
    lb_s_in2: 'lb·s/in²',
    // Kinematic viscosity
    m2_s: 'm²/s',
    cm2_s: 'cm²/s (St)',
    cSt: 'cSt',
    ft2_s: 'ft²/s',
    in2_s: 'in²/s',
    // Density
    kg_m3: 'kg/m³',
    g_cm3: 'g/cm³',
    lb_ft3: 'lb/ft³'
  };

  const convertViscosity = (inputValue, fromUnit, type) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const factors = type === 'dynamic' ? dynamicViscosityFactors : kinematicViscosityFactors;
    const baseValue = inputValue * factors[fromUnit];
    
    return Object.keys(factors).reduce((acc, unit) => {
      acc[unit] = baseValue / factors[unit];
      return acc;
    }, {});
  };

  const convertBetweenTypes = () => {
    if (!value || !density || isNaN(value) || isNaN(density)) return null;
    
    const densityInKgM3 = density * densityFactors[densityUnit];
    let result = {};

    if (viscosityType === 'dynamic') {
      const dynamicInPaS = value * dynamicViscosityFactors[unit];
      const kinematicInM2S = dynamicInPaS / densityInKgM3;
      result = Object.keys(kinematicViscosityFactors).reduce((acc, unit) => {
        acc[unit] = kinematicInM2S / kinematicViscosityFactors[unit];
        return acc;
      }, {});
    } else {
      const kinematicInM2S = value * kinematicViscosityFactors[unit];
      const dynamicInPaS = kinematicInM2S * densityInKgM3;
      result = Object.keys(dynamicViscosityFactors).reduce((acc, unit) => {
        acc[unit] = dynamicInPaS / dynamicViscosityFactors[unit];
        return acc;
      }, {});
    }
    return result;
  };

  const results = convertViscosity(value, unit, viscosityType);
  const convertedResults = convertBetweenTypes();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Viscosity Converter
        </h1>

        <div className="grid gap-6">
          {/* Type Selection */}
          <div className="flex gap-4 justify-center">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={viscosityType === 'dynamic'}
                onChange={() => { setViscosityType('dynamic'); setUnit('Pa_s'); }}
                className="text-blue-500"
              />
              Dynamic
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={viscosityType === 'kinematic'}
                onChange={() => { setViscosityType('kinematic'); setUnit('m2_s'); }}
                className="text-blue-500"
              />
              Kinematic
            </label>
          </div>

          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Viscosity
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
                {Object.keys(viscosityType === 'dynamic' ? dynamicViscosityFactors : kinematicViscosityFactors)
                  .map((u) => (
                    <option key={u} value={u}>{displayNames[u]}</option>
                  ))}
              </select>
            </div>

            {/* Density Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Density (for type conversion)
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
                {Object.keys(densityFactors).map((u) => (
                  <option key={u} value={u}>{displayNames[u]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">
                  {viscosityType === 'dynamic' ? 'Dynamic' : 'Kinematic'} Viscosity:
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>{displayNames[unit]}: {val.toExponential(4)}</p>
                  ))}
                </div>
              </div>
              
              {convertedResults && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">
                    {viscosityType === 'dynamic' ? 'Kinematic' : 'Dynamic'} Viscosity:
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(convertedResults).map(([unit, val]) => (
                      <p key={unit}>{displayNames[unit]}: {val.toExponential(4)}</p>
                    ))}
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
              <li>Dynamic: 1 Pa·s = 10 P = 1000 cP</li>
              <li>Kinematic: 1 m²/s = 10⁴ St = 10⁶ cSt</li>
              <li>ν = μ/ρ (Kinematic = Dynamic/Density)</li>
              <li>1 Pa·s = 1 kg/(m·s)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ViscosityConverter;