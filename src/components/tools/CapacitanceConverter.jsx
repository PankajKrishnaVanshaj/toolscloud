'use client';

import React, { useState } from 'react';

const CapacitanceConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('F');
  const [voltage, setVoltage] = useState('');

  // Conversion factors to Farad (F)
  const conversionFactors = {
    F: 1,          // Farad
    mF: 1e-3,      // Millifarad
    uF: 1e-6,      // Microfarad
    nF: 1e-9,      // Nanofarad
    pF: 1e-12,     // Picofarad
    kF: 1e3,       // Kilofarad
    aF: 1e-18,     // Attofarad
    abF: 1e9,      // Abfarad (electromagnetic unit)
    statF: 1.11265e-12  // Statfarad (electrostatic unit)
  };

  // Display names for units
  const unitDisplayNames = {
    F: 'F',
    mF: 'mF',
    uF: 'μF',
    nF: 'nF',
    pF: 'pF',
    kF: 'kF',
    aF: 'aF',
    abF: 'abF',
    statF: 'statF'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInFarad = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInFarad / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateEnergy = () => {
    if (!value || !voltage || isNaN(value) || isNaN(voltage)) return null;
    
    const capacitanceInFarad = value * conversionFactors[unit];
    const voltageInVolts = parseFloat(voltage);
    
    // Energy (E) = ½ × C × V² (in Joules)
    const energy = 0.5 * capacitanceInFarad * voltageInVolts * voltageInVolts;
    return energy;
  };

  const results = convertValue(value, unit);
  const storedEnergy = calculateEnergy();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Capacitance Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacitance
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter capacitance"
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

            {/* Voltage Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voltage (for Energy)
              </label>
              <input
                type="number"
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                placeholder="Enter voltage (V)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 text-sm text-gray-500">
                Voltage in Volts (V)
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
              
              {storedEnergy && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Stored Energy:</h2>
                  <p>Joules (J): {storedEnergy.toExponential(4)}</p>
                  <p>Electronvolts (eV): {(storedEnergy * 6.242e18).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    E = ½ × C × V²
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
              <li>1 F = 10³ mF = 10⁶ μF</li>
              <li>1 F = 10⁹ nF = 10¹² pF</li>
              <li>1 kF = 10³ F</li>
              <li>1 abF = 10⁹ F</li>
              <li>1 statF ≈ 1.11265 × 10⁻¹² F</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default CapacitanceConverter;