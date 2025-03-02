'use client';

import React, { useState } from 'react';

const FuelEfficiencyConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('mpg_us');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('mi');

  // Conversion factors to MPG (US)
  const conversionFactors = {
    mpg_us: 1,              // Miles per gallon (US)
    mpg_imp: 1.20095,       // Miles per gallon (Imperial)
    km_l: 2.35215,          // Kilometers per liter
    l_100km: (value) => 235.215 / value,  // Liters per 100 kilometers (reciprocal)
    mi_l: 0.425144          // Miles per liter
  };

  // Distance conversion factors to miles
  const distanceConversion = {
    mi: 1,
    km: 0.621371,
    m: 0.000621371
  };

  // Display names for units
  const unitDisplayNames = {
    mpg_us: 'MPG (US)',
    mpg_imp: 'MPG (Imperial)',
    km_l: 'km/L',
    l_100km: 'L/100km',
    mi_l: 'mi/L'
  };

  const distanceDisplayNames = {
    mi: 'Miles (mi)',
    km: 'Kilometers (km)',
    m: 'Meters (m)'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue) || inputValue <= 0) return {};
    
    let valueInMpgUs;
    if (fromUnit === 'l_100km') {
      valueInMpgUs = conversionFactors.l_100km(inputValue);
    } else {
      valueInMpgUs = inputValue * conversionFactors[fromUnit];
    }

    const results = {};
    Object.keys(conversionFactors).forEach((unit) => {
      if (unit === 'l_100km') {
        results[unit] = 235.215 / valueInMpgUs;
      } else {
        results[unit] = valueInMpgUs / conversionFactors[unit];
      }
    });
    return results;
  };

  const calculateFuelNeeded = () => {
    if (!value || !distance || isNaN(value) || isNaN(distance) || value <= 0 || distance <= 0) return null;
    
    const efficiencyInMpgUs = unit === 'l_100km' 
      ? conversionFactors.l_100km(value) 
      : value * conversionFactors[unit];
    const distanceInMiles = distance * distanceConversion[distanceUnit];
    
    // Fuel needed (gallons US) = Distance (miles) / Efficiency (mpg US)
    const fuelGallonsUs = distanceInMiles / efficiencyInMpgUs;
    return {
      gallons_us: fuelGallonsUs,
      gallons_imp: fuelGallonsUs / 1.20095,
      liters: fuelGallonsUs * 3.78541
    };
  };

  const results = convertValue(value, unit);
  const fuelNeeded = calculateFuelNeeded();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Fuel Efficiency Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Efficiency
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

            {/* Distance Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance (for Fuel Calc)
              </label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Enter distance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(distanceConversion).map((u) => (
                  <option key={u} value={u}>{distanceDisplayNames[u]}</option>
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
                    <p key={unit}>{unitDisplayNames[unit]}: {val.toFixed(2)}</p>
                  ))}
                </div>
              </div>
              
              {fuelNeeded && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Fuel Needed:</h2>
                  <p>Gallons (US): {fuelNeeded.gallons_us.toFixed(2)}</p>
                  <p>Gallons (Imp): {fuelNeeded.gallons_imp.toFixed(2)}</p>
                  <p>Liters: {fuelNeeded.liters.toFixed(2)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Fuel = Distance ÷ Efficiency
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
              <li>1 MPG (US) = 0.425144 km/L</li>
              <li>1 MPG (US) = 1.20095 MPG (Imp)</li>
              <li>1 km/L = 2.35215 MPG (US)</li>
              <li>L/100km = 235.215 ÷ MPG (US)</li>
              <li>1 Gallon (US) = 3.78541 L</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default FuelEfficiencyConverter;