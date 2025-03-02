'use client';

import React, { useState } from 'react';

const PixelConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('px');
  const [dpi, setDpi] = useState('96'); // Default web DPI
  const [rootFontSize, setRootFontSize] = useState('16'); // Default root font size in px

  // Conversion factors relative to pixels (px)
  const getConversionFactors = () => {
    const dpiValue = parseFloat(dpi) || 96;
    const rootFontSizeValue = parseFloat(rootFontSize) || 16;

    return {
      px: 1,
      pt: 96 / 72,        // 1 pt = (DPI / 72) px, default 1.333... at 96 DPI
      em: rootFontSizeValue, // 1 em = root font size in px
      rem: rootFontSizeValue,// 1 rem = root font size in px
      percent: rootFontSizeValue / 100, // 1% = root font size / 100
      in: dpiValue,       // 1 inch = DPI pixels
      cm: dpiValue / 2.54 // 1 cm = DPI / 2.54 pixels
    };
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const factors = getConversionFactors();
    const valueInPx = inputValue * factors[fromUnit];
    
    return Object.keys(factors).reduce((acc, unit) => {
      acc[unit] = valueInPx / factors[unit];
      return acc;
    }, {});
  };

  const results = convertValue(value, unit);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Pixel Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
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
                <option value="px">Pixels (px)</option>
                <option value="pt">Points (pt)</option>
                <option value="em">Em (em)</option>
                <option value="rem">Rem (rem)</option>
                <option value="percent">Percent (%)</option>
                <option value="in">Inches (in)</option>
                <option value="cm">Centimeters (cm)</option>
              </select>
            </div>

            {/* Settings Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DPI (dots per inch)
              </label>
              <input
                type="number"
                value={dpi}
                onChange={(e) => setDpi(e.target.value)}
                placeholder="Enter DPI"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">
                Root Font Size (px)
              </label>
              <input
                type="number"
                value={rootFontSize}
                onChange={(e) => setRootFontSize(e.target.value)}
                placeholder="Enter root font size"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(results).map(([unit, val]) => (
                  <p key={unit}>
                    {unit === 'percent' ? '%' : unit}: {val.toFixed(4)}
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
              <li>1 px = 1 pixel</li>
              <li>1 pt = (DPI / 72) px (default 1.333 at 96 DPI)</li>
              <li>1 em = root font size in px</li>
              <li>1 rem = root font size in px</li>
              <li>1% = root font size / 100</li>
              <li>1 in = DPI pixels</li>
              <li>1 cm = DPI / 2.54 pixels</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default PixelConverter;