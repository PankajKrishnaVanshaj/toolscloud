"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaSync, FaExchangeAlt, FaHistory } from "react-icons/fa";

const UnitConverter = () => {
  const [category, setCategory] = useState("length");
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [history, setHistory] = useState([]);
  const [decimalPlaces, setDecimalPlaces] = useState(4);

  // Expanded conversion factors
  const conversionFactors = useMemo(
    () => ({
      length: {
        meters: 1, // Base unit
        kilometers: 1000,
        centimeters: 0.01,
        millimeters: 0.001,
        inches: 0.0254,
        feet: 0.3048,
        yards: 0.9144,
        miles: 1609.34,
        nautical_miles: 1852,
      },
      weight: {
        kilograms: 1, // Base unit
        grams: 0.001,
        milligrams: 0.000001,
        ounces: 0.0283495,
        pounds: 0.453592,
        tonnes: 1000,
        stones: 6.35029,
      },
      volume: {
        liters: 1, // Base unit
        milliliters: 0.001,
        cubic_meters: 1000,
        cubic_centimeters: 0.001,
        gallons: 3.78541,
        quarts: 0.946353,
        pints: 0.473176,
        fluid_ounces: 0.0295735,
        cups: 0.236588,
      },
      temperature: {
        celsius: (val) => val, // Base unit (special case)
        fahrenheit: (val) => (val * 9) / 5 + 32,
        kelvin: (val) => val + 273.15,
      },
      area: {
        square_meters: 1, // Base unit
        square_kilometers: 1000000,
        square_centimeters: 0.0001,
        square_millimeters: 0.000001,
        square_inches: 0.00064516,
        square_feet: 0.092903,
        square_yards: 0.836127,
        acres: 4046.86,
      },
      speed: {
        meters_per_second: 1, // Base unit
        kilometers_per_hour: 0.277778,
        miles_per_hour: 0.44704,
        knots: 0.514444,
      },
    }),
    []
  );

  // Convert units with temperature handling
  const convertUnits = useCallback(() => {
    const steps = [`Converting ${value} ${fromUnit} to ${toUnit}:`];
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return { error: "Please enter a valid number" };
    }

    const factors = conversionFactors[category];
    if (!factors[fromUnit] || !factors[toUnit]) {
      return { error: "Invalid unit selection" };
    }

    let convertedValue;
    if (category === "temperature") {
      // Convert to Celsius first (base unit), then to target unit
      let celsiusValue;
      if (fromUnit === "celsius") celsiusValue = numValue;
      else if (fromUnit === "fahrenheit") celsiusValue = ((numValue - 32) * 5) / 9;
      else if (fromUnit === "kelvin") celsiusValue = numValue - 273.15;

      steps.push(
        `Step 1: Convert ${value} ${fromUnit} to Celsius: ${celsiusValue.toFixed(
          decimalPlaces
        )}`
      );

      if (toUnit === "celsius") convertedValue = celsiusValue;
      else if (toUnit === "fahrenheit")
        convertedValue = (celsiusValue * 9) / 5 + 32;
      else if (toUnit === "kelvin") convertedValue = celsiusValue + 273.15;

      steps.push(
        `Step 2: Convert ${celsiusValue.toFixed(decimalPlaces)} Celsius to ${
          toUnit
        }: ${convertedValue.toFixed(decimalPlaces)}`
      );
    } else {
      const baseValue = numValue * factors[fromUnit];
      convertedValue = baseValue / factors[toUnit];
      steps.push(
        `Step 1: Convert ${value} ${fromUnit} to base unit (${
          Object.keys(factors)[0]
        }): ${value} * ${factors[fromUnit]} = ${baseValue.toFixed(decimalPlaces)}`
      );
      steps.push(
        `Step 2: Convert ${baseValue.toFixed(decimalPlaces)} ${
          Object.keys(factors)[0]
        } to ${toUnit}: ${baseValue} / ${factors[toUnit]} = ${convertedValue.toFixed(
          decimalPlaces
        )}`
      );
    }

    return { result: convertedValue.toFixed(decimalPlaces), steps };
  }, [category, value, fromUnit, toUnit, decimalPlaces]);

  // Handle input changes
  const handleValueChange = (e) => {
    const val = e.target.value;
    setValue(val);
    setResult(null);
    setErrors((prev) => ({
      ...prev,
      value: val && isNaN(parseFloat(val)) ? "Must be a number" : "",
    }));
  };

  // Swap units
  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setResult(null);
  };

  // Validation
  const isValid = useMemo(
    () =>
      value &&
      !isNaN(parseFloat(value)) &&
      fromUnit &&
      toUnit &&
      fromUnit !== toUnit &&
      Object.values(errors).every((err) => !err),
    [value, fromUnit, toUnit, errors]
  );

  // Perform conversion
  const convert = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide a valid number and select different units" });
      return;
    }

    const convResult = convertUnits();
    if (convResult.error) {
      setErrors({ general: convResult.error });
    } else {
      setResult(convResult);
      setHistory((prev) => [
        `${value} ${fromUnit} = ${convResult.result} ${toUnit}`,
        ...prev.slice(0, 9),
      ]);
    }
  };

  // Reset state
  const reset = () => {
    setCategory("length");
    setValue("");
    setFromUnit("");
    setToUnit("");
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setDecimalPlaces(4);
  };

  const units = Object.keys(conversionFactors[category]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Unit Converter
        </h1>

        {/* Category Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {Object.keys(conversionFactors).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setFromUnit("");
                setToUnit("");
                setResult(null);
              }}
              className={`px-3 py-1 rounded-lg transition-colors text-sm sm:text-base ${
                category === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {cat.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-2">
            <label className="text-gray-700">Value:</label>
            <div>
              <input
                type="number"
                step="any"
                value={value}
                onChange={handleValueChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
                aria-label="Value to convert"
              />
              {errors.value && (
                <p className="text-red-600 text-sm mt-1">{errors.value}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_1fr] items-center gap-2">
            <label className="text-gray-700">From:</label>
            <select
              value={fromUnit}
              onChange={(e) => {
                setFromUnit(e.target.value);
                setResult(null);
              }}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Unit to convert from"
            >
              <option value="">Select unit</option>
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit.replace("_", " ")}
                </option>
              ))}
            </select>
            <button
              onClick={swapUnits}
              disabled={!fromUnit || !toUnit}
              className="p-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              aria-label="Swap units"
            >
              <FaExchangeAlt size={20} />
            </button>
            <label className="text-gray-700">To:</label>
            <select
              value={toUnit}
              onChange={(e) => {
                setToUnit(e.target.value);
                setResult(null);
              }}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Unit to convert to"
            >
              <option value="">Select unit</option>
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-2">
            <label className="text-gray-700">Decimal Places:</label>
            <input
              type="number"
              min="0"
              max="10"
              value={decimalPlaces}
              onChange={(e) => setDecimalPlaces(Math.max(0, Math.min(10, e.target.value)))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={convert}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Convert
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <p className="text-center text-xl sm:text-2xl">
              {value} {fromUnit.replace("_", " ")} = {result.result}{" "}
              {toUnit.replace("_", " ")}
            </p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside transition-opacity">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Conversion History */}
        {history.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> History
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
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
            <li>Multiple categories: Length, Weight, Volume, Temperature, Area, Speed</li>
            <li>Step-by-step conversion breakdown</li>
            <li>Unit swapping with one click</li>
            <li>Conversion history (last 10)</li>
            <li>Customizable decimal places</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;