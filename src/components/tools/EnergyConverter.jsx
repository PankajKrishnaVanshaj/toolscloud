'use client';

import React, { useState } from 'react';

const EnergyConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('J');
  const [time, setTime] = useState('');
  const [timeUnit, setTimeUnit] = useState('s');

  // Conversion factors to Joules (J)
  const conversionFactors = {
    J: 1,              // Joule
    kJ: 1e3,          // Kilojoule
    MJ: 1e6,          // Megajoule
    GJ: 1e9,          // Gigajoule
    Wh: 3600,         // Watt-hour
    kWh: 3.6e6,       // Kilowatt-hour
    MWh: 3.6e9,       // Megawatt-hour
    eV: 1.60218e-19,  // Electronvolt
    keV: 1.60218e-16, // Kiloelectronvolt
    MeV: 1.60218e-13, // Megaelectronvolt
    cal: 4.184,       // Calorie
    kcal: 4184,       // Kilocalorie
    erg: 1e-7         // Erg
  };

  // Display names for units
  const unitDisplayNames = {
    J: 'J',
    kJ: 'kJ',
    MJ: 'MJ',
    GJ: 'GJ',
    Wh: 'Wh',
    kWh: 'kWh',
    MWh: 'MWh',
    eV: 'eV',
    keV: 'keV',
    MeV: 'MeV',
    cal: 'cal',
    kcal: 'kcal',
    erg: 'erg'
  };

  // Time conversion factors to seconds (s)
  const timeConversion = {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400,
    y: 31536000
  };

  const timeDisplayNames = {
    s: 's',
    min: 'min',
    h: 'h',
    d: 'd',
    y: 'y'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInJoules = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInJoules / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculatePower = () => {
    if (!value || !time || isNaN(value) || isNaN(time)) return null;
    
    const energyInJoules = value * conversionFactors[unit];
    const timeInSeconds = time * timeConversion[timeUnit];
    
    // Power (P) = Energy / Time (Watts = Joules / Seconds)
    const powerInWatts = energyInJoules / timeInSeconds;
    return powerInWatts;
  };

  const results = convertValue(value, unit);
  const power = calculatePower();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Energy Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Energy
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter energy value"
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
                Time (for Power)
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
                <h2 className="text-lg font-semibold mb-2">Energy Conversions:</h2>
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
                  <p>Kilowatts (kW): {(power / 1e3).toExponential(4)}</p>
                  <p>Megawatts (MW): {(power / 1e6).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    P = E / t
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
              <li>1 J = 1 Ws</li>
              <li>1 Wh = 3600 J</li>
              <li>1 cal = 4.184 J</li>
              <li>1 eV = 1.60218 × 10⁻¹⁹ J</li>
              <li>1 erg = 10⁻⁷ J</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default EnergyConverter;