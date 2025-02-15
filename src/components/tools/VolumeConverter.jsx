"use client";

import { useState } from "react";

// Utility function for volume conversions
const volumeConversionRates = {
  Liters: { Liters: 1, Milliliters: 1000, Gallons: 0.264172, Cups: 4.22675, Pints: 2.11338, Quarts: 1.05669, "Cubic Meters": 0.001, "Cubic Centimeters": 1000 },
  Milliliters: { Liters: 0.001, Milliliters: 1, Gallons: 0.000264172, Cups: 0.00422675, Pints: 0.00211338, Quarts: 0.00105669, "Cubic Meters": 0.000001, "Cubic Centimeters": 1 },
  Gallons: { Liters: 3.78541, Milliliters: 3785.41, Gallons: 1, Cups: 16, Pints: 8, Quarts: 4, "Cubic Meters": 0.00378541, "Cubic Centimeters": 3785.41 },
  Cups: { Liters: 0.236588, Milliliters: 236.588, Gallons: 0.0625, Cups: 1, Pints: 0.5, Quarts: 0.25, "Cubic Meters": 0.000236588, "Cubic Centimeters": 236.588 },
  Pints: { Liters: 0.473176, Milliliters: 473.176, Gallons: 0.125, Cups: 2, Pints: 1, Quarts: 0.5, "Cubic Meters": 0.000473176, "Cubic Centimeters": 473.176 },
  Quarts: { Liters: 0.946353, Milliliters: 946.353, Gallons: 0.25, Cups: 4, Pints: 2, Quarts: 1, "Cubic Meters": 0.000946353, "Cubic Centimeters": 946.353 },
  "Cubic Meters": { Liters: 1000, Milliliters: 1000000, Gallons: 264.172, Cups: 4226.75, Pints: 2113.38, Quarts: 1056.69, "Cubic Meters": 1, "Cubic Centimeters": 1000000 },
  "Cubic Centimeters": { Liters: 0.001, Milliliters: 1, Gallons: 0.000264172, Cups: 0.00422675, Pints: 0.00211338, Quarts: 0.00105669, "Cubic Meters": 0.000001, "Cubic Centimeters": 1 },
};


const convertVolume = (value, from, to) => {
  if (!value || isNaN(value)) return "";
  const conversionRate = volumeConversionRates[from][to];
  const result = parseFloat(value) * conversionRate;
  return result.toFixed(4); // Round to 4 decimal places for display
};


const VolumeConverter = () => {
  const [inputValue, setInputValue] = useState("");
  const [fromUnit, setFromUnit] = useState("Liters");
  const [toUnit, setToUnit] = useState("Milliliters");
  const [result, setResult] = useState("");

  // Handle conversion and update result
  const handleConversion = (value, from, to) => {
    setResult(convertVolume(value, from, to));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    handleConversion(value, fromUnit, toUnit);
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    handleConversion(inputValue, toUnit, fromUnit);
  };

  return (
    <div className="mx-auto p-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-lg max-w-md">
      <h1 className="text-2xl font-bold mb-4 text-blue-700 text-center">Volume Converter</h1>

      <div className="mb-4">
        <label htmlFor="volume-input" className="block mb-1 text-gray-700 font-medium">Enter Volume:</label>
        <input
          id="volume-input"
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter volume"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <div className="w-1/2">
          <select
            id="from-unit"
            value={fromUnit}
            onChange={(e) => {
              setFromUnit(e.target.value);
              handleConversion(inputValue, e.target.value, toUnit);
            }}
            className="w-full p-2 border rounded-lg"
          >
            {Object.keys(volumeConversionRates).map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={swapUnits}
          className="p-2 border rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
          aria-label="Swap Units"
        >
          🔄
        </button>

        <div className="w-1/2">
          <select
            id="to-unit"
            value={toUnit}
            onChange={(e) => {
              setToUnit(e.target.value);
              handleConversion(inputValue, fromUnit, e.target.value);
            }}
            className="w-full p-2 border rounded-lg"
          >
            {Object.keys(volumeConversionRates).map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>

      {result && (
        <div className="p-3 bg-gray-100 rounded-lg text-lg text-center">
          <strong>Converted Volume: </strong> {result} {toUnit}
        </div>
      )}
    </div>
  );
};

export default VolumeConverter;
