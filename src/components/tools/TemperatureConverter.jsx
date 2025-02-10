"use client";

import { useState } from "react";

const convertTemperature = (value, from, to) => {
  if (isNaN(value) || value === "") return "";

  const num = parseFloat(value);

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
      : ((num - 273.15) * 9) / 5 + 32;
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

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setResult(convertTemperature(inputValue, toUnit, fromUnit));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      <div className="mb-4">
        <input
          type="number"
          value={inputValue}
          onChange={handleConversion}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter temperature"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
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
          className="p-2 border rounded-lg bg-gray-200"
        >
          🔄
        </button>

        <select
          value={toUnit}
          onChange={(e) => {
            setToUnit(e.target.value);
            setResult(convertTemperature(inputValue, fromUnit, e.target.value));
          }}
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
        <div className="p-3 bg-gray-100 rounded-lg text-lg text-center">
          <strong>Converted Temperature: </strong> {result}° {toUnit}
        </div>
      )}
    </div>
  );
};

export default TemperatureConverter;
