'use client';

import React, { useState } from 'react';

const DensityConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('kg_m3');
  const [mass, setMass] = useState('');
  const [massUnit, setMassUnit] = useState('kg');
  const [volume, setVolume] = useState('');
  const [volumeUnit, setVolumeUnit] = useState('m3');

  // Conversion factors to kg/m³
  const conversionFactors = {
    kg_m3: 1,            // Kilograms per cubic meter
    g_cm3: 1000,         // Grams per cubic centimeter
    kg_L: 1000,          // Kilograms per liter
    g_mL: 1000,          // Grams per milliliter
    lb_ft3: 16.0185,     // Pounds per cubic foot
    lb_in3: 27679.9,     // Pounds per cubic inch
    oz_in3: 1728,        // Ounces per cubic inch
    slug_ft3: 515.379,   // Slugs per cubic foot
  };

  // Display names for density units
  const unitDisplayNames = {
    kg_m3: 'kg/m³',
    g_cm3: 'g/cm³',
    kg_L: 'kg/L',
    g_mL: 'g/mL',
    lb_ft3: 'lb/ft³',
    lb_in3: 'lb/in³',
    oz_in3: 'oz/in³',
    slug_ft3: 'slug/ft³',
  };

  // Mass conversion factors to kg
  const massConversion = {
    kg: 1,
    g: 1e-3,
    lb: 0.453592,
    oz: 0.0283495,
    slug: 14.5939,
  };

  // Volume conversion factors to m³
  const volumeConversion = {
    m3: 1,
    cm3: 1e-6,
    L: 1e-3,
    mL: 1e-6,
    ft3: 0.0283168,
    in3: 1.6387e-5,
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInKgM3 = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInKgM3 / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateMassVolume = () => {
    const results = {};
    
    if (value && volume && !mass) {
      const densityInKgM3 = value * conversionFactors[unit];
      const volumeInM3 = volume * volumeConversion[volumeUnit];
      const massInKg = densityInKgM3 * volumeInM3;
      results.mass = {
        kg: massInKg,
        g: massInKg / massConversion.g,
        lb: massInKg / massConversion.lb,
        oz: massInKg / massConversion.oz,
        slug: massInKg / massConversion.slug,
      };
    }
    
    if (value && mass && !volume) {
      const densityInKgM3 = value * conversionFactors[unit];
      const massInKg = mass * massConversion[massUnit];
      const volumeInM3 = massInKg / densityInKgM3;
      results.volume = {
        m3: volumeInM3,
        cm3: volumeInM3 / volumeConversion.cm3,
        L: volumeInM3 / volumeConversion.L,
        mL: volumeInM3 / volumeConversion.mL,
        ft3: volumeInM3 / volumeConversion.ft3,
        in3: volumeInM3 / volumeConversion.in3,
      };
    }
    
    return Object.keys(results).length ? results : null;
  };

  const results = convertValue(value, unit);
  const massVolumeResults = calculateMassVolume();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Density Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Density
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter density"
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
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume
              </label>
              <input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="Enter volume"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={volumeUnit}
                onChange={(e) => setVolumeUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(volumeConversion).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Density Conversions:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>{unitDisplayNames[unit]}: {val.toExponential(4)}</p>
                  ))}
                </div>
              </div>

              {massVolumeResults && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">
                    {massVolumeResults.mass ? 'Mass Results' : 'Volume Results'}:
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {massVolumeResults.mass ? (
                      Object.entries(massVolumeResults.mass).map(([unit, val]) => (
                        <p key={unit}>{unit}: {val.toExponential(4)}</p>
                      ))
                    ) : (
                      Object.entries(massVolumeResults.volume).map(([unit, val]) => (
                        <p key={unit}>{unit}: {val.toExponential(4)}</p>
                      ))
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    ρ = m / V
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
              <li>1 kg/m³ = 0.001 g/cm³</li>
              <li>1 g/cm³ = 1000 kg/m³</li>
              <li>1 kg/m³ = 0.062428 lb/ft³</li>
              <li>1 lb/ft³ = 16.0185 kg/m³</li>
              <li>1 slug/ft³ = 515.379 kg/m³</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DensityConverter;