"use client";

import { useState } from "react";
import { BiTransfer } from "react-icons/bi"; // Swap icon

const lengthUnits = {
  meters: 1,
  kilometers: 0.001,
  miles: 0.000621371,
  inches: 39.3701,
  feet: 3.28084,
  yards: 1.09361,
  centimeters: 100,
  millimeters: 1000,
  micrometers: 1e6,
  nanometers: 1e9,
  nauticalMiles: 0.000539957,
};

const LengthConverter = () => {
  const [inputValue, setInputValue] = useState("");
  const [fromUnit, setFromUnit] = useState("meters");
  const [toUnit, setToUnit] = useState("kilometers");
  const [result, setResult] = useState("");

  const convertLength = (value, from, to) => {
    if (!value || isNaN(value)) return "";
    const inMeters = parseFloat(value) / lengthUnits[from];
    const convertedValue = inMeters * lengthUnits[to];
    return convertedValue.toFixed(4);
  };

  const handleConversion = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      setResult(convertLength(value, fromUnit, toUnit));
    } else {
      setResult("");
    }
  };

  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (inputValue) {
      setResult(convertLength(inputValue, toUnit, fromUnit));
    }
  };

  return (
    <div className="mx-auto p-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-lg max-w-md">

      <div className="mb-4">
        <input
          type="number"
          value={inputValue}
          onChange={handleConversion}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter length"
        />
      </div>

      <div className="flex gap-2 items-center mb-4">
        <select
          value={fromUnit}
          onChange={(e) => {
            setFromUnit(e.target.value);
            if (inputValue) {
              setResult(convertLength(inputValue, e.target.value, toUnit));
            }
          }}
          className="w-1/2 p-3 border rounded-lg"
        >
          {Object.keys(lengthUnits).map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        <button
          onClick={handleSwapUnits}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          aria-label="Swap units"
        >
          <BiTransfer size={24} />
        </button>

        <select
          value={toUnit}
          onChange={(e) => {
            setToUnit(e.target.value);
            if (inputValue) {
              setResult(convertLength(inputValue, fromUnit, e.target.value));
            }
          }}
          className="w-1/2 p-3 border rounded-lg"
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
