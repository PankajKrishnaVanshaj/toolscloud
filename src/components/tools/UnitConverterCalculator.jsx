"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaExchangeAlt, FaHistory } from "react-icons/fa";

const UnitConverterCalculator = () => {
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [precision, setPrecision] = useState(4);

  // Conversion factors (relative to a base unit)
  const units = {
    length: {
      meters: 1,
      kilometers: 1000,
      centimeters: 0.01,
      millimeters: 0.001,
      inches: 0.0254,
      feet: 0.3048,
      yards: 0.9144,
      miles: 1609.34,
      nauticalMiles: 1852,
    },
    weight: {
      kilograms: 1,
      grams: 0.001,
      milligrams: 0.000001,
      pounds: 0.453592,
      ounces: 0.0283495,
      tonnes: 1000,
    },
    volume: {
      liters: 1,
      milliliters: 0.001,
      gallons: 3.78541,
      quarts: 0.946353,
      pints: 0.473176,
      cups: 0.24,
      cubicMeters: 1000,
    },
    temperature: {
      celsius: "C",
      fahrenheit: "F",
      kelvin: "K",
    },
    area: {
      squareMeters: 1,
      squareKilometers: 1000000,
      squareCentimeters: 0.0001,
      squareFeet: 0.092903,
      squareYards: 0.836127,
      acres: 4046.86,
    },
    speed: {
      metersPerSecond: 1,
      kilometersPerHour: 0.277778,
      milesPerHour: 0.44704,
      knots: 0.514444,
    },
  };

  // Calculate conversion
  const convertUnits = useCallback((val, from, to, cat) => {
    if (cat === "temperature") {
      if (from === to) return val;
      if (from === "celsius") {
        if (to === "fahrenheit") return (val * 9 / 5) + 32;
        if (to === "kelvin") return val + 273.15;
      }
      if (from === "fahrenheit") {
        if (to === "celsius") return ((val - 32) * 5) / 9;
        if (to === "kelvin") return ((val - 32) * 5) / 9 + 273.15;
      }
      if (from === "kelvin") {
        if (to === "celsius") return val - 273.15;
        if (to === "fahrenheit") return ((val - 273.15) * 9) / 5 + 32;
      }
    } else {
      const fromFactor = units[cat][from];
      const toFactor = units[cat][to];
      return (val * fromFactor) / toFactor;
    }
    return null;
  }, []);

  // Perform conversion
  const calculate = () => {
    setError("");
    setResult(null);

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setError("Please enter a valid number");
      return;
    }
    if (!fromUnit || !toUnit) {
      setError("Please select both units");
      return;
    }

    const converted = convertUnits(numValue, fromUnit, toUnit, category);
    if (converted === null) {
      setError("Conversion error - invalid unit combination");
      return;
    }

    const resultValue = category === "temperature" ? converted.toFixed(2) : converted.toFixed(precision);
    const newResult = {
      value: numValue,
      fromUnit,
      toUnit,
      result: resultValue,
      category,
      timestamp: new Date().toLocaleTimeString(),
    };

    setResult(newResult);
    setHistory((prev) => [newResult, ...prev.slice(0, 9)]); // Keep last 10 conversions
  };

  // Reset all fields
  const reset = () => {
    setValue("");
    setCategory("length");
    setFromUnit("");
    setToUnit("");
    setResult(null);
    setError("");
    setPrecision(4);
  };

  // Swap units
  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result) {
      setValue(result.result);
      calculate();
    }
  };

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setFromUnit("");
    setToUnit("");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Unit Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          {/* Category Selection */}
          <div className="flex flex-wrap justify-center gap-2">
            {Object.keys(units).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1 rounded-lg capitalize text-sm sm:text-base ${
                  category === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Conversion Inputs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full sm:w-32 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                placeholder="Value"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full sm:flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">From Unit</option>
                {Object.keys(units[category]).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={swapUnits}
                className="w-full sm:w-32 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
              >
                <FaExchangeAlt className="text-gray-600" />
              </button>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full sm:flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">To Unit</option>
                {Object.keys(units[category]).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Precision Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precision (Decimal Places: {precision})
            </label>
            <input
              type="range"
              min="0"
              max="8"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              Convert
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              Conversion Result
            </h2>
            <p className="mt-2 text-xl text-center">
              {result.value} {result.fromUnit} = {result.result} {result.toUnit}
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
              <FaHistory className="mr-2" /> Conversion History
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
              {history.map((entry, index) => (
                <li key={index}>
                  {entry.timestamp}: {entry.value} {entry.fromUnit} → {entry.result}{" "}
                  {entry.toUnit} ({entry.category})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple categories: Length, Weight, Volume, Temperature, Area, Speed</li>
            <li>Unit swapping with recalculation</li>
            <li>Adjustable precision (0-8 decimal places)</li>
            <li>Conversion history (last 10)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UnitConverterCalculator;