'use client';

import React, { useState } from 'react';

const FlowRateConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('m3_s');
  const [density, setDensity] = useState('');
  const [densityUnit, setDensityUnit] = useState('kg_m3');

  // Volume flow rate conversion factors to cubic meters per second (m³/s)
  const volumeFlowFactors = {
    m3_s: 1,          // Cubic meters per second
    m3_h: 1 / 3600,   // Cubic meters per hour
    L_s: 0.001,       // Liters per second
    L_min: 0.001 / 60, // Liters per minute
    L_h: 0.001 / 3600, // Liters per hour
    gal_s: 0.0037854118,     // US gallons per second
    gal_min: 0.0037854118 / 60, // US gallons per minute
    ft3_s: 0.0283168466,     // Cubic feet per second
    ft3_min: 0.0283168466 / 60  // Cubic feet per minute
  };

  // Mass flow rate conversion factors to kilograms per second (kg/s)
  const massFlowFactors = {
    kg_s: 1,          // Kilograms per second
    kg_h: 1 / 3600,   // Kilograms per hour
    g_s: 0.001,       // Grams per second
    lb_s: 0.45359237, // Pounds per second
    lb_h: 0.45359237 / 3600, // Pounds per hour
    t_h: 1000 / 3600  // Tonnes per hour
  };

  // Density conversion factors to kg/m³
  const densityFactors = {
    kg_m3: 1,         // Kilograms per cubic meter
    g_cm3: 1000,      // Grams per cubic centimeter
    kg_L: 1000,       // Kilograms per liter
    lb_ft3: 16.018463 // Pounds per cubic foot
  };

  const densityDisplayNames = {
    kg_m3: 'kg/m³',
    g_cm3: 'g/cm³',
    kg_L: 'kg/L',
    lb_ft3: 'lb/ft³'
  };

  const convertVolumeFlow = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInM3s = inputValue * volumeFlowFactors[fromUnit];
    
    return Object.keys(volumeFlowFactors).reduce((acc, unit) => {
      acc[unit] = valueInM3s / volumeFlowFactors[unit];
      return acc;
    }, {});
  };

  const convertMassFlow = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInKgs = inputValue * massFlowFactors[fromUnit];
    
    return Object.keys(massFlowFactors).reduce((acc, unit) => {
      acc[unit] = valueInKgs / massFlowFactors[unit];
      return acc;
    }, {});
  };

  const convertBetweenFlowTypes = () => {
    if (!value || !density || isNaN(value) || isNaN(density)) return null;
    
    const densityInKgM3 = density * densityFactors[densityUnit];
    const isVolumeUnit = unit in volumeFlowFactors;
    
    if (isVolumeUnit) {
      // Volume to Mass: kg/s = m³/s × kg/m³
      const volumeFlowInM3s = value * volumeFlowFactors[unit];
      const massFlowInKgs = volumeFlowInM3s * densityInKgM3;
      return convertMassFlow(massFlowInKgs, 'kg_s');
    } else {
      // Mass to Volume: m³/s = kg/s ÷ kg/m³
      const massFlowInKgs = value * massFlowFactors[unit];
      const volumeFlowInM3s = massFlowInKgs / densityInKgM3;
      return convertVolumeFlow(volumeFlowInM3s, 'm3_s');
    }
  };

  const volumeResults = unit in volumeFlowFactors ? convertVolumeFlow(value, unit) : null;
  const massResults = unit in massFlowFactors ? convertMassFlow(value, unit) : null;
  const convertedResults = convertBetweenFlowTypes();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Flow Rate Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flow Rate
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
                <optgroup label="Volume Flow Rates">
                  {Object.keys(volumeFlowFactors).map((u) => (
                    <option key={u} value={u}>{u.replace('_', '/')}</option>
                  ))}
                </optgroup>
                <optgroup label="Mass Flow Rates">
                  {Object.keys(massFlowFactors).map((u) => (
                    <option key={u} value={u}>{u.replace('_', '/')}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Density Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Density (for conversion)
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
                  <option key={u} value={u}>{densityDisplayNames[u]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">
                  {unit in volumeFlowFactors ? 'Volume Flow Rates:' : 'Mass Flow Rates:'}
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {volumeResults && Object.entries(volumeResults).map(([unit, val]) => (
                    <p key={unit}>{unit.replace('_', '/')}: {val.toExponential(4)}</p>
                  ))}
                  {massResults && Object.entries(massResults).map(([unit, val]) => (
                    <p key={unit}>{unit.replace('_', '/')}: {val.toExponential(4)}</p>
                  ))}
                </div>
              </div>

              {convertedResults && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">
                    {unit in volumeFlowFactors ? 'Converted Mass Flow:' : 'Converted Volume Flow:'}
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {convertedResults && Object.entries(convertedResults).map(([unit, val]) => (
                      <p key={unit}>{unit.replace('_', '/')}: {val.toExponential(4)}</p>
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
              <li>1 m³/s = 3600 m³/h</li>
              <li>1 L/s = 0.001 m³/s</li>
              <li>1 gal/s = 3.7854118 L/s</li>
              <li>1 ft³/s = 28.3168466 L/s</li>
              <li>1 kg/s = 3600 kg/h</li>
              <li>1 lb/s = 0.45359237 kg/s</li>
              <li>Mass Flow = Volume Flow × Density</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default FlowRateConverter;