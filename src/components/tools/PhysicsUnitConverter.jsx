"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy, FaHistory } from "react-icons/fa";

// Extended conversion factors for physics units
const conversionFactors = {
  force: { N: 1, dyne: 1e5, lbf: 0.224809, kgf: 0.101972 },
  energy: { J: 1, kJ: 0.001, cal: 0.239006, kcal: 0.000239006, eV: 6.242e18, Wh: 0.000277778 },
  power: { W: 1, kW: 0.001, MW: 0.000001, hp: 0.001341, "cal/s": 0.2388459 },
  pressure: { Pa: 1, kPa: 0.001, atm: 9.869e-6, bar: 1e-5, psi: 0.000145038, mmHg: 0.00750062 },
  density: { "kg/m³": 1, "g/cm³": 0.001, "lb/ft³": 0.062428, "kg/L": 0.001 },
  velocity: { "m/s": 1, "km/h": 3.6, "mph": 2.23694, "ft/s": 3.28084, "kn": 1.94384 },
  temperature: { C: "Celsius", F: "Fahrenheit", K: "Kelvin" },
  time: { s: 1, min: 1 / 60, h: 1 / 3600, ms: 1000, µs: 1e6 },
  length: { m: 1, km: 0.001, cm: 100, mm: 1000, ft: 3.28084, in: 39.3701, mi: 0.000621371 },
  mass: { kg: 1, g: 1000, mg: 1e6, lb: 2.20462, oz: 35.274 },
};

// Temperature conversion function
const convertTemperature = (value, fromUnit, toUnit) => {
  value = parseFloat(value);
  if (fromUnit === toUnit) return value;

  if (fromUnit === "C") {
    if (toUnit === "F") return (value * 9) / 5 + 32;
    if (toUnit === "K") return value + 273.15;
  }
  if (fromUnit === "F") {
    if (toUnit === "C") return ((value - 32) * 5) / 9;
    if (toUnit === "K") return ((value - 32) * 5) / 9 + 273.15;
  }
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
  const [precision, setPrecision] = useState(4);
  const [history, setHistory] = useState([]);

  // Handle category change
  const handleCategoryChange = useCallback((newCategory) => {
    setCategory(newCategory);
    const units = Object.keys(conversionFactors[newCategory]);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
    setResult("");
  }, []);

  // Convert the value
  const handleConvert = useCallback(() => {
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
    const formattedResult = convertedValue.toFixed(precision);
    setResult(formattedResult);
    setHistory((prev) => [
      `${value} ${fromUnit} = ${formattedResult} ${toUnit} (${category})`,
      ...prev.slice(0, 9),
    ]);
  }, [value, category, fromUnit, toUnit, precision]);

  // Reset all fields
  const reset = () => {
    setValue("");
    setResult("");
    setPrecision(4);
    setHistory([]);
    setCategory("force");
    setFromUnit("N");
    setToUnit("dyne");
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(`${result} ${toUnit}`);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Physics Unit Converter</h1>

        {/* Category Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(conversionFactors).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precision (decimals)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={precision}
              onChange={(e) => setPrecision(Math.max(0, Math.min(10, e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversion Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(conversionFactors[category]).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(conversionFactors[category]).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleConvert}
            disabled={!value}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Convert
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!result || result === "Invalid input"}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCopy className="mr-2" /> Copy Result
          </button>
        </div>

        {/* Result Display */}
        {result !== "" && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">
              Result: <strong>{result}</strong> {toUnit}
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
                <li key={index}>{entry}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports multiple physics categories</li>
            <li>Adjustable precision (0-10 decimals)</li>
            <li>Temperature conversion with special handling</li>
            <li>Conversion history (last 10 entries)</li>
            <li>Copy result to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PhysicsUnitConverter;