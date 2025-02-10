"use client";

import { useState } from "react";

const weightUnits = {
  kilograms: 1,
  grams: 1000,
  pounds: 2.20462,
  ounces: 35.274,
  tons: 0.001,
};

const WeightConverter = () => {
  const [inputValue, setInputValue] = useState("");
  const [fromUnit, setFromUnit] = useState("kilograms");
  const [toUnit, setToUnit] = useState("grams");
  const [result, setResult] = useState("");

  const convertWeight = (value, from, to) => {
    if (!value || isNaN(value)) return "";
    const inKilograms = parseFloat(value) * weightUnits[from];
    return (inKilograms * (1 / weightUnits[to])).toFixed(4);
  };

  const handleConversion = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setResult(convertWeight(value, fromUnit, toUnit));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      <div className="mb-4">
        <input
          type="number"
          value={inputValue}
          onChange={handleConversion}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter weight"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
          className="w-1/2 p-2 border rounded-lg"
        >
          {Object.keys(weightUnits).map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>

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
