'use client';

import React, { useState } from 'react';

const ConcentrationConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('M');
  const [volume, setVolume] = useState(''); // Volume of solution
  const [volumeUnit, setVolumeUnit] = useState('L');
  const [solventMass, setSolventMass] = useState(''); // Mass of solvent
  const [solventMassUnit, setSolventMassUnit] = useState('kg');

  // Conversion factors (base unit: moles per liter, M)
  const conversionFactors = {
    M: 1,          // Molarity (mol/L)
    m: null,       // Molality (mol/kg) - requires solvent mass
    ppm: 1e-6,     // Parts per million (assuming 1 L water ≈ 1 kg)
    ppb: 1e-9,     // Parts per billion
    mg_L: 1e-3,    // mg/L (assuming molar mass = 1 for simplicity, adjust later)
    g_L: 1,        // g/L (assuming molar mass = 1)
    percent: 0.01  // Mass percent (g solute / 100 g solution)
  };

  const unitDisplayNames = {
    M: 'M (mol/L)',
    m: 'm (mol/kg)',
    ppm: 'ppm',
    ppb: 'ppb',
    mg_L: 'mg/L',
    g_L: 'g/L',
    percent: '% (w/w)'
  };

  // Volume conversion to liters (L)
  const volumeConversion = {
    L: 1,
    mL: 1e-3,
    cm3: 1e-3,
    gal: 3.78541,
    qt: 0.946353
  };

  const volumeDisplayNames = {
    L: 'L',
    mL: 'mL',
    cm3: 'cm³',
    gal: 'gal',
    qt: 'qt'
  };

  // Mass conversion to kilograms (kg)
  const massConversion = {
    kg: 1,
    g: 1e-3,
    mg: 1e-6,
    lb: 0.453592
  };

  const massDisplayNames = {
    kg: 'kg',
    g: 'g',
    mg: 'mg',
    lb: 'lb'
  };

  const convertValue = (inputValue, fromUnit, solventMassKg = null) => {
    if (!inputValue || isNaN(inputValue)) return {};

    let valueInMolarity = inputValue;
    
    if (fromUnit === 'm' && solventMassKg) {
      // Convert molality to molarity: M = m * kg solvent / L solution
      const volumeInLiters = volume * volumeConversion[volumeUnit];
      valueInMolarity = (inputValue * solventMassKg) / volumeInLiters;
    } else if (fromUnit === 'm') {
      return { error: 'Solvent mass required for molality conversion' };
    } else {
      valueInMolarity = inputValue * conversionFactors[fromUnit];
    }

    const results = {};
    Object.keys(conversionFactors).forEach((unit) => {
      if (unit === 'm' && solventMassKg) {
        // Convert molarity to molality: m = M * L solution / kg solvent
        const volumeInLiters = volume * volumeConversion[volumeUnit];
        results[unit] = valueInMolarity * volumeInLiters / solventMassKg;
      } else if (unit !== 'm') {
        results[unit] = valueInMolarity / conversionFactors[unit];
      }
    });

    return results;
  };

  const calculateMoles = () => {
    if (!value || !volume || isNaN(value) || isNaN(volume)) return null;
    const volumeInLiters = volume * volumeConversion[volumeUnit];
    const molarity = unit === 'm' 
      ? (solventMass 
        ? (value * (solventMass * massConversion[solventMassUnit])) / volumeInLiters 
        : 0)
      : value * conversionFactors[unit];
    return molarity * volumeInLiters; // moles = M × V
  };

  const solventMassKg = solventMass ? solventMass * massConversion[solventMassUnit] : null;
  const results = convertValue(value, unit, solventMassKg);
  const moles = calculateMoles();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Concentration Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Concentration
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
                  <option key={u} value={u}>{volumeDisplayNames[u]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solvent Mass
              </label>
              <input
                type="number"
                value={solventMass}
                onChange={(e) => setSolventMass(e.target.value)}
                placeholder="For molality"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={solventMassUnit}
                onChange={(e) => setSolventMassUnit(e.target.value)}
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
                  {results.error ? (
                    <p className="text-red-600 col-span-2">{results.error}</p>
                  ) : (
                    Object.entries(results).map(([unit, val]) => (
                      val !== undefined && (
                        <p key={unit}>{unitDisplayNames[unit]}: {val.toExponential(4)}</p>
                      )
                    ))
                  )}
                </div>
              </div>

              {moles && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Total Solute:</h2>
                  <p>Moles: {moles.toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    n = C × V
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Conversion Notes</summary>
            <ul className="list-disc list-inside mt-2">
              <li>M = mol/L (molarity)</li>
              <li>m = mol/kg (molality, requires solvent mass)</li>
              <li>ppm = mg/kg ≈ mg/L for water</li>
              <li>% (w/w) = g solute / 100 g solution</li>
              <li>Conversions assume dilute aqueous solutions</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ConcentrationConverter;