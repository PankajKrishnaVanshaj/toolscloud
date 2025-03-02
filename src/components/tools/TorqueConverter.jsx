'use client';

import React, { useState } from 'react';

const TorqueConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('Nm');
  const [force, setForce] = useState('');
  const [forceUnit, setForceUnit] = useState('N');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('m');

  // Torque conversion factors to Newton-meters (Nm)
  const torqueConversionFactors = {
    Nm: 1,          // Newton-meter
    ftlb: 1.35582,  // Foot-pound
    inlb: 0.112985, // Inch-pound
    kgm: 9.80665,   // Kilogram-meter
    gfcm: 9.80665e-5, // Gram-force centimeter
    ozft: 0.0847386,  // Ounce-foot
    Ncm: 0.01,      // Newton-centimeter
    dynm: 1e-5      // Dyne-meter
  };

  // Force conversion factors to Newtons (N)
  const forceConversionFactors = {
    N: 1,          // Newton
    lbf: 4.44822,  // Pound-force
    kgf: 9.80665,  // Kilogram-force
    gf: 9.80665e-3, // Gram-force
    dyn: 1e-5      // Dyne
  };

  // Distance conversion factors to meters (m)
  const distanceConversionFactors = {
    m: 1,          // Meter
    cm: 0.01,      // Centimeter
    mm: 0.001,     // Millimeter
    ft: 0.3048,    // Foot
    inch: 0.0254   // Inch
  };

  const convertTorque = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInNm = inputValue * torqueConversionFactors[fromUnit];
    
    return Object.keys(torqueConversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInNm / torqueConversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateTorqueFromForce = () => {
    if (!force || !distance || isNaN(force) || isNaN(distance)) return null;
    
    const forceInNewtons = force * forceConversionFactors[forceUnit];
    const distanceInMeters = distance * distanceConversionFactors[distanceUnit];
    
    // Torque (τ) = Force × Distance (Nm = N × m)
    const torqueInNm = forceInNewtons * distanceInMeters;
    return torqueInNm;
  };

  const results = convertTorque(value, unit);
  const calculatedTorque = calculateTorqueFromForce();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Torque Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Torque
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter torque"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(torqueConversionFactors).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Force and Distance Section */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Force
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={force}
                    onChange={(e) => setForce(e.target.value)}
                    placeholder="Enter force"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={forceUnit}
                    onChange={(e) => setForceUnit(e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(forceConversionFactors).map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance
                </label>
                <div className="flex gap-2">
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
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(distanceConversionFactors).map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {(value || calculatedTorque) && (
            <div className="grid gap-4 md:grid-cols-2">
              {value && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Torque Conversions:</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>{unit}: {val.toExponential(4)}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {calculatedTorque && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Calculated Torque:</h2>
                  <p>Nm: {calculatedTorque.toExponential(4)}</p>
                  <p>ft-lb: {(calculatedTorque / torqueConversionFactors.ftlb).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    τ = F × d
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
              <li>1 Nm = 0.737562 ft-lb</li>
              <li>1 ft-lb = 1.35582 Nm</li>
              <li>1 kg-m = 9.80665 Nm</li>
              <li>1 in-lb = 0.112985 Nm</li>
              <li>1 Nm = 100 N-cm</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TorqueConverter;