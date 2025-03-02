'use client';

import React, { useState } from 'react';

const MomentOfInertiaConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('kg_m2');
  const [shape, setShape] = useState('none');
  const [mass, setMass] = useState('');
  const [length, setLength] = useState('');
  const [lengthUnit, setLengthUnit] = useState('m');

  // Conversion factors to kg·m²
  const conversionFactors = {
    kg_m2: 1,          // kg·m²
    g_cm2: 1e-7,       // g·cm²
    kg_cm2: 1e-4,      // kg·cm²
    lb_ft2: 0.042140,  // lb·ft²
    lb_in2: 2.926e-4,  // lb·in²
    oz_in2: 1.829e-5   // oz·in²
  };

  const unitDisplayNames = {
    kg_m2: 'kg·m²',
    g_cm2: 'g·cm²',
    kg_cm2: 'kg·cm²',
    lb_ft2: 'lb·ft²',
    lb_in2: 'lb·in²',
    oz_in2: 'oz·in²'
  };

  // Length conversion factors to meters
  const lengthConversion = {
    m: 1,
    cm: 0.01,
    mm: 0.001,
    ft: 0.3048,
    in: 0.0254
  };

  const lengthDisplayNames = {
    m: 'm',
    cm: 'cm',
    mm: 'mm',
    ft: 'ft',
    in: 'in'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInKgM2 = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInKgM2 / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateMomentOfInertia = () => {
    if (!mass || !length || isNaN(mass) || isNaN(length)) return null;
    
    const massInKg = parseFloat(mass);
    const lengthInMeters = parseFloat(length) * lengthConversion[lengthUnit];
    
    switch (shape) {
      case 'point': // I = m * r² (point mass)
        return massInKg * lengthInMeters * lengthInMeters;
      case 'rod_center': // I = (1/12) * m * L² (rod about center)
        return (1/12) * massInKg * lengthInMeters * lengthInMeters;
      case 'rod_end': // I = (1/3) * m * L² (rod about end)
        return (1/3) * massInKg * lengthInMeters * lengthInMeters;
      case 'disk': // I = (1/2) * m * r² (disk about center)
        return (1/2) * massInKg * lengthInMeters * lengthInMeters;
      default:
        return null;
    }
  };

  const results = convertValue(value, unit);
  const calculatedInertia = calculateMomentOfInertia();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Moment of Inertia Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moment of Inertia
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

            {/* Shape Calculator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calculate for Shape
              </label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">Select Shape</option>
                <option value="point">Point Mass</option>
                <option value="rod_center">Rod (Center)</option>
                <option value="rod_end">Rod (End)</option>
                <option value="disk">Disk (Center)</option>
              </select>
            </div>
          </div>

          {/* Shape Parameters */}
          {shape !== 'none' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mass (kg)
                </label>
                <input
                  type="number"
                  value={mass}
                  onChange={(e) => setMass(e.target.value)}
                  placeholder="Enter mass"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {shape === 'point' ? 'Distance (r)' : 'Length (L or r)'}
                </label>
                <div className="flex gap-2">
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
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(lengthConversion).map((u) => (
                      <option key={u} value={u}>{lengthDisplayNames[u]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {(value || calculatedInertia) && (
            <div className="grid gap-4 md:grid-cols-2">
              {value && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>{unitDisplayNames[unit]}: {val.toExponential(4)}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {calculatedInertia && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Calculated Inertia:</h2>
                  <p>kg·m²: {calculatedInertia.toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Formula: {shape === 'point' ? 'I = m·r²' : 
                             shape === 'rod_center' ? 'I = (1/12)·m·L²' :
                             shape === 'rod_end' ? 'I = (1/3)·m·L²' :
                             'I = (1/2)·m·r²'}
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
              <li>1 kg·m² = 10⁴ kg·cm²</li>
              <li>1 kg·m² = 10⁷ g·cm²</li>
              <li>1 kg·m² ≈ 23.730 lb·ft²</li>
              <li>1 lb·ft² ≈ 0.042140 kg·m²</li>
              <li>1 lb·in² ≈ 2.926 × 10⁻⁴ kg·m²</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default MomentOfInertiaConverter;