"use client";

import { useState } from "react";
import { FiRepeat } from "react-icons/fi"; // Swap icon

const conversionRates = {
  AU: 1,
  KM: 149597870.7,
  MI: 92955807.267,
  LY: 0.000015812507409,
  M: 149597870700,
  FT: 490806662610.24,
  NM: 1.495978707e20,
  PC: 0.0000048481368111,
};

const AstronomicalUnitConverter = () => {
  const [inputValue, setInputValue] = useState("");
  const [fromUnit, setFromUnit] = useState("AU");
  const [toUnit, setToUnit] = useState("KM");
  const [convertedValue, setConvertedValue] = useState("");

  const convert = () => {
    if (!inputValue || isNaN(inputValue)) {
      setConvertedValue("Invalid Input");
      return;
    }

    const valueInAU = parseFloat(inputValue) / conversionRates[fromUnit];
    const result = valueInAU * conversionRates[toUnit];
    setConvertedValue(
      result.toLocaleString(undefined, { maximumFractionDigits: 5 })
    );
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg max-w-md">
      <h2 className="text-xl font-bold mb-4">Astronomical Unit Converter</h2>

      <label className="block mb-2 font-medium">Enter Value:</label>
      <input
        type="number"
        className="w-full p-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Enter a value"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />

      <div className="flex items-center gap-3 mb-3">
        <div className="w-1/2">
          <select
            className="w-full p-2 border rounded-lg"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
          >
            {Object.keys(conversionRates).map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={swapUnits}
          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all focus:outline-none"
          aria-label="Swap Units"
        >
          <FiRepeat className="text-primary text-xl" />
        </button>

        <div className="w-1/2">
          <select
            className="w-full p-2 border rounded-lg"
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
      </div>

      <button
        onClick={convert}
        className="w-full mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
      >
        Convert
      </button>

      {convertedValue && (
        <div className="mt-4 p-3 border rounded-lg bg-gray-100">
          Converted Value:{" "}
          <strong>
            {convertedValue} {toUnit}
          </strong>
        </div>
      )}
    </div>
  );
};

export default AstronomicalUnitConverter;
