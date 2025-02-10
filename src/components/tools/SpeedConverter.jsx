"use client";

import { useState } from "react";

const speedConversionRates = {
  "Kilometers per Hour": {
    "Kilometers per Hour": 1,
    "Miles per Hour": 0.621371,
    "Meters per Second": 0.277778,
    "Feet per Second": 0.911344,
  },
  "Miles per Hour": {
    "Kilometers per Hour": 1.60934,
    "Miles per Hour": 1,
    "Meters per Second": 0.44704,
    "Feet per Second": 1.46667,
  },
  "Meters per Second": {
    "Kilometers per Hour": 3.6,
    "Miles per Hour": 2.23694,
    "Meters per Second": 1,
    "Feet per Second": 3.28084,
  },
  "Feet per Second": {
    "Kilometers per Hour": 1.09728,
    "Miles per Hour": 0.681818,
    "Meters per Second": 0.3048,
    "Feet per Second": 1,
  },
};

const convertSpeed = (value, from, to) => {
  if (isNaN(value) || value === "") return "";
  return (parseFloat(value) * speedConversionRates[from][to]).toFixed(4);
};

const SpeedConverter = () => {
  const [inputValue, setInputValue] = useState("");
  const [fromUnit, setFromUnit] = useState("Kilometers per Hour");
  const [toUnit, setToUnit] = useState("Miles per Hour");
  const [result, setResult] = useState("");

  const handleConversion = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setResult(convertSpeed(value, fromUnit, toUnit));
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setResult(convertSpeed(inputValue, toUnit, fromUnit));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      <div className="mb-4">
        <input
          type="number"
          value={inputValue}
          onChange={handleConversion}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter speed"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
          className="w-1/2 p-2 border rounded-lg"
        >
          {Object.keys(speedConversionRates).map((unit) => (
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
            setResult(convertSpeed(inputValue, fromUnit, e.target.value));
          }}
          className="w-1/2 p-2 border rounded-lg"
        >
          {Object.keys(speedConversionRates).map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      {result && (
        <div className="p-3 bg-gray-100 rounded-lg text-lg text-center">
          <strong>Converted Speed: </strong> {result} {toUnit}
        </div>
      )}
    </div>
  );
};

export default SpeedConverter;
