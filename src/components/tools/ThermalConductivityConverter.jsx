'use client';

import React, { useState } from 'react';

const ThermalConductivityConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('W_mK');
  const [length, setLength] = useState('');
  const [lengthUnit, setLengthUnit] = useState('m');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('m2');
  const [tempDiff, setTempDiff] = useState('');
  const [tempUnit, setTempUnit] = useState('K');

  // Conversion factors to W/(m·K)
  const conversionFactors = {
    W_mK: 1,                // Watt per meter-Kelvin
    W_cmK: 100,            // Watt per centimeter-Kelvin
    mW_mK: 1e-3,           // Milliwatt per meter-Kelvin
    kW_mK: 1e3,            // Kilowatt per meter-Kelvin
    Btu_hftF: 1.730735,    // BTU per hour-foot-°F
    cal_shcmC: 418.6805,   // Calorie per second-hour-centimeter-°C
    kcal_hmC: 1.162222,    // Kilocalorie per hour-meter-°C
    W_inK: 39.3701         // Watt per inch-Kelvin
  };

  const unitDisplayNames = {
    W_mK: 'W/(m·K)',
    W_cmK: 'W/(cm·K)',
    mW_mK: 'mW/(m·K)',
    kW_mK: 'kW/(m·K)',
    Btu_hftF: 'BTU/(h·ft·°F)',
    cal_shcmC: 'cal/(s·h·cm·°C)',
    kcal_hmC: 'kcal/(h·m·°C)',
    W_inK: 'W/(in·K)'
  };

  // Length conversion to meters
  const lengthConversion = {
    m: 1,
    cm: 0.01,
    mm: 0.001,
    ft: 0.3048,
    in: 0.0254
  };

  // Area conversion to square meters
  const areaConversion = {
    m2: 1,
    cm2: 1e-4,
    mm2: 1e-6,
    ft2: 9.2903e-2,
    in2: 6.4516e-4
  };

  const areaDisplayNames = {
    m2: 'm²',
    cm2: 'cm²',
    mm2: 'mm²',
    ft2: 'ft²',
    in2: 'in²'
  };

  // Temperature difference conversion to Kelvin
  const tempConversion = {
    K: 1,
    C: 1,     // Δ°C = ΔK (same magnitude)
    F: 5/9    // Δ°F to ΔK
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInWmK = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInWmK / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateHeatFlow = () => {
    if (!value || !length || !area || !tempDiff || 
        isNaN(value) || isNaN(length) || isNaN(area) || isNaN(tempDiff)) {
      return null;
    }
    
    const k = value * conversionFactors[unit]; // Thermal conductivity in W/(m·K)
    const L = length * lengthConversion[lengthUnit]; // Length in meters
    const A = area * areaConversion[areaUnit]; // Area in m²
    const deltaT = tempDiff * tempConversion[tempUnit]; // Temperature difference in K
    
    // Q = k × A × ΔT / L (Watts)
    const heatFlow = (k * A * deltaT) / L;
    return heatFlow;
  };

  const results = convertValue(value, unit);
  const heatFlow = calculateHeatFlow();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Thermal Conductivity Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thermal Conductivity
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="Enter length"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={lengthUnit}
                onChange={(e) => setLengthUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="m">m</option>
                <option value="cm">cm</option>
                <option value="mm">mm</option>
                <option value="ft">ft</option>
                <option value="in">in</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area
              </label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Enter area"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(areaConversion).map((u) => (
                  <option key={u} value={u}>{areaDisplayNames[u]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature Difference
              </label>
              <input
                type="number"
                value={tempDiff}
                onChange={(e) => setTempDiff(e.target.value)}
                placeholder="Enter ΔT"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="K">K</option>
                <option value="C">°C</option>
                <option value="F">°F</option>
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
              
              {heatFlow && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Heat Flow:</h2>
                  <p>Watts (W): {heatFlow.toExponential(4)}</p>
                  <p>BTU/h: {(heatFlow * 3.412142).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Q = k × A × ΔT / L
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
              <li>1 W/(m·K) = 1.730735 BTU/(h·ft·°F)</li>
              <li>1 W/(m·K) = 0.859845 kcal/(h·m·°C)</li>
              <li>1 W/(m·K) = 418.6805 cal/(s·h·cm·°C)</li>
              <li>1 W/(m·K) = 39.3701 W/(in·K)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ThermalConductivityConverter;