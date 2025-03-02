'use client';

import React, { useState } from 'react';

const ResistanceConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('ohm');
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');

  // Conversion factors to Ohm (Ω)
  const conversionFactors = {
    ohm: 1,         // Ohm (Ω)
    kohm: 1e3,      // Kiloohm (kΩ)
    Mohm: 1e6,      // Megaohm (MΩ)
    Gohm: 1e9,      // Gigaohm (GΩ)
    mohm: 1e-3,     // Milliohm (mΩ)
    uohm: 1e-6,     // Microohm (μΩ)
    nohm: 1e-9      // Nanoohm (nΩ)
  };

  // Display names for units
  const unitDisplayNames = {
    ohm: 'Ω',
    kohm: 'kΩ',
    Mohm: 'MΩ',
    Gohm: 'GΩ',
    mohm: 'mΩ',
    uohm: 'μΩ',
    nohm: 'nΩ'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInOhm = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInOhm / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateResistanceFromOhmsLaw = () => {
    if (!voltage || !current || isNaN(voltage) || isNaN(current) || current === '0') {
      return null;
    }
    // R = V/I (Ohm's Law)
    return parseFloat(voltage) / parseFloat(current);
  };

  const results = convertValue(value, unit);
  const calculatedResistance = calculateResistanceFromOhmsLaw();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Resistance Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resistance
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter resistance"
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
                Voltage (V)
              </label>
              <input
                type="number"
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                placeholder="Enter voltage"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-sm text-gray-500">Volts</p>
            </div>

            {/* Current Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current (I)
              </label>
              <input
                type="number"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter current"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-sm text-gray-500">Amperes</p>
            </div>
          </div>

          {/* Results Section */}
          {(value || calculatedResistance) && (
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
              
              {calculatedResistance && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Calculated Resistance (R = V/I):</h2>
                  <p>{unitDisplayNames.ohm}: {calculatedResistance.toExponential(4)}</p>
                  <p>{unitDisplayNames.kohm}: {(calculatedResistance / 1e3).toExponential(4)}</p>
                  <p>{unitDisplayNames.Mohm}: {(calculatedResistance / 1e6).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Using Ohm&apos;s Law: R = V/I
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
              <li>1 kΩ = 10³ Ω</li>
              <li>1 MΩ = 10⁶ Ω</li>
              <li>1 GΩ = 10⁹ Ω</li>
              <li>1 mΩ = 10⁻³ Ω</li>
              <li>1 μΩ = 10⁻⁶ Ω</li>
              <li>1 nΩ = 10⁻⁹ Ω</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ResistanceConverter;