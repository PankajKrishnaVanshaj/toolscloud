"use client";

import { useState } from "react";
import { IoSwapHorizontalSharp } from "react-icons/io5";

const convertTemperature = (value, from, to) => {
  if (isNaN(value) || value === "") return "";

  const num = parseFloat(value);

  if (num < 0 && from === "Kelvin") return "Invalid input (Kelvin cannot be negative)";

  if (from === to) return num.toFixed(2);

  if (from === "Celsius") {
    return to === "Fahrenheit"
      ? ((num * 9) / 5 + 32).toFixed(2)
      : (num + 273.15).toFixed(2);
  }
  if (from === "Fahrenheit") {
    return to === "Celsius"
      ? (((num - 32) * 5) / 9).toFixed(2)
      : (((num - 32) * 5) / 9 + 273.15).toFixed(2);
  }
  if (from === "Kelvin") {
    return to === "Celsius"
      ? (num - 273.15).toFixed(2)
      : (((num - 273.15) * 9) / 5 + 32).toFixed(2);
  }
};

const TemperatureConverter = () => {
  const [inputValue, setInputValue] = useState("");
  const [fromUnit, setFromUnit] = useState("Celsius");
  const [toUnit, setToUnit] = useState("Fahrenheit");
  const [result, setResult] = useState("");

  const handleConversion = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setResult(convertTemperature(value, fromUnit, toUnit));
  };

  const handleUnitChange = (unit, isFromUnit) => {
    if (isFromUnit) {
      setFromUnit(unit);
      setResult(convertTemperature(inputValue, unit, toUnit));
    } else {
      setToUnit(unit);
      setResult(convertTemperature(inputValue, fromUnit, unit));
    }
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setResult(convertTemperature(inputValue, toUnit, fromUnit));
  };

  return (
    <div className="mx-auto p-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-lg max-w-md">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-700">
        Temperature Converter
      </h1>

      <div className="mb-4">
        <input
          type="number"
          value={inputValue}
          onChange={handleConversion}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter temperature"
        />
      </div>

      <div className="flex gap-2 mb-4 items-center">
        <select
          value={fromUnit}
          onChange={(e) => handleUnitChange(e.target.value, true)}
          className="w-1/2 p-2 border rounded-lg"
        >
          {["Celsius", "Fahrenheit", "Kelvin"].map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        <button
          onClick={swapUnits}
          className="p-2 border rounded-lg bg-gray-200 hover:bg-gray-300 focus:outline-none"
          aria-label="Swap Units"
        >
          <IoSwapHorizontalSharp className="text-2xl" />
        </button>

        <select
          value={toUnit}
          onChange={(e) => handleUnitChange(e.target.value, false)}
          className="w-1/2 p-2 border rounded-lg"
        >
          {["Celsius", "Fahrenheit", "Kelvin"].map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      {result && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-lg text-center text-gray-800">
          <strong>Converted Temperature:</strong> {result}° {toUnit}
        </div>
      )}
    </div>
  );
};

export default TemperatureConverter;
