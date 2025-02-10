"use client";

import { useState } from "react";

const lengthUnits = {
  meters: 1,
  kilometers: 0.001,
  miles: 0.000621371,
  inches: 39.3701,
  feet: 3.28084,
  yards: 1.09361,
  centimeters: 100,
};

const LengthConverter = () => {
  const [inputValue, setInputValue] = useState("");
  const [fromUnit, setFromUnit] = useState("meters");
  const [toUnit, setToUnit] = useState("kilometers");
  const [result, setResult] = useState("");

  const convertLength = (value, from, to) => {
    if (!value || isNaN(value)) return "";
    const inMeters = parseFloat(value) * lengthUnits[from];
    return (inMeters * (1 / lengthUnits[to])).toFixed(4);
  };

  const handleConversion = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setResult(convertLength(value, fromUnit, toUnit));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      <div className="mb-4">
        <input
          type="number"
          value={inputValue}
          onChange={handleConversion}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter length"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
          className="w-1/2 p-2 border rounded-lg"
        >
          {Object.keys(lengthUnits).map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        <select
          value={toUnit}
          onChange={(e) => {
            setToUnit(e.target.value);
            setResult(convertLength(inputValue, fromUnit, e.target.value));
          }}
          className="w-1/2 p-2 border rounded-lg"
        >
          {Object.keys(lengthUnits).map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      {result && (
        <div className="p-3 bg-gray-100 rounded-lg text-lg text-center">
          <strong>Converted Length: </strong> {result} {toUnit}
        </div>
      )}
    </div>
  );
};

export default LengthConverter;
