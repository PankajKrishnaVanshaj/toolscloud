"use client";

import { useState } from "react";

// Conversion rates
const conversionRates = {
  AU: 1,
  KM: 149597870.7, // 1 AU = 149,597,870.7 km
  MI: 92955807.3, // 1 AU = 92,955,807.3 miles
  LY: 0.000015812507, // 1 AU = 0.0000158125 light-years
};

const AstronomicalUnitConverter = () => {
  const [inputValue, setInputValue] = useState("");
  const [fromUnit, setFromUnit] = useState("AU");
  const [toUnit, setToUnit] = useState("KM");
  const [convertedValue, setConvertedValue] = useState("");

  // Conversion logic
  const convert = () => {
    if (!inputValue || isNaN(inputValue)) {
      setConvertedValue("Invalid Input");
      return;
    }

    const valueInAU = parseFloat(inputValue) / conversionRates[fromUnit]; // Convert to AU first
    const result = valueInAU * conversionRates[toUnit]; // Convert from AU to target unit

    setConvertedValue(result.toLocaleString(undefined, { maximumFractionDigits: 5 }));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      {/* Input Field */}
      <label className="block mb-2 font-medium">Enter Value:</label>
      <input
        type="number"
        className="w-full p-2 border rounded-lg mb-3"
        placeholder="Enter a value"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />

      {/* Dropdowns for Unit Selection */}
      <div className="flex gap-3 mb-3">
        <select
          className="w-1/2 p-2 border rounded-lg"
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
        >
          {Object.keys(conversionRates).map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        <select
          className="w-1/2 p-2 border rounded-lg"
          value={toUnit}
          onChange={(e) => setToUnit(e.target.value)}
        >
          {Object.keys(conversionRates).map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      {/* Convert Button */}
      <button
        onClick={convert}
        className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Convert
      </button>

      {/* Result Display */}
      {convertedValue && (
        <div className="mt-4 p-3 border rounded-lg bg-gray-100">
          Converted Value: <strong>{convertedValue} {toUnit}</strong>
        </div>
      )}
    </div>
  );
};

export default AstronomicalUnitConverter;
