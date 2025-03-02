'use client';

import React, { useState } from 'react';

const ElectricCurrentConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('A');
  const [voltage, setVoltage] = useState('');
  const [voltageUnit, setVoltageUnit] = useState('V');

  // Conversion factors to Ampere (A)
  const conversionFactors = {
    A: 1,          // Ampere
    mA: 1e-3,      // Milliampere
    uA: 1e-6,      // Microampere
    nA: 1e-9,      // Nanoampere
    kA: 1e3,       // Kiloampere
    MA: 1e6,       // Megaampere
    abA: 10,       // Abampere (emu of current)
    statA: 3.335641e-10  // Statampere (esu of current)
  };

  // Display names for current units
  const unitDisplayNames = {
    A: 'A',
    mA: 'mA',
    uA: 'μA',
    nA: 'nA',
    kA: 'kA',
    MA: 'MA',
    abA: 'abA',
    statA: 'statA'
  };

  // Voltage conversion factors to Volt (V)
  const voltageConversion = {
    V: 1,
    mV: 1e-3,
    uV: 1e-6,
    kV: 1e3,
    MV: 1e6
  };

  const voltageDisplayNames = {
    V: 'V',
    mV: 'mV',
    uV: 'μV',
    kV: 'kV',
    MV: 'MV'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInAmpere = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInAmpere / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculatePower = () => {
    if (!value || !voltage || isNaN(value) || isNaN(voltage)) return null;
    
    const currentInAmpere = value * conversionFactors[unit];
    const voltageInVolts = voltage * voltageConversion[voltageUnit];
    
    // Power (P) = I × V (Watts = Amperes × Volts)
    const power = currentInAmpere * voltageInVolts;
    return power;
  };

  const results = convertValue(value, unit);
  const power = calculatePower();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Electric Current Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter current"
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
                Voltage (for Power)
              </label>
              <input
                type="number"
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                placeholder="Enter voltage"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={voltageUnit}
                onChange={(e) => setVoltageUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(voltageConversion).map((u) => (
                  <option key={u} value={u}>{voltageDisplayNames[u]}</option>
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
                    P = I × V
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
              <li>1 A = 10³ mA = 10⁶ μA</li>
              <li>1 kA = 10³ A</li>
              <li>1 abA = 10 A</li>
              <li>1 statA ≈ 3.335641 × 10⁻¹⁰ A</li>
              <li>1 W = 1 A × 1 V</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ElectricCurrentConverter;