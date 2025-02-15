"use client";

import { useState, useEffect } from "react";

const speedConversionRates = {
  "Kilometers per Hour": {
    "Kilometers per Hour": 1,
    "Miles per Hour": 0.621371,
    "Meters per Second": 0.277778,
    "Feet per Second": 0.911344,
    "Knots": 0.539957,
    "Mach (at sea level)": 0.0008163,
    "Light Speed": 9.265669e-10,
  },
  "Miles per Hour": {
    "Kilometers per Hour": 1.60934,
    "Miles per Hour": 1,
    "Meters per Second": 0.44704,
    "Feet per Second": 1.46667,
    "Knots": 0.868976,
    "Mach (at sea level)": 0.00130332,
    "Light Speed": 1.491162e-9,
  },
  "Meters per Second": {
    "Kilometers per Hour": 3.6,
    "Miles per Hour": 2.23694,
    "Meters per Second": 1,
    "Feet per Second": 3.28084,
    "Knots": 1.94384,
    "Mach (at sea level)": 0.00293867,
    "Light Speed": 3.335641e-9,
  },
  "Feet per Second": {
    "Kilometers per Hour": 1.09728,
    "Miles per Hour": 0.681818,
    "Meters per Second": 0.3048,
    "Feet per Second": 1,
    "Knots": 0.592484,
    "Mach (at sea level)": 0.00089408,
    "Light Speed": 1.016703e-9,
  },
  "Knots": {
    "Kilometers per Hour": 1.852,
    "Miles per Hour": 1.15078,
    "Meters per Second": 0.514444,
    "Feet per Second": 1.68781,
    "Knots": 1,
    "Mach (at sea level)": 0.00151468,
    "Light Speed": 1.717119e-9,
  },
  "Mach (at sea level)": {
    "Kilometers per Hour": 1225.08,
    "Miles per Hour": 761.207,
    "Meters per Second": 340.29,
    "Feet per Second": 1116.47,
    "Knots": 661.47,
    "Mach (at sea level)": 1,
    "Light Speed": 0.000001126,
  },
  "Light Speed": {
    "Kilometers per Hour": 1.079e+9,
    "Miles per Hour": 6.706e+8,
    "Meters per Second": 299792458,
    "Feet per Second": 983571056.43,
    "Knots": 5.827e+8,
    "Mach (at sea level)": 886000,
    "Light Speed": 1,
  },
};

const convertSpeed = (value, from, to) => {
  if (isNaN(value) || value === "" || value < 0) return "";
  return (parseFloat(value) * speedConversionRates[from][to]).toFixed(4);
};

const SpeedConverter = () => {
  const [inputValue, setInputValue] = useState("");
  const [fromUnit, setFromUnit] = useState("Kilometers per Hour");
  const [toUnit, setToUnit] = useState("Miles per Hour");
  const [result, setResult] = useState("");

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setResult(convertSpeed(inputValue, fromUnit, toUnit));
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [inputValue, fromUnit, toUnit]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setInputValue(value);
    }
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="mx-auto p-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-lg max-w-lg">
      <div className="mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
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
          onChange={(e) => setToUnit(e.target.value)}
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
