'use client';

import React, { useState } from 'react';

const RadioactivityConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('Bq');
  const [halfLife, setHalfLife] = useState('');
  const [halfLifeUnit, setHalfLifeUnit] = useState('s');
  const [time, setTime] = useState('');
  const [timeUnit, setTimeUnit] = useState('s');

  // Extended conversion factors to Becquerel (Bq)
  const conversionFactors = {
    Bq: 1,
    Ci: 3.7e10,    // Curie
    dps: 1,        // Disintegrations per second
    dpm: 1/60,     // Disintegrations per minute
    mCi: 3.7e7,    // Millicurie
    μCi: 3.7e4,    // Microcurie
    nCi: 3.7e1,    // Nanocurie
    pCi: 3.7e-2,   // Picocurie
    GBq: 1e9,      // Gigabecquerel
    MBq: 1e6,      // Megabecquerel
    kBq: 1e3       // Kilobecquerel
  };

  // Time conversion factors to seconds
  const timeConversion = {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400,
    y: 31536000
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInBq = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInBq / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateDecay = () => {
    if (!value || !halfLife || !time || isNaN(value) || isNaN(halfLife) || isNaN(time)) {
      return null;
    }

    const halfLifeInSeconds = halfLife * timeConversion[halfLifeUnit];
    const timeInSeconds = time * timeConversion[timeUnit];
    const initialActivity = value * conversionFactors[unit];
    
    // A = A₀ * e^(-λt), where λ = ln(2)/T½
    const decayConstant = Math.LN2 / halfLifeInSeconds;
    const finalActivity = initialActivity * Math.exp(-decayConstant * timeInSeconds);
    
    return finalActivity;
  };

  const results = convertValue(value, unit);
  const decayedValue = calculateDecay();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Advanced Radioactivity Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity
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
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* Half-life Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Half-life
              </label>
              <input
                type="number"
                value={halfLife}
                onChange={(e) => setHalfLife(e.target.value)}
                placeholder="Enter half-life"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={halfLifeUnit}
                onChange={(e) => setHalfLifeUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="s">Seconds (s)</option>
                <option value="min">Minutes (min)</option>
                <option value="h">Hours (h)</option>
                <option value="d">Days (d)</option>
                <option value="y">Years (y)</option>
              </select>
            </div>
          </div>

          {/* Time Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Elapsed
            </label>
            <div className="flex gap-2">
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
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="s">Seconds</option>
                <option value="min">Minutes</option>
                <option value="h">Hours</option>
                <option value="d">Days</option>
                <option value="y">Years</option>
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
                    <p key={unit}>{unit}: {val.toExponential(4)}</p>
                  ))}
                </div>
              </div>
              
              {decayedValue && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">After Decay:</h2>
                  <p>Bq: {decayedValue.toExponential(4)}</p>
                  <p>Ci: {(decayedValue / conversionFactors.Ci).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Remaining: {((decayedValue / (value * conversionFactors[unit])) * 100).toFixed(2)}%
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
              <li>1 Ci = 3.7 × 10¹⁰ Bq</li>
              <li>1 Bq = 1 dps = 60 dpm</li>
              <li>1 GBq = 10⁹ Bq</li>
              <li>1 MBq = 10⁶ Bq</li>
              <li>1 kBq = 10³ Bq</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default RadioactivityConverter;