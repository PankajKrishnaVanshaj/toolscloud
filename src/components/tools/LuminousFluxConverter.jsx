'use client';

import React, { useState } from 'react';

const LuminousFluxConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('lm');
  const [solidAngle, setSolidAngle] = useState('');
  const [angleUnit, setAngleUnit] = useState('sr');

  // Conversion factors to Lumens (lm)
  const conversionFactors = {
    lm: 1,          // Lumen
    mlm: 1e-3,      // Millilumen
    ulm: 1e-6,      // Microlumen
    cd_sr: 1,       // Candela-steradian (equivalent to lumen)
    lx_m2: 1,       // Lux square meter
    ph: 1e4,        // Phot (1 ph = 10,000 lm)
    nox: 1e-3       // Nox (1 nox = 0.001 lm)
  };

  const unitDisplayNames = {
    lm: 'lm',
    mlm: 'mlm',
    ulm: 'μlm',
    cd_sr: 'cd·sr',
    lx_m2: 'lx·m²',
    ph: 'ph',
    nox: 'nox'
  };

  // Solid angle conversion factors to steradians (sr)
  const angleConversion = {
    sr: 1,          // Steradian
    deg2: Math.PI / 180 * Math.PI / 180,  // Square degree
    sp: 4 * Math.PI  // Sphere (complete solid angle)
  };

  const angleDisplayNames = {
    sr: 'sr',
    deg2: 'deg²',
    sp: 'sphere'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInLumens = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInLumens / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateLuminousIntensity = () => {
    if (!value || !solidAngle || isNaN(value) || isNaN(solidAngle)) return null;
    
    const luminousFluxInLumens = value * conversionFactors[unit];
    const solidAngleInSteradians = solidAngle * angleConversion[angleUnit];
    
    // Luminous intensity (I) = Φ / Ω (candela = lumens / steradian)
    const luminousIntensity = luminousFluxInLumens / solidAngleInSteradians;
    return luminousIntensity;
  };

  const results = convertValue(value, unit);
  const luminousIntensity = calculateLuminousIntensity();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Luminous Flux Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Luminous Flux
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

            {/* Solid Angle Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solid Angle (for Intensity)
              </label>
              <input
                type="number"
                value={solidAngle}
                onChange={(e) => setSolidAngle(e.target.value)}
                placeholder="Enter solid angle"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={angleUnit}
                onChange={(e) => setAngleUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(angleConversion).map((u) => (
                  <option key={u} value={u}>{angleDisplayNames[u]}</option>
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
              
              {luminousIntensity && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Luminous Intensity:</h2>
                  <p>Candela (cd): {luminousIntensity.toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    I = Φ / Ω
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
              <li>1 lm = 1 cd·sr</li>
              <li>1 lm = 1 lx·m²</li>
              <li>1 ph = 10⁴ lm</li>
              <li>1 nox = 10⁻³ lm</li>
              <li>1 sr = (π/180)² deg² ≈ 0.0003046174 deg²</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default LuminousFluxConverter;