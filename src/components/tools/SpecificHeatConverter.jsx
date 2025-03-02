'use client';

import React, { useState } from 'react';

const SpecificHeatConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('J_kgK');
  const [mass, setMass] = useState('');
  const [massUnit, setMassUnit] = useState('kg');
  const [tempChange, setTempChange] = useState('');
  const [tempUnit, setTempUnit] = useState('K');

  // Conversion factors to J/(kg·K)
  const conversionFactors = {
    J_kgK: 1,              // Joules per kilogram Kelvin
    kJ_kgK: 1e3,          // Kilojoules per kilogram Kelvin
    J_gK: 1e3,            // Joules per gram Kelvin
    cal_gC: 4186.8,       // Calories per gram Celsius
    kcal_kgC: 4186.8,     // Kilocalories per kilogram Celsius
    BTU_lbF: 4186.8,      // BTU per pound Fahrenheit
    J_kgC: 1,             // Joules per kilogram Celsius (same as J/kg·K)
  };

  const unitDisplayNames = {
    J_kgK: 'J/(kg·K)',
    kJ_kgK: 'kJ/(kg·K)',
    J_gK: 'J/(g·K)',
    cal_gC: 'cal/(g·°C)',
    kcal_kgC: 'kcal/(kg·°C)',
    BTU_lbF: 'BTU/(lb·°F)',
    J_kgC: 'J/(kg·°C)',
  };

  // Mass conversion factors to kg
  const massConversion = {
    kg: 1,
    g: 1e-3,
    lb: 0.453592,
    oz: 0.0283495,
  };

  const massDisplayNames = {
    kg: 'kg',
    g: 'g',
    lb: 'lb',
    oz: 'oz',
  };

  // Temperature change conversion factors to Kelvin
  const tempConversion = {
    K: 1,
    C: 1,        // Δ°C = ΔK
    F: 5/9,      // Δ°F = 5/9 ΔK
  };

  const tempDisplayNames = {
    K: 'K',
    C: '°C',
    F: '°F',
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInJkgK = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInJkgK / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateEnergy = () => {
    if (!value || !mass || !tempChange || isNaN(value) || isNaN(mass) || isNaN(tempChange)) {
      return null;
    }
    
    const specificHeatInJkgK = value * conversionFactors[unit];
    const massInKg = mass * massConversion[massUnit];
    const tempChangeInK = tempChange * tempConversion[tempUnit];
    
    // Q = m × c × ΔT (Joules)
    const energy = massInKg * specificHeatInJkgK * tempChangeInK;
    return energy;
  };

  const results = convertValue(value, unit);
  const energy = calculateEnergy();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Specific Heat Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Heat
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mass
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temp Change (ΔT)
              </label>
              <input
                type="number"
                value={tempChange}
                onChange={(e) => setTempChange(e.target.value)}
                placeholder="Enter ΔT"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(tempConversion).map((u) => (
                  <option key={u} value={u}>{tempDisplayNames[u]}</option>
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
              
              {energy && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Energy Required:</h2>
                  <p>Joules (J): {energy.toExponential(4)}</p>
                  <p>kJ: {(energy / 1e3).toExponential(4)}</p>
                  <p>Calories: {(energy / 4186.8).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Q = m × c × ΔT
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
              <li>1 cal/(g·°C) = 4186.8 J/(kg·K)</li>
              <li>1 BTU/(lb·°F) = 4186.8 J/(kg·K)</li>
              <li>1 kJ/(kg·K) = 1000 J/(kg·K)</li>
              <li>ΔK = Δ°C</li>
              <li>Δ°F = 5/9 × ΔK</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default SpecificHeatConverter;