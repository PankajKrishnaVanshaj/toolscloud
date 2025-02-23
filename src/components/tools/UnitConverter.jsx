'use client';
import React, { useState, useCallback, useMemo } from 'react';

const UnitConverter = () => {
  const [category, setCategory] = useState('length');
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Conversion factors (relative to a base unit in each category)
  const conversionFactors = {
    length: {
      meters: 1, // Base unit
      kilometers: 1000,
      centimeters: 0.01,
      millimeters: 0.001,
      inches: 0.0254,
      feet: 0.3048,
      yards: 0.9144,
      miles: 1609.34,
    },
    weight: {
      kilograms: 1, // Base unit
      grams: 0.001,
      milligrams: 0.000001,
      ounces: 0.0283495,
      pounds: 0.453592,
      tonnes: 1000,
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
    },
  };

  // Convert units
  const convertUnits = useCallback(() => {
    const steps = [`Converting ${value} ${fromUnit} to ${toUnit}:`];
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return { error: 'Please enter a valid number' };
    }

    const factors = conversionFactors[category];
    if (!factors[fromUnit] || !factors[toUnit]) {
      return { error: 'Invalid unit selection' };
    }

    // Convert to base unit first (e.g., meters for length), then to target unit
    const baseValue = numValue * factors[fromUnit];
    const convertedValue = baseValue / factors[toUnit];
    
    steps.push(`Step 1: Convert ${value} ${fromUnit} to base unit (${Object.keys(factors)[0]}): ${value} * ${factors[fromUnit]} = ${baseValue}`);
    steps.push(`Step 2: Convert ${baseValue} ${Object.keys(factors)[0]} to ${toUnit}: ${baseValue} / ${factors[toUnit]} = ${convertedValue.toFixed(4)}`);
    
    return { result: convertedValue.toFixed(4), steps };
  }, [category, value, fromUnit, toUnit]);

  // Handle input changes
  const handleValueChange = (e) => {
    const val = e.target.value;
    setValue(val);
    setResult(null);
    if (val && isNaN(parseFloat(val))) {
      setErrors((prev) => ({ ...prev, value: 'Must be a number' }));
    } else {
      setErrors((prev) => ({ ...prev, value: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    return (
      value && !isNaN(parseFloat(value)) &&
      fromUnit && toUnit && fromUnit !== toUnit &&
      Object.values(errors).every(err => !err)
    );
  }, [value, fromUnit, toUnit, errors]);

  // Perform conversion
  const convert = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide a valid number and select different units',
      }));
      return;
    }

    const convResult = convertUnits();
    if (convResult.error) {
      setErrors({ general: convResult.error });
    } else {
      setResult(convResult);
    }
  };

  // Reset state
  const reset = () => {
    setCategory('length');
    setValue('');
    setFromUnit('');
    setToUnit('');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  // Available units for the selected category
  const units = Object.keys(conversionFactors[category]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Unit Converter
        </h1>

        {/* Category Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['length', 'weight', 'volume'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setFromUnit('');
                setToUnit('');
                setResult(null);
              }}
              className={`px-3 py-1 rounded-lg transition-colors ${category === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Value:</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={handleValueChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
                aria-label="Value to convert"
              />
              {errors.value && <p className="text-red-600 text-sm mt-1">{errors.value}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">From:</label>
            <div className="flex-1">
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
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">To:</label>
            <div className="flex-1">
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
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={convert}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Convert
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold"
          >
            Reset
          </button>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <p className="text-center text-xl">
              {value} {fromUnit} = {result.result} {toUnit}
            </p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? 'Hide Steps' : 'Show Steps'}
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
      </div>
    </div>
  );
};

export default UnitConverter;