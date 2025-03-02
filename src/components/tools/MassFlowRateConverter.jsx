'use client';

import React, { useState } from 'react';

const MassFlowRateConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('kg_s');
  const [density, setDensity] = useState('');
  const [densityUnit, setDensityUnit] = useState('kg_m3');

  // Conversion factors to kg/s
  const conversionFactors = {
    kg_s: 1,          // Kilograms per second
    g_s: 1e-3,        // Grams per second
    kg_h: 1/3600,     // Kilograms per hour
    t_h: 1000/3600,   // Tonnes per hour
    lb_s: 0.453592,   // Pounds per second
    lb_h: 0.453592/3600, // Pounds per hour
    kg_min: 1/60,     // Kilograms per minute
    t_d: 1000/86400   // Tonnes per day
  };

  // Display names for mass flow rate units
  const unitDisplayNames = {
    kg_s: 'kg/s',
    g_s: 'g/s',
    kg_h: 'kg/h',
    t_h: 't/h',
    lb_s: 'lb/s',
    lb_h: 'lb/h',
    kg_min: 'kg/min',
    t_d: 't/d'
  };

  // Density conversion factors to kg/m³
  const densityConversion = {
    kg_m3: 1,          // Kilograms per cubic meter
    g_cm3: 1000,       // Grams per cubic centimeter
    kg_L: 1000,        // Kilograms per liter
    lb_ft3: 16.0185,   // Pounds per cubic foot
    g_mL: 1000         // Grams per milliliter
  };

  const densityDisplayNames = {
    kg_m3: 'kg/m³',
    g_cm3: 'g/cm³',
    kg_L: 'kg/L',
    lb_ft3: 'lb/ft³',
    g_mL: 'g/mL'
  };

  // Volume flow rate units to m³/s
  const volumeFlowUnits = {
    m3_s: 1,           // Cubic meters per second
    L_s: 1e-3,         // Liters per second
    m3_h: 1/3600,      // Cubic meters per hour
    ft3_s: 0.0283168,  // Cubic feet per second
    gal_h: 0.00378541/3600  // Gallons per hour (US)
  };

  const volumeDisplayNames = {
    m3_s: 'm³/s',
    L_s: 'L/s',
    m3_h: 'm³/h',
    ft3_s: 'ft³/s',
    gal_h: 'gal/h'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInKgS = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInKgS / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateVolumeFlow = () => {
    if (!value || !density || isNaN(value) || isNaN(density)) return null;
    
    const massFlowInKgS = value * conversionFactors[unit];
    const densityInKgM3 = density * densityConversion[densityUnit];
    
    // Volume flow rate = Mass flow rate / Density (m³/s = kg/s / kg/m³)
    const volumeFlowInM3S = massFlowInKgS / densityInKgM3;
    
    return Object.keys(volumeFlowUnits).reduce((acc, unit) => {
      acc[unit] = volumeFlowInM3S / volumeFlowUnits[unit];
      return acc;
    }, {});
  };

  const results = convertValue(value, unit);
  const volumeFlowResults = calculateVolumeFlow();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Mass Flow Rate Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mass Flow Rate
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
                Density (for Volume Flow)
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
                <h2 className="text-lg font-semibold mb-2">Mass Flow Rate:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>{unitDisplayNames[unit]}: {val.toExponential(4)}</p>
                  ))}
                </div>
              </div>
              
              {volumeFlowResults && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Volume Flow Rate:</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(volumeFlowResults).map(([unit, val]) => (
                      <p key={unit}>{volumeDisplayNames[unit]}: {val.toExponential(4)}</p>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Q = ṁ / ρ
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
              <li>1 kg/s = 3600 kg/h</li>
              <li>1 t/h = 1000 kg/h</li>
              <li>1 lb/s ≈ 0.453592 kg/s</li>
              <li>1 kg/m³ = 0.001 g/cm³</li>
              <li>1 m³/s = 1000 L/s</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default MassFlowRateConverter;