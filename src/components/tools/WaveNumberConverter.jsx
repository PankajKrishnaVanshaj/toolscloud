'use client';

import React, { useState } from 'react';

const WaveNumberConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('cm-1');
  const [mediumIndex, setMediumIndex] = useState('1'); // Refractive index of medium

  // Conversion factors to cm⁻¹ (wavenumber)
  const conversionFactors = {
    'cm-1': 1,           // Wavenumber in cm⁻¹
    'm-1': 100,         // Wavenumber in m⁻¹
    'mm-1': 10,         // Wavenumber in mm⁻¹
    'um-1': 1e4,        // Wavenumber in μm⁻¹
    'nm-1': 1e7         // Wavenumber in nm⁻¹
  };

  // Display names for units
  const unitDisplayNames = {
    'cm-1': 'cm⁻¹',
    'm-1': 'm⁻¹',
    'mm-1': 'mm⁻¹',
    'um-1': 'μm⁻¹',
    'nm-1': 'nm⁻¹'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInCmInverse = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInCmInverse / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateRelatedProperties = () => {
    if (!value || isNaN(value) || !mediumIndex || isNaN(mediumIndex)) return null;
    
    const wavenumberCmInverse = value * conversionFactors[unit];
    const refractiveIndex = parseFloat(mediumIndex);
    const speedOfLight = 2.99792458e8; // m/s
    
    // Wavelength in vacuum (λ = 1/ν̃ in cm)
    const wavelengthCm = 1 / wavenumberCmInverse;
    
    // Wavelength in medium (λ_medium = λ_vacuum / n)
    const wavelengthMediumCm = wavelengthCm / refractiveIndex;
    
    // Frequency (f = c/λ, convert cm to m for SI units)
    const frequencyHz = speedOfLight / (wavelengthCm * 1e-2);
    
    return {
      wavelengthVacuumCm: wavelengthCm,
      wavelengthMediumCm: wavelengthMediumCm,
      frequencyHz: frequencyHz
    };
  };

  const results = convertValue(value, unit);
  const properties = calculateRelatedProperties();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Wave Number Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wave Number
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

            {/* Refractive Index Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refractive Index (n)
              </label>
              <input
                type="number"
                value={mediumIndex}
                onChange={(e) => setMediumIndex(e.target.value)}
                placeholder="Enter refractive index"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Default: 1 (vacuum)</p>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Wavenumber Conversions:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>{unitDisplayNames[unit]}: {val.toExponential(4)}</p>
                  ))}
                </div>
              </div>
              
              {properties && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Related Properties:</h2>
                  <div className="space-y-2 text-sm">
                    <p>Wavelength (vacuum): {(properties.wavelengthVacuumCm * 1e7).toExponential(4)} nm</p>
                    <p>Wavelength (medium): {(properties.wavelengthMediumCm * 1e7).toExponential(4)} nm</p>
                    <p>Frequency: {properties.frequencyHz.toExponential(4)} Hz</p>
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
              <li>1 cm⁻¹ = 100 m⁻¹</li>
              <li>1 cm⁻¹ = 10⁴ μm⁻¹</li>
              <li>1 cm⁻¹ = 10⁷ nm⁻¹</li>
              <li>λ (cm) = 1/ν̃ (cm⁻¹)</li>
              <li>f = c/λ</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default WaveNumberConverter;