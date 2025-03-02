'use client';

import React, { useState } from 'react';

const HeatCapacityConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('J_K');
  const [mass, setMass] = useState('');
  const [massUnit, setMassUnit] = useState('kg');

  // Conversion factors to J/K (Joules per Kelvin)
  const conversionFactors = {
    J_K: 1,           // Joules per Kelvin
    kJ_K: 1e3,        // Kilojoules per Kelvin
    cal_K: 4.184,     // Calories per Kelvin
    kcal_K: 4184,     // Kilocalories per Kelvin
    BTU_F: 1899.1,    // BTU per Fahrenheit (converted to J/K: 1 BTU/F × 5/9 × 3412.14 J/BTU)
    J_C: 1,           // Joules per Celsius (same as J/K)
    erg_K: 1e-7       // Ergs per Kelvin
  };

  const unitDisplayNames = {
    J_K: 'J/K',
    kJ_K: 'kJ/K',
    cal_K: 'cal/K',
    kcal_K: 'kcal/K',
    BTU_F: 'BTU/°F',
    J_C: 'J/°C',
    erg_K: 'erg/K'
  };

  // Mass conversion factors to kilograms (kg)
  const massConversion = {
    kg: 1,
    g: 1e-3,
    mg: 1e-6,
    lb: 0.453592,
    oz: 0.0283495
  };

  const massDisplayNames = {
    kg: 'kg',
    g: 'g',
    mg: 'mg',
    lb: 'lb',
    oz: 'oz'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInJK = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInJK / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateSpecificHeat = () => {
    if (!value || !mass || isNaN(value) || isNaN(mass)) return null;
    
    const heatCapacityInJK = value * conversionFactors[unit];
    const massInKg = mass * massConversion[massUnit];
    
    // Specific heat capacity = Heat capacity / mass (J/K/kg)
    const specificHeat = heatCapacityInJK / massInKg;
    return specificHeat;
  };

  const results = convertValue(value, unit);
  const specificHeat = calculateSpecificHeat();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Heat Capacity Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heat Capacity
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

            {/* Mass Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mass (for Specific Heat)
              </label>
              <input
                type="number"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                placeholder="Enter mass"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={massUnit}
                onChange={(e) => setMassUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(massConversion).map((u) => (
                  <option key={u} value={u}>{massDisplayNames[u]}</option>
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
              
              {specificHeat && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Specific Heat Capacity:</h2>
                  <p>J/(kg·K): {specificHeat.toExponential(4)}</p>
                  <p>cal/(g·K): {(specificHeat / 4184 * 1e-3).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    c = C / m
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
              <li>1 J/K = 1 J/°C</li>
              <li>1 cal/K = 4.184 J/K</li>
              <li>1 kcal/K = 4184 J/K</li>
              <li>1 BTU/°F = 1899.1 J/K</li>
              <li>1 kJ/K = 10³ J/K</li>
              <li>1 erg/K = 10⁻⁷ J/K</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default HeatCapacityConverter;