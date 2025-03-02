'use client';

import React, { useState } from 'react';

const PowerConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('W');
  const [time, setTime] = useState('');
  const [timeUnit, setTimeUnit] = useState('s');

  // Conversion factors to Watts (W)
  const conversionFactors = {
    W: 1,           // Watt
    kW: 1e3,        // Kilowatt
    MW: 1e6,        // Megawatt
    GW: 1e9,        // Gigawatt
    mW: 1e-3,       // Milliwatt
    hp: 745.7,      // Horsepower (mechanical)
    hp_e: 746,      // Horsepower (electric)
    erg_s: 1e-7,    // Erg per second
    ft_lb_s: 1.3558179483314004, // Foot-pound per second
    kcal_h: 1.162222222222222 // Kilocalorie per hour
  };

  // Display names for units
  const unitDisplayNames = {
    W: 'W',
    kW: 'kW',
    MW: 'MW',
    GW: 'GW',
    mW: 'mW',
    hp: 'hp (mech)',
    hp_e: 'hp (elec)',
    erg_s: 'erg/s',
    ft_lb_s: 'ft·lb/s',
    kcal_h: 'kcal/h'
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
    s: 'seconds (s)',
    min: 'minutes (min)',
    h: 'hours (h)',
    d: 'days (d)',
    y: 'years (y)'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInWatts = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInWatts / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateEnergy = () => {
    if (!value || !time || isNaN(value) || isNaN(time)) return null;
    
    const powerInWatts = value * conversionFactors[unit];
    const timeInSeconds = time * timeConversion[timeUnit];
    
    // Energy (J) = Power (W) × Time (s)
    const energyInJoules = powerInWatts * timeInSeconds;
    return energyInJoules;
  };

  const results = convertValue(value, unit);
  const energy = calculateEnergy();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Power Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Power
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter power value"
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
                Time (for Energy)
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
                <h2 className="text-lg font-semibold mb-2">Power Conversions:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>{unitDisplayNames[unit]}: {val.toExponential(4)}</p>
                  ))}
                </div>
              </div>
              
              {energy && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Energy Output:</h2>
                  <p>Joules (J): {energy.toExponential(4)}</p>
                  <p>kWh: {(energy / 3.6e6).toExponential(4)}</p>
                  <p>Calories: {(energy / 4.184).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    E = P × t
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
              <li>1 hp (mech) = 745.7 W</li>
              <li>1 hp (elec) = 746 W</li>
              <li>1 kW = 10³ W</li>
              <li>1 MW = 10⁶ W</li>
              <li>1 GW = 10⁹ W</li>
              <li>1 erg/s = 10⁻⁷ W</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default PowerConverter;