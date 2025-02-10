"use client";

import { useState } from "react";

const volumeConversionRates = {
  Liters: { Liters: 1, Milliliters: 1000, Gallons: 0.264172, Cups: 4.22675 },
  Milliliters: { Liters: 0.001, Milliliters: 1, Gallons: 0.000264172, Cups: 0.00422675 },
  Gallons: { Liters: 3.78541, Milliliters: 3785.41, Gallons: 1, Cups: 16 },
  Cups: { Liters: 0.236588, Milliliters: 236.588, Gallons: 0.0625, Cups: 1 },
};

const convertVolume = (value, from, to) => {
  if (isNaN(value) || value === "") return "";
  return (parseFloat(value) * volumeConversionRates[from][to]).toFixed(4);
};

const VolumeConverter = () => {
  const [inputValue, setInputValue] = useState("");
  const [fromUnit, setFromUnit] = useState("Liters");
  const [toUnit, setToUnit] = useState("Milliliters");
  const [result, setResult] = useState("");

  const handleConversion = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setResult(convertVolume(value, fromUnit, toUnit));
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setResult(convertVolume(inputValue, toUnit, fromUnit));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      <div className="mb-4">
        <input
          type="number"
          value={inputValue}
          onChange={handleConversion}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter volume"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
          className="w-1/2 p-2 border rounded-lg"
        >
          {Object.keys(volumeConversionRates).map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        <button
          onClick={swapUnits}
          className="p-2 border rounded-lg bg-gray-200"
        >
          🔄
        </button>

        <select
          value={toUnit}
          onChange={(e) => {
            setToUnit(e.target.value);
            setResult(convertVolume(inputValue, fromUnit, e.target.value));
          }}
          className="w-1/2 p-2 border rounded-lg"
        >
          {Object.keys(volumeConversionRates).map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
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
