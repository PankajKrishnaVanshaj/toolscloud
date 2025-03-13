"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const PixelConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("px");
  const [dpi, setDpi] = useState("96"); // Default web DPI
  const [rootFontSize, setRootFontSize] = useState("16"); // Default root font size in px
  const [precision, setPrecision] = useState(4); // Decimal precision for results

  // Conversion factors relative to pixels (px)
  const getConversionFactors = useCallback(() => {
    const dpiValue = parseFloat(dpi) || 96;
    const rootFontSizeValue = parseFloat(rootFontSize) || 16;

    return {
      px: 1,
      pt: dpiValue / 72, // 1 pt = (DPI / 72) px
      pc: dpiValue / 6, // 1 pc (pica) = 12 pt = (DPI / 6) px
      em: rootFontSizeValue, // 1 em = root font size in px
      rem: rootFontSizeValue, // 1 rem = root font size in px
      percent: rootFontSizeValue / 100, // 1% = root font size / 100
      in: dpiValue, // 1 inch = DPI pixels
      cm: dpiValue / 2.54, // 1 cm = DPI / 2.54 pixels
      mm: dpiValue / 25.4, // 1 mm = DPI / 25.4 pixels
    };
  }, [dpi, rootFontSize]);

  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const factors = getConversionFactors();
      const valueInPx = inputValue * factors[fromUnit];

      return Object.keys(factors).reduce((acc, unit) => {
        acc[unit] = valueInPx / factors[unit];
        return acc;
      }, {});
    },
    [getConversionFactors]
  );

  const results = convertValue(value, unit);

  // Copy result to clipboard
  const copyToClipboard = (unit, val) => {
    navigator.clipboard.writeText(val.toFixed(precision));
    alert(`Copied ${val.toFixed(precision)} ${unit} to clipboard!`);
  };

  // Reset inputs
  const reset = () => {
    setValue("");
    setUnit("px");
    setDpi("96");
    setRootFontSize("16");
    setPrecision(4);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
          Pixel Converter
        </h1>

        <div className="grid gap-6">
          {/* Input and Settings Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <option value="pc">Picas (pc)</option>
                <option value="em">Em (em)</option>
                <option value="rem">Rem (rem)</option>
                <option value="percent">Percent (%)</option>
                <option value="in">Inches (in)</option>
                <option value="cm">Centimeters (cm)</option>
                <option value="mm">Millimeters (mm)</option>
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DPI
                </label>
                <input
                  type="number"
                  value={dpi}
                  onChange={(e) => setDpi(e.target.value)}
                  placeholder="Enter DPI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
          </div>

          {/* Precision and Reset */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (decimals)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(10, e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={reset}
              className="w-full sm:w-auto py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {value && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Conversions:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-700">
                {Object.entries(results).map(([unit, val]) => (
                  <div
                    key={unit}
                    className="flex items-center justify-between p-2 hover:bg-gray-200 rounded-md"
                  >
                    <p>
                      {unit === "percent" ? "%" : unit}: {val.toFixed(precision)}
                    </p>
                    <button
                      onClick={() => copyToClipboard(unit, val)}
                      className="p-1 text-gray-500 hover:text-blue-500"
                      title="Copy to clipboard"
                    >
                      <FaCopy />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">
              Conversion References
            </summary>
            <ul className="list-disc list-inside mt-2">
              <li>1 px = 1 pixel</li>
              <li>1 pt = (DPI / 72) px</li>
              <li>1 pc = 12 pt = (DPI / 6) px</li>
              <li>1 em = root font size in px</li>
              <li>1 rem = root font size in px</li>
              <li>1% = root font size / 100</li>
              <li>1 in = DPI pixels</li>
              <li>1 cm = DPI / 2.54 pixels</li>
              <li>1 mm = DPI / 25.4 pixels</li>
            </ul>
          </details>
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between px, pt, pc, em, rem, %, in, cm, mm</li>
            <li>Custom DPI and root font size</li>
            <li>Adjustable precision (0-10 decimals)</li>
            <li>Copy results to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PixelConverter;