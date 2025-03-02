'use client';

import React, { useState } from 'react';

const ChargeConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('C');
  const [current, setCurrent] = useState('');
  const [currentUnit, setCurrentUnit] = useState('A');
  const [time, setTime] = useState('');
  const [timeUnit, setTimeUnit] = useState('s');

  // Conversion factors to Coulomb (C)
  const conversionFactors = {
    C: 1,              // Coulomb
    mC: 1e-3,         // Millicoulomb
    uC: 1e-6,         // Microcoulomb
    nC: 1e-9,         // Nanocoulomb
    pC: 1e-12,        // Picocoulomb
    Ah: 3600,         // Ampere-hour
    mAh: 3.6,         // Milliampere-hour
    e: 1.60217662e-19 // Elementary charge
  };

  // Display names for charge units
  const unitDisplayNames = {
    C: 'C',
    mC: 'mC',
    uC: 'μC',
    nC: 'nC',
    pC: 'pC',
    Ah: 'Ah',
    mAh: 'mAh',
    e: 'e'
  };

  // Current conversion factors to Ampere (A)
  const currentConversion = {
    A: 1,
    mA: 1e-3,
    uA: 1e-6,
    nA: 1e-9
  };

  const currentDisplayNames = {
    A: 'A',
    mA: 'mA',
    uA: 'μA',
    nA: 'nA'
  };

  // Time conversion factors to seconds (s)
  const timeConversion = {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400
  };

  const timeDisplayNames = {
    s: 's',
    min: 'min',
    h: 'h',
    d: 'd'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInCoulomb = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInCoulomb / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateChargeFromCurrent = () => {
    if (!current || !time || isNaN(current) || isNaN(time)) return null;
    
    const currentInAmpere = current * currentConversion[currentUnit];
    const timeInSeconds = time * timeConversion[timeUnit];
    
    // Charge (Q) = I × t (Coulomb = Ampere × seconds)
    const charge = currentInAmpere * timeInSeconds;
    return charge;
  };

  const results = convertValue(value, unit);
  const calculatedCharge = calculateChargeFromCurrent();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Charge Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charge
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter charge"
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

            {/* Current and Time Section */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current (for Q = I × t)
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="number"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="Enter time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(timeConversion).map((u) => (
                    <option key={u} value={u}>{timeDisplayNames[u]}</option>
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
              
              {calculatedCharge && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Calculated Charge:</h2>
                  <p>Coulomb (C): {calculatedCharge.toExponential(4)}</p>
                  <p>Elementary charges (e): {(calculatedCharge / conversionFactors.e).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Q = I × t
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
              <li>1 C = 1 A × s</li>
              <li>1 Ah = 3600 C</li>
              <li>1 mAh = 3.6 C</li>
              <li>1 e = 1.60217662 × 10⁻¹⁹ C</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ChargeConverter;