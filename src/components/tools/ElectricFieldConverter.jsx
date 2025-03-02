'use client';

import React, { useState } from 'react';

const ElectricFieldConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('V_m');
  const [charge, setCharge] = useState('');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('m');

  // Conversion factors to V/m (Volts per meter)
  const conversionFactors = {
    V_m: 1,          // Volts per meter
    V_cm: 1e2,       // Volts per centimeter
    V_mm: 1e3,       // Volts per millimeter
    kV_m: 1e3,       // Kilovolts per meter
    MV_m: 1e6,       // Megavolts per meter
    N_C: 1,          // Newtons per Coulomb (equivalent to V/m)
    statV_cm: 299.792458 // Statvolts per centimeter (1 statV/cm ≈ 299.792458 V/m)
  };

  const unitDisplayNames = {
    V_m: 'V/m',
    V_cm: 'V/cm',
    V_mm: 'V/mm',
    kV_m: 'kV/m',
    MV_m: 'MV/m',
    N_C: 'N/C',
    statV_cm: 'statV/cm'
  };

  // Distance conversion factors to meters
  const distanceConversion = {
    m: 1,
    cm: 1e-2,
    mm: 1e-3,
    km: 1e3,
    in: 2.54e-2
  };

  const distanceDisplayNames = {
    m: 'm',
    cm: 'cm',
    mm: 'mm',
    km: 'km',
    in: 'in'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInV_m = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInV_m / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateElectricField = () => {
    if (!charge || !distance || isNaN(charge) || isNaN(distance)) return null;
    
    const chargeInCoulombs = parseFloat(charge); // Assuming input in Coulombs
    const distanceInMeters = distance * distanceConversion[distanceUnit];
    
    // Coulomb's law: E = k * |q| / r², where k = 8.9875517923 × 10⁹ N·m²/C²
    const k = 8.9875517923e9; // Coulomb's constant
    const electricField = k * Math.abs(chargeInCoulombs) / (distanceInMeters * distanceInMeters);
    return electricField; // Returns in V/m
  };

  const results = convertValue(value, unit);
  const calculatedField = calculateElectricField();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Electric Field Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Electric Field Strength
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

            {/* Charge and Distance Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charge (Coulombs)
              </label>
              <input
                type="number"
                value={charge}
                onChange={(e) => setCharge(e.target.value)}
                placeholder="Enter charge"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">
                Distance
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="Enter distance"
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
                  <p>V/m: {calculatedField.toExponential(4)}</p>
                  <p>N/C: {calculatedField.toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    E = k × |q| / r²
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
              <li>1 V/m = 1 N/C</li>
              <li>1 V/cm = 10² V/m</li>
              <li>1 kV/m = 10³ V/m</li>
              <li>1 MV/m = 10⁶ V/m</li>
              <li>1 statV/cm ≈ 299.792458 V/m</li>
              <li>k = 8.9875517923 × 10⁹ N·m²/C²</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ElectricFieldConverter;