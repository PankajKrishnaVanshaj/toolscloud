'use client';

import React, { useState } from 'react';

const AngleConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('deg');

  // Conversion factors to radians (base unit)
  const conversionFactors = {
    deg: Math.PI / 180,    // Degrees
    rad: 1,               // Radians
    grad: Math.PI / 200,  // Gradians (gons)
    turn: 2 * Math.PI,    // Turns (revolutions)
    arcmin: Math.PI / (180 * 60),  // Arcminutes
    arcsec: Math.PI / (180 * 3600), // Arcseconds
    mil: Math.PI / 3200   // Angular mils (NATO)
  };

  // Display names for units
  const unitDisplayNames = {
    deg: '° (degrees)',
    rad: 'rad (radians)',
    grad: 'grad (gradians)',
    turn: 'turn (revolutions)',
    arcmin: "' (arcminutes)",
    arcsec: '" (arcseconds)',
    mil: 'mil (angular mils)'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInRadians = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInRadians / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateTrigFunctions = (angleInRadians) => {
    return {
      sin: Math.sin(angleInRadians),
      cos: Math.cos(angleInRadians),
      tan: Math.tan(angleInRadians) === Infinity ? 'undefined' : Math.tan(angleInRadians)
    };
  };

  const results = convertValue(value, unit);
  const trigResults = value ? calculateTrigFunctions(value * conversionFactors[unit]) : null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Angle Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Angle
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter angle"
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
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>{unitDisplayNames[unit]}: {val.toFixed(6)}</p>
                  ))}
                </div>
              </div>
              
              {trigResults && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Trigonometric Values:</h2>
                  <div className="text-sm">
                    <p>Sin: {trigResults.sin.toFixed(6)}</p>
                    <p>Cos: {trigResults.cos.toFixed(6)}</p>
                    <p>Tan: {trigResults.tan === 'undefined' ? 'undefined' : trigResults.tan.toFixed(6)}</p>
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
              <li>1 turn = 2π rad = 360° = 400 grad</li>
              <li>1° = 60 arcmin = 3600 arcsec</li>
              <li>1 rad ≈ 57.2958°</li>
              <li>1 mil ≈ 0.05625° (NATO definition)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default AngleConverter;