'use client';

import React, { useState } from 'react';

const ForceConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('N');
  const [mass, setMass] = useState('');
  const [massUnit, setMassUnit] = useState('kg');
  const [acceleration, setAcceleration] = useState('');
  const [accUnit, setAccUnit] = useState('m_s2');

  // Conversion factors to Newton (N)
  const conversionFactors = {
    N: 1,           // Newton
    dyn: 1e-5,      // Dyne
    lbf: 4.448222,  // Pound-force
    pdl: 0.138255,  // Poundal
    kp: 9.80665,    // Kilopond (kilogram-force)
    gf: 0.00980665, // Gram-force
    tf: 9806.65,    // Ton-force (metric)
    ozf: 0.2780139  // Ounce-force
  };

  // Display names for force units
  const unitDisplayNames = {
    N: 'N',
    dyn: 'dyn',
    lbf: 'lbf',
    pdl: 'pdl',
    kp: 'kp',
    gf: 'gf',
    tf: 'tf',
    ozf: 'ozf'
  };

  // Mass conversion factors to kilograms (kg)
  const massConversion = {
    kg: 1,
    g: 1e-3,
    lb: 0.45359237,
    oz: 0.028349523,
    t: 1000
  };

  const massDisplayNames = {
    kg: 'kg',
    g: 'g',
    lb: 'lb',
    oz: 'oz',
    t: 't'
  };

  // Acceleration conversion factors to meters per second squared (m/s²)
  const accConversion = {
    m_s2: 1,
    cm_s2: 0.01,
    ft_s2: 0.3048,
    g: 9.80665  // Standard gravity
  };

  const accDisplayNames = {
    m_s2: 'm/s²',
    cm_s2: 'cm/s²',
    ft_s2: 'ft/s²',
    g: 'g'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInNewtons = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInNewtons / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateForce = () => {
    if (!mass || !acceleration || isNaN(mass) || isNaN(acceleration)) return null;
    
    const massInKg = mass * massConversion[massUnit];
    const accInMs2 = acceleration * accConversion[accUnit];
    
    // Force (F) = mass × acceleration (N = kg × m/s²)
    const forceInNewtons = massInKg * accInMs2;
    return forceInNewtons;
  };

  const results = convertValue(value, unit);
  const calculatedForce = calculateForce();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Force Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Force
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter force"
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

            {/* Mass Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mass
              </label>
              <input
                type="number"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                placeholder="Enter mass"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={massUnit}
                onChange={(e) => setMassUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(massConversion).map((u) => (
                  <option key={u} value={u}>{massDisplayNames[u]}</option>
                ))}
              </select>
            </div>

            {/* Acceleration Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acceleration
              </label>
              <input
                type="number"
                value={acceleration}
                onChange={(e) => setAcceleration(e.target.value)}
                placeholder="Enter acceleration"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={accUnit}
                onChange={(e) => setAccUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(accConversion).map((u) => (
                  <option key={u} value={u}>{accDisplayNames[u]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Section */}
          {(value || calculatedForce) && (
            <div className="grid gap-4 md:grid-cols-2">
              {value && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Force Conversions:</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>{unitDisplayNames[unit]}: {val.toExponential(4)}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {calculatedForce && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Calculated Force:</h2>
                  <p>N: {calculatedForce.toExponential(4)}</p>
                  <p>lbf: {(calculatedForce / conversionFactors.lbf).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    F = m × a
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
              <li>1 N = 10⁵ dyn</li>
              <li>1 N = 0.224809 lbf</li>
              <li>1 kp = 9.80665 N</li>
              <li>1 tf = 9806.65 N</li>
              <li>1 N = 7.23301 pdl</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ForceConverter;