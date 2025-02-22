'use client'
import React, { useState } from 'react';

const UnitConverterCalculator = () => {
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

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
      miles: 1609.34
    },
    weight: {
      kilograms: 1,
      grams: 0.001,
      milligrams: 0.000001,
      pounds: 0.453592,
      ounces: 0.0283495
    },
    volume: {
      liters: 1,
      milliliters: 0.001,
      gallons: 3.78541,
      quarts: 0.946353,
      pints: 0.473176,
      cups: 0.24
    },
    temperature: {
      celsius: 'C',
      fahrenheit: 'F',
      kelvin: 'K'
    }
  };

  // Calculate conversion
  const convertUnits = (val, from, to, cat) => {
    if (cat === 'temperature') {
      if (from === to) return val;
      if (from === 'celsius') {
        if (to === 'fahrenheit') return (val * 9/5) + 32;
        if (to === 'kelvin') return val + 273.15;
      }
      if (from === 'fahrenheit') {
        if (to === 'celsius') return (val - 32) * 5/9;
        if (to === 'kelvin') return ((val - 32) * 5/9) + 273.15;
      }
      if (from === 'kelvin') {
        if (to === 'celsius') return val - 273.15;
        if (to === 'fahrenheit') return ((val - 273.15) * 9/5) + 32;
      }
    } else {
      const fromFactor = units[cat][from];
      const toFactor = units[cat][to];
      return (val * fromFactor) / toFactor;
    }
    return null; // Shouldn't reach here with valid inputs
  };

  const calculate = () => {
    setError('');
    setResult(null);

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return;
    }
    if (!fromUnit || !toUnit) {
      setError('Please select both units');
      return;
    }

    const converted = convertUnits(numValue, fromUnit, toUnit, category);
    if (converted === null) {
      setError('Conversion error - invalid unit combination');
      return;
    }

    setResult({
      value: numValue,
      fromUnit,
      toUnit,
      result: category === 'temperature' ? converted.toFixed(2) : converted.toFixed(4)
    });
  };

  const reset = () => {
    setValue('');
    setCategory('length');
    setFromUnit('');
    setToUnit('');
    setResult(null);
    setError('');
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setFromUnit('');
    setToUnit('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Unit Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          {/* Category Selection */}
          <div className="flex flex-wrap justify-center gap-2">
            {['length', 'weight', 'volume', 'temperature'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1 rounded-lg capitalize ${category === cat ? 'bg-lime-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-32 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-center"
                placeholder="Value"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
              >
                <option value="">From Unit</option>
                {Object.keys(units[category]).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-32 text-center">to</span>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
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

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-lime-600 text-white py-2 rounded-lg hover:bg-lime-700 transition-all font-semibold"
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
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-lime-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Conversion Result:</h2>
            <div className="mt-2 text-center">
              <p className="text-xl">
                {result.value} {result.fromUnit} = {result.result} {result.toUnit}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitConverterCalculator;