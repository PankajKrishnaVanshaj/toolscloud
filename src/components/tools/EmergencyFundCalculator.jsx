"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCalculator, FaSync, FaChartPie } from "react-icons/fa";

const EmergencyFundCalculator = () => {
  const [monthlyExpenses, setMonthlyExpenses] = useState(2000);
  const [monthlyIncome, setMonthlyIncome] = useState(4000);
  const [monthsCoverage, setMonthsCoverage] = useState(6);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [savingsTimeline, setSavingsTimeline] = useState(12); // Months to save
  const [emergencyFund, setEmergencyFund] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const calculateEmergencyFund = useCallback(() => {
    const totalFund = monthlyExpenses * monthsCoverage;
    const remainingFund = Math.max(0, totalFund - currentSavings);
    const disposableIncome = Math.max(0, monthlyIncome - monthlyExpenses);
    const monthlySavingsNeeded =
      disposableIncome > 0 && savingsTimeline > 0
        ? remainingFund / savingsTimeline
        : 0;
    const monthsToGoal =
      disposableIncome > 0 && monthlySavingsNeeded > 0
        ? Math.ceil(remainingFund / disposableIncome)
        : Infinity;

    setEmergencyFund({
      total: totalFund.toFixed(2),
      remaining: remainingFund.toFixed(2),
      monthlySavings:
        monthlySavingsNeeded > 0 && monthlySavingsNeeded <= disposableIncome
          ? monthlySavingsNeeded.toFixed(2)
          : "N/A",
      monthsToGoal: monthsToGoal === Infinity ? "N/A" : monthsToGoal,
      disposableIncome: disposableIncome.toFixed(2),
    });
  }, [
    monthlyExpenses,
    monthlyIncome,
    monthsCoverage,
    currentSavings,
    savingsTimeline,
  ]);

  useEffect(() => {
    calculateEmergencyFund();
  }, [
    monthlyExpenses,
    monthlyIncome,
    monthsCoverage,
    currentSavings,
    savingsTimeline,
    calculateEmergencyFund,
  ]);

  const reset = () => {
    setMonthlyExpenses(2000);
    setMonthlyIncome(4000);
    setMonthsCoverage(6);
    setCurrentSavings(0);
    setSavingsTimeline(12);
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Emergency Fund Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Expenses ($)
            </label>
            <input
              type="number"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Income ($)
            </label>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desired Coverage (months)
            </label>
            <input
              type="number"
              value={monthsCoverage}
              onChange={(e) =>
                setMonthsCoverage(Math.max(1, Math.min(24, Number(e.target.value))))
              }
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1"
              max="24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Savings ($)
            </label>
            <input
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Savings Timeline (months)
            </label>
            <input
              type="number"
              value={savingsTimeline}
              onChange={(e) =>
                setSavingsTimeline(Math.max(1, Math.min(60, Number(e.target.value))))
              }
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1"
              max="60"
            />
          </div>
        </div>

        {/* Results */}
        {emergencyFund && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Your Emergency Fund Plan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Total Amount Needed</p>
                <p className="font-bold text-green-600 text-lg">
                  ${Number(emergencyFund.total).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Remaining to Save</p>
                <p className="font-bold text-orange-600 text-lg">
                  ${Number(emergencyFund.remaining).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Monthly Savings ({savingsTimeline} months)
                </p>
                <p className="font-medium text-blue-600 text-lg">
                  {emergencyFund.monthlySavings === "N/A"
                    ? "Income too low"
                    : `$${Number(emergencyFund.monthlySavings).toLocaleString()}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Months to Goal (at max savings)</p>
                <p className="font-medium text-purple-600 text-lg">
                  {emergencyFund.monthsToGoal === "N/A"
                    ? "N/A"
                    : `${emergencyFund.monthsToGoal} months`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-4 w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center"
            >
              <FaChartPie className="mr-2" />
              {showDetails ? "Hide Details" : "Show Details"}
            </button>
            {showDetails && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md text-sm text-gray-700">
                <p>
                  Disposable Income:{" "}
                  <span className="font-medium">
                    ${Number(emergencyFund.disposableIncome).toLocaleString()}
                  </span>
                </p>
                <p>
                  Coverage: <span className="font-medium">{monthsCoverage} months</span>
                </p>
                <p>
                  Savings Timeline:{" "}
                  <span className="font-medium">{savingsTimeline} months</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={calculateEmergencyFund}
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
            <li>Calculate total emergency fund needed</li>
            <li>Account for current savings</li>
            <li>Customizable savings timeline</li>
            <li>Estimate months to goal based on disposable income</li>
            <li>Detailed breakdown toggle</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmergencyFundCalculator;