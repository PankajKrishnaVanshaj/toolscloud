'use client';

import React, { useState } from 'react';

const RadiationDoseConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('Gy');
  const [time, setTime] = useState('');
  const [timeUnit, setTimeUnit] = useState('s');

  // Conversion factors to Gray (Gy) for absorbed dose and Sievert (Sv) for equivalent dose
  const conversionFactors = {
    // Absorbed Dose
    Gy: 1,        // Gray
    rad: 0.01,    // Rad
    mGy: 1e-3,    // Milligray
    uGy: 1e-6,    // Microgray
    // Equivalent Dose
    Sv: 1,        // Sievert
    rem: 0.01,    // Rem
    mSv: 1e-3,    // Millisievert
    uSv: 1e-6     // Microsievert
  };

  // Display names for units
  const unitDisplayNames = {
    Gy: 'Gy',
    rad: 'rad',
    mGy: 'mGy',
    uGy: 'μGy',
    Sv: 'Sv',
    rem: 'rem',
    mSv: 'mSv',
    uSv: 'μSv'
  };

  // Time conversion factors to seconds
  const timeConversion = {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400,
    y: 31536000
  };

  const timeDisplayNames = {
    s: 'seconds (s)',
    min: 'minutes (min)',
    h: 'hours (h)',
    d: 'days (d)',
    y: 'years (y)'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const isEquivalentDose = ['Sv', 'rem', 'mSv', 'uSv'].includes(fromUnit);
    const baseUnit = isEquivalentDose ? 'Sv' : 'Gy';
    const valueInBase = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      const targetIsEquivalent = ['Sv', 'rem', 'mSv', 'uSv'].includes(unit);
      if (isEquivalentDose === targetIsEquivalent) {
        acc[unit] = valueInBase / conversionFactors[unit];
      }
      return acc;
    }, {});
  };

  const calculateDoseRate = () => {
    if (!value || !time || isNaN(value) || isNaN(time)) return null;
    
    const doseInBase = value * conversionFactors[unit];
    const timeInSeconds = time * timeConversion[timeUnit];
    const isEquivalentDose = ['Sv', 'rem', 'mSv', 'uSv'].includes(unit);
    
    // Dose rate = Dose / Time
    const doseRate = doseInBase / timeInSeconds;
    return { rate: doseRate, isEquivalent: isEquivalentDose };
  };

  const results = convertValue(value, unit);
  const doseRateResult = calculateDoseRate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Radiation Dose Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radiation Dose
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter dose"
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

            {/* Time Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exposure Time (for Dose Rate)
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

          {/* Results Section */}
          {value && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">
                  {['Sv', 'rem', 'mSv', 'uSv'].includes(unit) ? 'Equivalent Dose' : 'Absorbed Dose'} Conversions:
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    val && <p key={unit}>{unitDisplayNames[unit]}: {val.toExponential(4)}</p>
                  ))}
                </div>
              </div>
              
              {doseRateResult && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Dose Rate:</h2>
                  <p>{doseRateResult.isEquivalent ? 'Sv/s' : 'Gy/s'}: {doseRateResult.rate.toExponential(4)}</p>
                  <p>{doseRateResult.isEquivalent ? 'rem/s' : 'rad/s'}: {(doseRateResult.rate / 0.01).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Rate = Dose / Time
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
              <li>1 Gy = 100 rad</li>
              <li>1 Sv = 100 rem</li>
              <li>1 mGy = 10⁻³ Gy</li>
              <li>1 μSv = 10⁻⁶ Sv</li>
              <li>Absorbed Dose (Gy) ≠ Equivalent Dose (Sv)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default RadiationDoseConverter;