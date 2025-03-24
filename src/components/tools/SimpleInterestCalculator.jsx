"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaCalculator } from "react-icons/fa";

const SimpleInterestCalculator = () => {
  const [principal, setPrincipal] = useState(1000);
  const [rate, setRate] = useState(5);
  const [time, setTime] = useState(1);
  const [timeUnit, setTimeUnit] = useState("years"); // years, months, days
  const [interest, setInterest] = useState(0);
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [showDetails, setShowDetails] = useState(false);

  // Convert time to years based on selected unit
  const convertTimeToYears = (time, unit) => {
    switch (unit) {
      case "months":
        return time / 12;
      case "days":
        return time / 365;
      default:
        return time; // years
    }
  };

  // Calculate interest
  const calculateInterest = useCallback(() => {
    const timeInYears = convertTimeToYears(time, timeUnit);
    const simpleInterest = (principal * rate * timeInYears) / 100;
    setInterest(simpleInterest);
    setTotal(Number(principal) + simpleInterest);
  }, [principal, rate, time, timeUnit]);

  useEffect(() => {
    calculateInterest();
  }, [principal, rate, time, timeUnit, calculateInterest]);

  // Reset to default values
  const reset = () => {
    setPrincipal(1000);
    setRate(5);
    setTime(1);
    setTimeUnit("years");
    setCurrency("USD");
    setShowDetails(false);
  };

  // Format currency based on selected currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Simple Interest Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Principal Amount
            </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="number"
              value={time}
              onChange={(e) => setTime(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Unit
            </label>
            <select
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="years">Years</option>
              <option value="months">Months</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showDetails}
                  onChange={(e) => setShowDetails(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Calculation Details</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="text-lg font-semibold mb-2 text-center">Results</h2>
          <div className="space-y-2 text-center">
            <p>
              Principal:
              <span className="font-medium"> {formatCurrency(principal)}</span>
            </p>
            <p>
              Interest Earned:
              <span className="font-medium text-green-600"> {formatCurrency(interest)}</span>
            </p>
            <p>
              Total Amount:
              <span className="font-bold text-blue-600"> {formatCurrency(total)}</span>
            </p>
          </div>

          {showDetails && (
            <div className="mt-4 p-2 bg-gray-100 rounded-md text-sm text-gray-600">
              <p>Formula: Interest = (Principal × Rate × Time) / 100</p>
              <p>
                Calculation: ({principal} × {rate} × {convertTimeToYears(time, timeUnit)}) / 100 =
                {interest.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={calculateInterest}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Recalculate
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time calculation with automatic updates</li>
            <li>Flexible time units: Years, Months, Days</li>
            <li>Multiple currency support</li>
            <li>Detailed calculation breakdown option</li>
            <li>Input validation and formatting</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleInterestCalculator;