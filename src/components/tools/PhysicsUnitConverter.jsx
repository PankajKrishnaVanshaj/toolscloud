"use client";

import { useState } from "react";

// Conversion factors for physics units
const conversionFactors = {
  force: {
    N: 1,
    dyne: 1e5,
    lbf: 0.224809,
  },
  energy: {
    J: 1,
    kJ: 0.001,
    cal: 0.239006,
    eV: 6.242e18,
  },
  power: {
    W: 1,
    kW: 0.001,
    hp: 0.001341,
  },
  pressure: {
    Pa: 1,
    atm: 9.869e-6,
    bar: 1e-5,
    psi: 0.000145038,
  },
  density: {
    "kg/m³": 1,
    "g/cm³": 0.001,
    "lb/ft³": 0.062428,
  },
  velocity: {
    "m/s": 1,
    "km/h": 3.6,
    "mph": 2.23694,
    "ft/s": 3.28084,
  },
  temperature: {
    C: "Celsius",
    F: "Fahrenheit",
    K: "Kelvin",
  },
  time: {
    s: 1,
    min: 1 / 60,
    h: 1 / 3600,
    ms: 1000,
  },
};

const convertTemperature = (value, fromUnit, toUnit) => {
  value = parseFloat(value);
  if (fromUnit === toUnit) return value;

  // Celsius to other units
  if (fromUnit === "C") {
    if (toUnit === "F") return (value * 9) / 5 + 32;
    if (toUnit === "K") return value + 273.15;
  }
  // Fahrenheit to other units
  if (fromUnit === "F") {
    if (toUnit === "C") return ((value - 32) * 5) / 9;
    if (toUnit === "K") return ((value - 32) * 5) / 9 + 273.15;
  }
  // Kelvin to other units
  if (fromUnit === "K") {
    if (toUnit === "C") return value - 273.15;
    if (toUnit === "F") return ((value - 273.15) * 9) / 5 + 32;
  }
};

const PhysicsUnitConverter = () => {
  const [category, setCategory] = useState("force");
  const [fromUnit, setFromUnit] = useState("N");
  const [toUnit, setToUnit] = useState("dyne");
  const [value, setValue] = useState("");
  const [result, setResult] = useState("");

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const units = Object.keys(conversionFactors[newCategory]);
    setFromUnit(units[0]);
    setToUnit(units[1]);
    setResult("");
  };

  // Convert the given value
  const handleConvert = () => {
    if (!value || isNaN(value)) {
      setResult("Invalid input");
      return;
    }

    let convertedValue;
    if (category === "temperature") {
      convertedValue = convertTemperature(value, fromUnit, toUnit);
    } else {
      convertedValue =
        (parseFloat(value) * conversionFactors[category][toUnit]) /
        conversionFactors[category][fromUnit];
    }
    setResult(convertedValue.toFixed(4));
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Physics Unit Converter</h1>

      {/* Category Selection */}
      <label className="block mb-2 font-medium">Select Category:</label>
      <select
        className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-primary"
        value={category}
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        {Object.keys(conversionFactors).map((cat) => (
          <option key={cat} value={cat}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </option>
        ))}
      </select>

      {/* Input Value */}
      <label className="block mb-2 font-medium">Value:</label>
      <input
        type="number"
        className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-primary"
        placeholder="Enter value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {/* From Unit */}
      <label className="block mb-2 font-medium">From:</label>
      <select
        className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-primary"
        value={fromUnit}
        onChange={(e) => setFromUnit(e.target.value)}
      >
        {Object.keys(conversionFactors[category]).map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>

      {/* To Unit */}
      <label className="block mb-2 font-medium">To:</label>
      <select
        className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-primary"
        value={toUnit}
        onChange={(e) => setToUnit(e.target.value)}
      >
        {Object.keys(conversionFactors[category]).map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        Convert
      </button>

      {/* Result Display */}
      {result !== "" && (
        <div className="mt-4 p-3 border rounded-lg bg-gray-100">
          Result: <strong>{result}</strong> {toUnit}
        </div>
      )}
    </div>
  );
};

export default PhysicsUnitConverter;
