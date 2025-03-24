"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaExchangeAlt, FaInfoCircle } from "react-icons/fa";

const conversionRates = {
  AU: { rate: 1, label: "Astronomical Units" },
  KM: { rate: 149597870.7, label: "Kilometers" },
  MI: { rate: 92955807.267, label: "Miles" },
  LY: { rate: 0.000015812507409, label: "Light Years" },
  M: { rate: 149597870700, label: "Meters" },
  FT: { rate: 490806662610.24, label: "Feet" },
  NM: { rate: 1.495978707e20, label: "Nanometers" },
  PC: { rate: 0.0000048481368111, label: "Parsecs" },
};

const AstronomicalUnitConverter = () => {
  const [inputValue, setInputValue] = useState("");
  const [fromUnit, setFromUnit] = useState("AU");
  const [toUnit, setToUnit] = useState("KM");
  const [convertedValue, setConvertedValue] = useState("");
  const [precision, setPrecision] = useState(5);
  const [history, setHistory] = useState([]);

  // Convert function
  const convert = useCallback(() => {
    if (!inputValue || isNaN(inputValue)) {
      setConvertedValue("Invalid Input");
      return;
    }

    const value = parseFloat(inputValue);
    const valueInAU = value / conversionRates[fromUnit].rate;
    const result = valueInAU * conversionRates[toUnit].rate;
    const formattedResult = result.toLocaleString(undefined, {
      maximumFractionDigits: precision,
    });

    setConvertedValue(formattedResult);
    setHistory((prev) => [
      `${value} ${fromUnit} = ${formattedResult} ${toUnit}`,
      ...prev.slice(0, 9), // Keep last 10 entries
    ]);
  }, [inputValue, fromUnit, toUnit, precision]);

  // Swap units
  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setConvertedValue("");
  };

  // Reset all fields
  const reset = () => {
    setInputValue("");
    setFromUnit("AU");
    setToUnit("KM");
    setConvertedValue("");
    setPrecision(5);
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Astronomical Unit Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Value
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter a value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>

          {/* Unit Selection */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <select
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
              >
                {Object.entries(conversionRates).map(([unit, { label }]) => (
                  <option key={unit} value={unit}>
                    {unit} - {label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={swapUnits}
              className="p-2 mt-6 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              aria-label="Swap Units"
            >
              <FaExchangeAlt className="text-gray-700 text-xl" />
            </button>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <select
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
              >
                {Object.entries(conversionRates).map(([unit, { label }]) => (
                  <option key={unit} value={unit}>
                    {unit} - {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Precision Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precision (Decimal Places: {precision})
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={convert}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Result */}
          {convertedValue && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700">
                Converted Value:{" "}
                <strong>
                  {convertedValue} {toUnit}
                </strong>
              </p>
            </div>
          )}

          {/* Conversion History */}
          {history.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">History</h3>
              <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                {history.map((entry, index) => (
                  <li key={index}>{entry}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between AU, KM, MI, LY, M, FT, NM, PC</li>
            <li>Adjustable precision (0-10 decimal places)</li>
            <li>Unit swapping with one click</li>
            <li>Conversion history (last 10 entries)</li>
            <li>Formatted output with locale-specific thousands separators</li>
          </ul>
        </div>

        {/* Unit Information */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-2">
          <FaInfoCircle className="text-yellow-700 mt-1" />
          <p className="text-yellow-700 text-sm">
            All conversions are relative to the Astronomical Unit (AU). 1 AU ≈ 149.6 million kilometers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AstronomicalUnitConverter;