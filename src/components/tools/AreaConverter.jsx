'use client';

import React, { useState } from 'react';

const AreaConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('m2');
  const [shape, setShape] = useState('square');

  // Conversion factors to square meters (m²)
  const conversionFactors = {
    m2: 1,            // Square meters
    cm2: 1e-4,        // Square centimeters
    mm2: 1e-6,        // Square millimeters
    km2: 1e6,         // Square kilometers
    in2: 6.4516e-4,   // Square inches
    ft2: 9.2903e-2,   // Square feet
    yd2: 0.836127,    // Square yards
    mi2: 2589988.11,  // Square miles
    ha: 1e4,          // Hectares
    acre: 4046.85642  // Acres
  };

  // Display names for units
  const unitDisplayNames = {
    m2: 'm²',
    cm2: 'cm²',
    mm2: 'mm²',
    km2: 'km²',
    in2: 'in²',
    ft2: 'ft²',
    yd2: 'yd²',
    mi2: 'mi²',
    ha: 'ha',
    acre: 'acre'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInSquareMeters = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInSquareMeters / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateShapeProperties = () => {
    if (!value || isNaN(value)) return null;
    const areaInM2 = value * conversionFactors[unit];
    
    const properties = {};
    switch (shape) {
      case 'square':
        properties.side = Math.sqrt(areaInM2);
        properties.perimeter = 4 * properties.side;
        break;
      case 'circle':
        properties.radius = Math.sqrt(areaInM2 / Math.PI);
        properties.perimeter = 2 * Math.PI * properties.radius;
        break;
      case 'rectangle': // Assuming 2:1 ratio for simplicity
        properties.width = Math.sqrt(areaInM2 / 2);
        properties.length = 2 * properties.width;
        properties.perimeter = 2 * (properties.width + properties.length);
        break;
      default:
        return null;
    }
    return properties;
  };

  const results = convertValue(value, unit);
  const shapeProperties = calculateShapeProperties();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Area Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter area"
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

            {/* Shape Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shape (for Properties)
              </label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="square">Square</option>
                <option value="circle">Circle</option>
                <option value="rectangle">Rectangle (2:1 ratio)</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Select shape to calculate dimensions
              </p>
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
              
              {shapeProperties && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Shape Properties:</h2>
                  {shape === 'square' && (
                    <>
                      <p>Side: {shapeProperties.side.toExponential(4)} m</p>
                      <p>Perimeter: {shapeProperties.perimeter.toExponential(4)} m</p>
                    </>
                  )}
                  {shape === 'circle' && (
                    <>
                      <p>Radius: {shapeProperties.radius.toExponential(4)} m</p>
                      <p>Circumference: {shapeProperties.perimeter.toExponential(4)} m</p>
                    </>
                  )}
                  {shape === 'rectangle' && (
                    <>
                      <p>Width: {shapeProperties.width.toExponential(4)} m</p>
                      <p>Length: {shapeProperties.length.toExponential(4)} m</p>
                      <p>Perimeter: {shapeProperties.perimeter.toExponential(4)} m</p>
                    </>
                  )}
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
              <li>1 m² = 10⁴ cm²</li>
              <li>1 m² = 10⁻⁶ km²</li>
              <li>1 m² = 10.764 ft²</li>
              <li>1 ha = 10⁴ m²</li>
              <li>1 acre = 4046.86 m²</li>
              <li>1 mi² = 2.59 km²</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default AreaConverter;