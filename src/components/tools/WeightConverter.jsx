"use client";

import { useState } from "react";
import { IoSwapHorizontalSharp } from "react-icons/io5";


const weightUnits = {
  kilograms: 1,
  grams: 1000,
  milligrams: 1e6,
  micrograms: 1e9,
  pounds: 2.20462,
  ounces: 35.274,
  tons: 0.001,
  stones: 0.157473,
  carats: 5000,
};

const WeightConverter = () => {
  const [inputValue, setInputValue] = useState("");
  const [fromUnit, setFromUnit] = useState("kilograms");
  const [toUnit, setToUnit] = useState("grams");
  const [result, setResult] = useState("");

  const convertWeight = (value, from, to) => {
    if (!value || isNaN(value)) return "";
    const inKilograms = parseFloat(value) / weightUnits[from]; // Convert to kilograms
    const convertedValue = inKilograms * weightUnits[to]; // Convert from kilograms to target unit
    return convertedValue.toFixed(4);
  };

  const handleConversion = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setResult(convertWeight(value, fromUnit, toUnit));
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setResult(convertWeight(inputValue, toUnit, fromUnit)); // Recalculate after swapping
  };

  return (
    <div className="mx-auto p-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-lg max-w-md">


      <div className="mb-4">
        <input
          type="number"
          value={inputValue}
          onChange={handleConversion}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter weight"
        />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <select
          value={fromUnit}
          onChange={(e) => {
            setFromUnit(e.target.value);
            setResult(convertWeight(inputValue, e.target.value, toUnit));
          }}
          className="w-1/2 p-2 border rounded-lg"
        >
          {Object.keys(weightUnits).map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
          aria-label="Swap Units"
        >
          <IoSwapHorizontalSharp  className="text-2xl" />
        </button>

        <select
          value={toUnit}
          onChange={(e) => {
            setToUnit(e.target.value);
            setResult(convertWeight(inputValue, fromUnit, e.target.value));
          }}
          className="w-1/2 p-2 border rounded-lg"
        >
          {Object.keys(weightUnits).map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      {result && (
        <div className="p-3 bg-gray-100 rounded-lg text-lg text-center">
          <strong>Converted Weight: </strong> {result} {toUnit}
        </div>
      )}
    </div>
  );
};

export default WeightConverter;
