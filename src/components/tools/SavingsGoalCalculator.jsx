"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCalculator, FaSync } from "react-icons/fa";

const SavingsGoalCalculator = () => {
  const [goalAmount, setGoalAmount] = useState(10000);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthlySavings, setMonthlySavings] = useState(500);
  const [interestRate, setInterestRate] = useState(2);
  const [timeFrame, setTimeFrame] = useState(5); // In years
  const [results, setResults] = useState(null);
  const [showChart, setShowChart] = useState(false);

  const calculateSavings = useCallback(() => {
    const monthlyRate = interestRate / 100 / 12;
    let remaining = goalAmount - currentSavings;
    let months = 0;
    let balance = currentSavings;
    const balances = [balance]; // For chart

    if (monthlySavings <= 0) {
      setResults({
        months: Infinity,
        monthlyRequired: remaining > 0 ? "N/A" : 0,
        chartData: [],
      });
      return;
    }

    // Calculate months to reach goal with compound interest
    while (balance < goalAmount && months < 1200) {
      balance = balance * (1 + monthlyRate) + monthlySavings;
      months++;
      balances.push(balance);
    }

    // Calculate required monthly savings for specified timeframe
    const monthsForMonthly = timeFrame * 12;
    const futureValueFactor = Math.pow(1 + monthlyRate, monthsForMonthly);
    const monthlyRequired =
      (goalAmount - currentSavings * futureValueFactor) /
      ((futureValueFactor - 1) / monthlyRate);

    setResults({
      months: balance >= goalAmount ? months : "Goal not reachable",
      monthlyRequired: monthlyRequired > 0 ? monthlyRequired.toFixed(2) : 0,
      chartData: balances.slice(0, months + 1), // Include initial balance
    });
  }, [goalAmount, currentSavings, monthlySavings, interestRate, timeFrame]);

  useEffect(() => {
    calculateSavings();
  }, [calculateSavings]);

  // Reset all inputs
  const reset = () => {
    setGoalAmount(10000);
    setCurrentSavings(0);
    setMonthlySavings(500);
    setInterestRate(2);
    setTimeFrame(5);
    setShowChart(false);
  };

  // Simple chart rendering (text-based representation)
  const renderChart = () => {
    if (!results?.chartData || results.months === Infinity) return null;

    const maxValue = Math.max(...results.chartData, goalAmount);
    const scale = 100 / maxValue; // Scale to percentage for height
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg overflow-x-auto">
        <h3 className="text-lg font-semibold mb-2">Savings Progress</h3>
        <div className="flex items-end h-64 gap-1">
          {results.chartData.map((value, index) => (
            <div
              key={index}
              className="bg-blue-500 w-2 rounded-t"
              style={{ height: `${value * scale}%` }}
              title={`Month ${index}: $${value.toFixed(2)}`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {results.chartData.length - 1} months
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Savings Goal Calculator
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Savings Goal ($)",
              value: goalAmount,
              setter: setGoalAmount,
              min: 0,
            },
            {
              label: "Current Savings ($)",
              value: currentSavings,
              setter: setCurrentSavings,
              min: 0,
            },
            {
              label: "Monthly Savings ($)",
              value: monthlySavings,
              setter: setMonthlySavings,
              min: 0,
            },
            {
              label: "Annual Interest Rate (%)",
              value: interestRate,
              setter: setInterestRate,
              min: 0,
              max: 20,
              step: 0.1,
            },
            {
              label: "Time Frame (Years)",
              value: timeFrame,
              setter: setTimeFrame,
              min: 1,
              max: 50,
            },
          ].map(({ label, value, setter, min, max, step = 1 }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min={min}
                max={max}
                step={step}
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setShowChart(!showChart)}
            disabled={!results || results.months === Infinity}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" />
            {showChart ? "Hide Chart" : "Show Chart"}
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {results && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Results</h2>
            <div className="space-y-2">
              <p>
                Time to Reach Goal:{" "}
                <span className="font-bold text-green-600">
                  {results.months === Infinity
                    ? "Never (increase monthly savings)"
                    : typeof results.months === "number"
                    ? `${results.months} months (${(results.months / 12).toFixed(1)} years)`
                    : results.months}
                </span>
              </p>
              <p>
                Monthly Savings Needed ({timeFrame}-year goal):{" "}
                <span className="font-bold text-green-600">
                  ${Number(results.monthlyRequired).toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        )}

        {showChart && renderChart()}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculates time to reach savings goal with compound interest</li>
            <li>Estimates monthly savings needed for a custom time frame</li>
            <li>Visual progress chart</li>
            <li>Adjustable interest rate and time frame</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Note: Calculations include compound interest and assume consistent monthly savings.
          Results are estimates only and do not account for inflation or fees.
        </p>
      </div>
    </div>
  );
};

export default SavingsGoalCalculator;