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
};

const PhysicsUnitConverter = () => {
  const [category, setCategory] = useState("force");
  const [fromUnit, setFromUnit] = useState("N");
  const [toUnit, setToUnit] = useState("dyne");
  const [value, setValue] = useState("");
  const [result, setResult] = useState("");

  // Handle category change and update units accordingly
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const units = Object.keys(conversionFactors[newCategory]);
    setFromUnit(units[0]);
    setToUnit(units[1]);
    setResult("");
  };

  // Convert the given value
  const handleConvert = () => {
    if (!value) return;
    const convertedValue =
      (parseFloat(value) * conversionFactors[category][toUnit]) /
      conversionFactors[category][fromUnit];
    setResult(convertedValue.toFixed(4));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      {/* Category Selection */}
      <label className="block mb-1 font-medium">Select Category:</label>
      <select
        className="w-full p-2 border rounded-lg mb-3"
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
      <label className="block mb-1 font-medium">Value:</label>
      <input
        type="number"
        className="w-full p-2 border rounded-lg mb-3"
        placeholder="Enter value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {/* From Unit */}
      <label className="block mb-1 font-medium">From:</label>
      <select
        className="w-full p-2 border rounded-lg mb-3"
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
      <label className="block mb-1 font-medium">To:</label>
      <select
        className="w-full p-2 border rounded-lg mb-3"
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
        className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
