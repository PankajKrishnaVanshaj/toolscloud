"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaChartLine } from "react-icons/fa";

const FinancialIndependenceCalculator = () => {
  const [annualExpenses, setAnnualExpenses] = useState(40000);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [annualSavings, setAnnualSavings] = useState(20000);
  const [returnRate, setReturnRate] = useState(7);
  const [withdrawalRate, setWithdrawalRate] = useState(4);
  const [inflationRate, setInflationRate] = useState(2);
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const calculateFI = useCallback(() => {
    const monthlyReturn = returnRate / 100 / 12;
    const monthlyWithdrawalRate = withdrawalRate / 100;
    const monthlyInflationRate = inflationRate / 100 / 12;
    const realReturnRate = (1 + monthlyReturn) / (1 + monthlyInflationRate) - 1; // Adjust for inflation
    const fiNumber = annualExpenses / monthlyWithdrawalRate; // Amount needed for FI

    let years = 0;
    let totalSavings = currentSavings;
    let savingsHistory = [{ year: 0, savings: totalSavings }];

    // Calculate years to FI with inflation-adjusted returns
    while (totalSavings < fiNumber && years < 100) {
      totalSavings = totalSavings * (1 + realReturnRate * 12) + annualSavings;
      years++;
      savingsHistory.push({ year: years, savings: totalSavings });
    }

    const monthlyIncome = (fiNumber * monthlyWithdrawalRate) / 12;
    const yearlyIncome = monthlyIncome * 12;

    setResults({
      fiNumber: fiNumber.toFixed(2),
      yearsToFI: years < 100 ? years : "100+",
      monthlyIncome: monthlyIncome.toFixed(2),
      yearlyIncome: yearlyIncome.toFixed(2),
      totalSavings: totalSavings.toFixed(2),
      savingsHistory,
    });
  }, [
    annualExpenses,
    currentSavings,
    annualSavings,
    returnRate,
    withdrawalRate,
    inflationRate,
  ]);

  useEffect(() => {
    calculateFI();
  }, [
    annualExpenses,
    currentSavings,
    annualSavings,
    returnRate,
    withdrawalRate,
    inflationRate,
    calculateFI,
  ]);

  const reset = () => {
    setAnnualExpenses(40000);
    setCurrentSavings(0);
    setAnnualSavings(20000);
    setReturnRate(7);
    setWithdrawalRate(4);
    setInflationRate(2);
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Financial Independence Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {[
            {
              label: "Annual Expenses ($)",
              value: annualExpenses,
              setter: setAnnualExpenses,
              min: 0,
            },
            {
              label: "Current Savings ($)",
              value: currentSavings,
              setter: setCurrentSavings,
              min: 0,
            },
            {
              label: "Annual Savings ($)",
              value: annualSavings,
              setter: setAnnualSavings,
              min: 0,
            },
            {
              label: "Annual Return Rate (%)",
              value: returnRate,
              setter: setReturnRate,
              min: 0,
              max: 20,
              step: 0.1,
            },
            {
              label: "Safe Withdrawal Rate (%)",
              value: withdrawalRate,
              setter: setWithdrawalRate,
              min: 0,
              max: 10,
              step: 0.1,
            },
            {
              label: "Inflation Rate (%)",
              value: inflationRate,
              setter: setInflationRate,
              min: 0,
              max: 10,
              step: 0.1,
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
        <div className="flex gap-4 mb-6">
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaChartLine className="mr-2" /> {showDetails ? "Hide" : "Show"} Details
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p>
                FI Number:{" "}
                <span className="font-bold text-green-600">
                  ${Number(results.fiNumber).toLocaleString()}
                </span>
              </p>
              <p>
                Years to FI:{" "}
                <span className="font-bold">{results.yearsToFI}</span>
              </p>
              <p>
                Projected Total Savings:{" "}
                <span className="font-medium">
                  ${Number(results.totalSavings).toLocaleString()}
                </span>
              </p>
              <p>
                Monthly Passive Income:{" "}
                <span className="font-medium">
                  ${Number(results.monthlyIncome).toLocaleString()}
                </span>
              </p>
              <p className="sm:col-span-2">
                Yearly Passive Income:{" "}
                <span className="font-medium">
                  ${Number(results.yearlyIncome).toLocaleString()}
                </span>
              </p>
            </div>

            {/* Detailed Savings History */}
            {showDetails && results.savingsHistory && (
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2 text-gray-700">
                  Savings Growth Over Time
                </h3>
                <div className="max-h-64 overflow-y-auto border rounded-md p-2">
                  <table className="w-full text-sm text-gray-600">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-2 text-left">Year</th>
                        <th className="p-2 text-right">Savings ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.savingsHistory.map(({ year, savings }) => (
                        <tr key={year} className="border-b">
                          <td className="p-2">{year}</td>
                          <td className="p-2 text-right">
                            {Number(savings).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculates FI number and years to independence</li>
            <li>Includes inflation adjustment</li>
            <li>Detailed savings growth history</li>
            <li>Real-time updates with input changes</li>
            <li>Reset to default values</li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-4">
          Note: This calculator assumes constant returns and savings rates, adjusted for
          inflation. Actual results may vary due to market volatility, taxes, and other
          factors. Consult a financial advisor for personalized advice.
        </p>
      </div>
    </div>
  );
};

export default FinancialIndependenceCalculator;