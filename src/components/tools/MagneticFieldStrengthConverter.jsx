'use client';

import React, { useState } from 'react';

const MagneticFieldStrengthConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('A_m');
  const [current, setCurrent] = useState('');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('m');

  // Conversion factors to A/m
  const conversionFactors = {
    A_m: 1,          // Ampere per meter
    Oe: 79.57747,    // Oersted
    kA_m: 1e3,       // Kiloampere per meter
    mA_m: 1e-3,      // Milliampere per meter
    A_cm: 1e2,       // Ampere per centimeter
    G: 79.57747,     // Gauss (in vacuum, same as Oe)
    kOe: 79577.47    // Kilo-oersted
  };

  const unitDisplayNames = {
    A_m: 'A/m',
    Oe: 'Oe',
    kA_m: 'kA/m',
    mA_m: 'mA/m',
    A_cm: 'A/cm',
    G: 'G',
    kOe: 'kOe'
  };

  // Distance conversion factors to meters (m)
  const distanceConversion = {
    m: 1,
    cm: 1e-2,
    mm: 1e-3,
    in: 2.54e-2,
    ft: 0.3048
  };

  const distanceDisplayNames = {
    m: 'm',
    cm: 'cm',
    mm: 'mm',
    in: 'in',
    ft: 'ft'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInAm = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInAm / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateFieldFromCurrent = () => {
    if (!current || !distance || isNaN(current) || isNaN(distance)) return null;
    
    const currentInAmperes = parseFloat(current);
    const distanceInMeters = distance * distanceConversion[distanceUnit];
    
    // H = I / (2πr) for a straight wire (Ampere's law approximation)
    const mu0 = 4 * Math.PI * 1e-7; // Vacuum permeability (H/m)
    const fieldStrength = (mu0 * currentInAmperes) / (2 * Math.PI * distanceInMeters);
    return fieldStrength; // in A/m
  };

  const results = convertValue(value, unit);
  const calculatedField = calculateFieldFromCurrent();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Magnetic Field Strength Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Strength
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

            {/* Current and Distance Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current (for Field Calc)
              </label>
              <input
                type="number"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter current (A)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="Distance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(distanceConversion).map((u) => (
                    <option key={u} value={u}>{distanceDisplayNames[u]}</option>
                  ))}
                </select>
              </div>
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
              
              {calculatedField && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Calculated Field:</h2>
                  <p>A/m: {calculatedField.toExponential(4)}</p>
                  <p>Oe: {(calculatedField * conversionFactors.Oe).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    H = μ₀I / (2πr)
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
              <li>1 Oe = 79.57747 A/m</li>
              <li>1 A/m = 0.012566 Oe</li>
              <li>1 kA/m = 10³ A/m</li>
              <li>1 kOe = 10³ Oe</li>
              <li>1 G ≈ 1 Oe (in vacuum)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default MagneticFieldStrengthConverter;