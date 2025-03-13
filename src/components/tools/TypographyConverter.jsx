"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const TypographyConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("pt");
  const [baseFontSize, setBaseFontSize] = useState(16); // Default base font size in pixels
  const [dpi, setDpi] = useState(96); // Default DPI for px conversion
  const [precision, setPrecision] = useState(4); // Decimal precision for results
  const [copiedUnit, setCopiedUnit] = useState(null);

  // Conversion factors to points (pt)
  const conversionFactors = {
    pt: 1, // Points
    px: (dpi) => 72 / dpi, // Pixels (dynamic based on DPI)
    em: (base) => base * 0.75, // Em (relative to base font size)
    rem: (base) => base * 0.75, // Rem (relative to root font size)
    in: 72, // Inches (1in = 72pt)
    cm: 28.3465, // Centimeters (1cm ≈ 28.3465pt)
    mm: 2.83465, // Millimeters (1mm ≈ 2.83465pt)
    pc: 12, // Picas (1pc = 12pt)
    ch: (base) => base * 0.75 * 0.5, // Ch (approximation: 0.5em)
    ex: (base) => base * 0.75 * 0.5, // Ex (approximation: 0.5em)
  };

  // Display names for units
  const unitDisplayNames = {
    pt: "pt",
    px: "px",
    em: "em",
    rem: "rem",
    in: "in",
    cm: "cm",
    mm: "mm",
    pc: "pc",
    ch: "ch",
    ex: "ex",
  };

  // Convert value to all units
  const convertValue = useCallback(
    (inputValue, fromUnit, baseSize, dpiValue) => {
      if (!inputValue || isNaN(inputValue)) return {};

      const adjustedFactors = Object.fromEntries(
        Object.entries(conversionFactors).map(([key, factor]) => [
          key,
          typeof factor === "function" ? factor(fromUnit === "px" ? dpiValue : baseSize) : factor,
        ])
      );

      const valueInPoints = inputValue * adjustedFactors[fromUnit];

      return Object.fromEntries(
        Object.entries(adjustedFactors).map(([unit, factor]) => [
          unit,
          valueInPoints / factor,
        ])
      );
    },
    []
  );

  const results = convertValue(value, unit, baseFontSize, dpi);

  // Copy to clipboard
  const copyToClipboard = (unit, val) => {
    navigator.clipboard.writeText(val.toFixed(precision).replace(/\.?0+$/, ""));
    setCopiedUnit(unit);
    setTimeout(() => setCopiedUnit(null), 2000);
  };

  // Reset inputs
  const reset = () => {
    setValue("");
    setUnit("pt");
    setBaseFontSize(16);
    setDpi(96);
    setPrecision(4);
    setCopiedUnit(null);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Typography Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
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
                  <option key={u} value={u}>
                    {unitDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Font Size (em/rem/ch/ex)
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DPI (for px)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={dpi}
                  onChange={(e) => setDpi(Math.max(72, e.target.value))}
                  min="72"
                  placeholder="DPI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-600">dpi</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision
              </label>
              <input
                type="number"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(10, e.target.value)))}
                min="0"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end">
            <button
              onClick={reset}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {value && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                {Object.entries(results).map(([unit, val]) => (
                  <div key={unit} className="flex items-center justify-between">
                    <span>
                      {unitDisplayNames[unit]}:{" "}
                      {val.toFixed(precision).replace(/\.?0+$/, "")}
                    </span>
                    <button
                      onClick={() => copyToClipboard(unit, val)}
                      className="ml-2 p-1 text-gray-500 hover:text-blue-500 transition-colors"
                      title="Copy to clipboard"
                    >
                      <FaCopy
                        className={copiedUnit === unit ? "text-green-500" : ""}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">
                Conversion References
              </summary>
              <ul className="list-disc list-inside mt-2">
                <li>1 in = 72 pt</li>
                <li>1 px = 72/DPI pt (default 96 DPI)</li>
                <li>1 cm = 28.3465 pt</li>
                <li>1 pc = 12 pt</li>
                <li>em/rem/ch/ex are relative to base font size</li>
                <li>ch ≈ 0.5em, ex ≈ 0.5em (approximations)</li>
              </ul>
            </details>
          </div>

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between pt, px, em, rem, in, cm, mm, pc, ch, ex</li>
              <li>Customizable base font size and DPI</li>
              <li>Adjustable precision (0-10 decimals)</li>
              <li>Copy results to clipboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypographyConverter;