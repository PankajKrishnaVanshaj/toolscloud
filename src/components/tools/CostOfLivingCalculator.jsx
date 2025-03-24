"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaPlus, FaTrash } from "react-icons/fa";

const CostOfLivingCalculator = () => {
  const [expenses, setExpenses] = useState({
    housing: 0,
    utilities: 0,
    groceries: 0,
    transportation: 0,
    healthcare: 0,
    entertainment: 0,
    miscellaneous: 0,
  });
  const [customExpenses, setCustomExpenses] = useState({});
  const [locationIndex, setLocationIndex] = useState(100);
  const [results, setResults] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [customLocation, setCustomLocation] = useState("");
  const [customIndex, setCustomIndex] = useState("");

  // Sample cost of living indices
  const locations = {
    "Average US City": 100,
    "New York City": 187,
    "San Francisco": 170,
    "Chicago": 122,
    "Houston": 96,
    "Miami": 115,
    "London": 145,
    "Tokyo": 130,
  };

  const calculateCostOfLiving = useCallback(() => {
    const allExpenses = { ...expenses, ...customExpenses };
    const monthlyBase = Object.values(allExpenses).reduce(
      (sum, val) => sum + Number(val),
      0
    );
    const annualBase = monthlyBase * 12;
    const adjustmentFactor = locationIndex / 100;
    const monthlyAdjusted = monthlyBase * adjustmentFactor;
    const annualAdjusted = annualBase * adjustmentFactor;

    setResults({
      monthlyBase: monthlyBase.toFixed(2),
      annualBase: annualBase.toFixed(2),
      monthlyAdjusted: monthlyAdjusted.toFixed(2),
      annualAdjusted: annualAdjusted.toFixed(2),
    });
  }, [expenses, customExpenses, locationIndex]);

  useEffect(() => {
    calculateCostOfLiving();
  }, [expenses, customExpenses, locationIndex, calculateCostOfLiving]);

  const handleInputChange = (category, value, isCustom = false) => {
    const newValue = value >= 0 ? value : 0;
    if (isCustom) {
      setCustomExpenses((prev) => ({ ...prev, [category]: newValue }));
    } else {
      setExpenses((prev) => ({ ...prev, [category]: newValue }));
    }
  };

  const addCustomExpense = () => {
    if (customExpenses["Custom " + Object.keys(customExpenses).length]) return;
    setCustomExpenses((prev) => ({
      ...prev,
      ["Custom " + Object.keys(customExpenses).length]: 0,
    }));
  };

  const removeCustomExpense = (category) => {
    setCustomExpenses((prev) => {
      const newExpenses = { ...prev };
      delete newExpenses[category];
      return newExpenses;
    });
  };

  const addCustomLocation = () => {
    if (!customLocation || !customIndex || isNaN(customIndex)) return;
    locations[customLocation] = Number(customIndex);
    setLocationIndex(Number(customIndex));
    setCustomLocation("");
    setCustomIndex("");
  };

  const reset = () => {
    setExpenses({
      housing: 0,
      utilities: 0,
      groceries: 0,
      transportation: 0,
      healthcare: 0,
      entertainment: 0,
      miscellaneous: 0,
    });
    setCustomExpenses({});
    setLocationIndex(100);
    setCurrency("USD");
    setCustomLocation("");
    setCustomIndex("");
    setResults(null);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Cost of Living Calculator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Predefined Expenses */}
            {Object.keys(expenses).map((category) => (
              <div key={category}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {category} ({currency}/month)
                </label>
                <input
                  type="number"
                  value={expenses[category]}
                  onChange={(e) => handleInputChange(category, Number(e.target.value))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="10"
                />
              </div>
            ))}
            {/* Custom Expenses */}
            {Object.keys(customExpenses).map((category) => (
              <div key={category} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {category} ({currency}/month)
                </label>
                <input
                  type="number"
                  value={customExpenses[category]}
                  onChange={(e) => handleInputChange(category, Number(e.target.value), true)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="10"
                />
                <button
                  onClick={() => removeCustomExpense(category)}
                  className="absolute top-0 right-0 p-1 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            {/* Location and Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                value={locationIndex}
                onChange={(e) => setLocationIndex(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(locations).map(([name, index]) => (
                  <option key={name} value={index}>
                    {name} (Index: {index})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>

          {/* Custom Location */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Add Custom Location
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Location Name"
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={customIndex}
                onChange={(e) => setCustomIndex(e.target.value)}
                placeholder="Index (e.g., 120)"
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <button
                onClick={addCustomLocation}
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Add
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={addCustomExpense}
              className="ml-4 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add Custom Expense
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="mt-6 bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2 text-center">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Base Cost (Your Input):</p>
                <p>
                  Monthly:{" "}
                  <span className="font-bold">
                    {currency} {Number(results.monthlyBase).toLocaleString()}
                  </span>
                </p>
                <p>
                  Annual:{" "}
                  <span className="font-bold">
                    {currency} {Number(results.annualBase).toLocaleString()}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Adjusted for Location (Index: {locationIndex}):
                </p>
                <p>
                  Monthly:{" "}
                  <span className="font-bold text-blue-600">
                    {currency} {Number(results.monthlyAdjusted).toLocaleString()}
                  </span>
                </p>
                <p>
                  Annual:{" "}
                  <span className="font-bold text-blue-600">
                    {currency} {Number(results.annualAdjusted).toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate base and location-adjusted costs</li>
            <li>Add custom expense categories</li>
            <li>Custom location with adjustable index</li>
            <li>Multiple currency options</li>
            <li>Real-time updates</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Note: Costs are estimates based on your input and simplified location indices.
          Actual costs may vary. Indices are relative to an average US city (100).
        </p>
      </div>
    </div>
  );
};

export default CostOfLivingCalculator;