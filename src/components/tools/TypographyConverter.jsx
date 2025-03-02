'use client';

import React, { useState } from 'react';

const TypographyConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('pt');
  const [baseFontSize, setBaseFontSize] = useState(16); // Default base font size in pixels

  // Conversion factors to points (pt)
  const conversionFactors = {
    pt: 1,              // Points
    px: 0.75,          // Pixels (1px = 0.75pt at 96 DPI)
    em: 12,            // Em (relative to base font size, default 16px = 12pt)
    rem: 12,           // Rem (relative to root font size, default 16px = 12pt)
    in: 72,            // Inches (1in = 72pt)
    cm: 28.3465,       // Centimeters (1cm ≈ 28.3465pt)
    mm: 2.83465,       // Millimeters (1mm ≈ 2.83465pt)
    pc: 12             // Picas (1pc = 12pt)
  };

  // Display names for units
  const unitDisplayNames = {
    pt: 'pt',
    px: 'px',
    em: 'em',
    rem: 'rem',
    in: 'in',
    cm: 'cm',
    mm: 'mm',
    pc: 'pc'
  };

  const convertValue = (inputValue, fromUnit, baseSize) => {
    if (!inputValue || isNaN(inputValue)) return {};

    // Adjust em and rem based on base font size
    const adjustedFactors = {
      ...conversionFactors,
      em: baseSize * 0.75,  // Convert base pixels to points
      rem: baseSize * 0.75
    };

    const valueInPoints = inputValue * adjustedFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInPoints / adjustedFactors[unit];
      return acc;
    }, {});
  };

  const results = convertValue(value, unit, baseFontSize);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Typography Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
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

            {/* Base Font Size Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Font Size (for em/rem)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={baseFontSize}
                  onChange={(e) => setBaseFontSize(Math.max(1, e.target.value))}
                  min="1"
                  placeholder="Base size in px"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-600">px</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Default browser base size is typically 16px
              </p>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {Object.entries(results).map(([unit, val]) => (
                  <p key={unit}>
                    {unitDisplayNames[unit]}: {val.toFixed(4).replace(/\.?0+$/, '')}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Conversion References</summary>
            <ul className="list-disc list-inside mt-2">
              <li>1 in = 72 pt</li>
              <li>1 px = 0.75 pt (at 96 DPI)</li>
              <li>1 cm = 28.3465 pt</li>
              <li>1 pc = 12 pt</li>
              <li>em/rem are relative to base font size</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TypographyConverter;