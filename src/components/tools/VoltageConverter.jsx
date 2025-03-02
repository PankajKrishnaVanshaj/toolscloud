'use client';

import React, { useState } from 'react';

const VoltageConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('V');
  const [current, setCurrent] = useState('');
  const [currentUnit, setCurrentUnit] = useState('A');

  // Conversion factors to Volts (V)
  const conversionFactors = {
    V: 1,          // Volt
    mV: 1e-3,      // Millivolt
    uV: 1e-6,      // Microvolt
    nV: 1e-9,      // Nanovolt
    kV: 1e3,       // Kilovolt
    MV: 1e6,       // Megavolt
    abV: 1e-8,     // Abvolt
    statV: 299.792458  // Statvolt
  };

  // Display names for voltage units
  const unitDisplayNames = {
    V: 'V',
    mV: 'mV',
    uV: 'μV',
    nV: 'nV',
    kV: 'kV',
    MV: 'MV',
    abV: 'abV',
    statV: 'statV'
  };

  // Current conversion factors to Amperes (A)
  const currentConversion = {
    A: 1,         // Ampere
    mA: 1e-3,     // Milliampere
    uA: 1e-6,     // Microampere
    nA: 1e-9,     // Nanoampere
    kA: 1e3       // Kiloampere
  };

  const currentDisplayNames = {
    A: 'A',
    mA: 'mA',
    uA: 'μA',
    nA: 'nA',
    kA: 'kA'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInVolts = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInVolts / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculatePower = () => {
    if (!value || !current || isNaN(value) || isNaN(current)) return null;
    
    const voltageInVolts = value * conversionFactors[unit];
    const currentInAmperes = current * currentConversion[currentUnit];
    
    // Power (P) = V × I (Watts = Volts × Amperes)
    const powerInWatts = voltageInVolts * currentInAmperes;
    return powerInWatts;
  };

  const results = convertValue(value, unit);
  const power = calculatePower();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Voltage Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voltage
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter voltage"
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

            {/* Current Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current (for Power)
              </label>
              <input
                type="number"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter current"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={currentUnit}
                onChange={(e) => setCurrentUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(currentConversion).map((u) => (
                  <option key={u} value={u}>{currentDisplayNames[u]}</option>
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
              
              {power && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Power:</h2>
                  <p>Watts (W): {power.toExponential(4)}</p>
                  <p>Milliwatts (mW): {(power * 1e3).toExponential(4)}</p>
                  <p>Kilowatts (kW): {(power * 1e-3).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    P = V × I
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
              <li>1 V = 10³ mV = 10⁶ μV</li>
              <li>1 kV = 10³ V</li>
              <li>1 MV = 10⁶ V</li>
              <li>1 abV = 10⁻⁸ V</li>
              <li>1 statV ≈ 299.792458 V</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default VoltageConverter;