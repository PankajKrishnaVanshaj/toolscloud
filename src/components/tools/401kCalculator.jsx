"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaChartPie } from "react-icons/fa";

const FourOhOneKCalculator = () => {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [employerMatch, setEmployerMatch] = useState(0); // New: Employer matching percentage
  const [annualReturn, setAnnualReturn] = useState(7);
  const [inflationRate, setInflationRate] = useState(2); // New: Inflation adjustment
  const [results, setResults] = useState(null);

  const calculate401k = useCallback(() => {
    const years = retirementAge - currentAge;
    if (years <= 0) {
      setResults(null);
      return;
    }

    const months = years * 12;
    const monthlyRate = annualReturn / 100 / 12;
    const monthlyInflationRate = inflationRate / 100 / 12;

    // Future value of current savings
    const futureValueSavings = currentSavings * Math.pow(1 + monthlyRate, months);

    // Total monthly contribution including employer match
    const totalMonthlyContribution =
      monthlyContribution * (1 + employerMatch / 100);

    // Future value of monthly contributions
    const futureValueContributions =
      totalMonthlyContribution *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    // Total nominal value
    const totalNominal = futureValueSavings + futureValueContributions;

    // Adjust for inflation
    const totalReal =
      totalNominal / Math.pow(1 + monthlyInflationRate, months);

    setResults({
      totalNominal: totalNominal.toFixed(2),
      totalReal: totalReal.toFixed(2),
      fromSavings: futureValueSavings.toFixed(2),
      fromContributions: futureValueContributions.toFixed(2),
      years: years,
    });
  }, [
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    employerMatch,
    annualReturn,
    inflationRate,
  ]);

  useEffect(() => {
    calculate401k();
  }, [
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    employerMatch,
    annualReturn,
    inflationRate,
    calculate401k,
  ]);

  // Reset all fields
  const reset = () => {
    setCurrentAge(30);
    setRetirementAge(65);
    setCurrentSavings(0);
    setMonthlyContribution(500);
    setEmployerMatch(0);
    setAnnualReturn(7);
    setInflationRate(2);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          401(k) Retirement Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {[
            {
              label: "Current Age",
              value: currentAge,
              setter: setCurrentAge,
              min: 18,
              max: 100,
            },
            {
              label: "Retirement Age",
              value: retirementAge,
              setter: setRetirementAge,
              min: currentAge,
              max: 100,
            },
            {
              label: "Current 401(k) Savings ($)",
              value: currentSavings,
              setter: setCurrentSavings,
              min: 0,
            },
            {
              label: "Monthly Contribution ($)",
              value: monthlyContribution,
              setter: setMonthlyContribution,
              min: 0,
            },
            {
              label: "Employer Match (%)",
              value: employerMatch,
              setter: setEmployerMatch,
              min: 0,
              max: 100,
              step: 0.1,
            },
            {
              label: "Annual Return Rate (%)",
              value: annualReturn,
              setter: setAnnualReturn,
              min: 0,
              max: 20,
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

        {/* Reset Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={reset}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaChartPie className="mr-2 text-blue-500" /> Results
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  Total at Retirement (Nominal):
                  <span className="block font-bold text-green-600 text-lg">
                    ${Number(results.totalNominal).toLocaleString()}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Total at Retirement (Real, inflation-adjusted):
                  <span className="block font-bold text-green-600 text-lg">
                    ${Number(results.totalReal).toLocaleString()}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  From Initial Savings:
                  <span className="block font-medium">
                    ${Number(results.fromSavings).toLocaleString()}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  From Contributions (incl. match):
                  <span className="block font-medium">
                    ${Number(results.fromContributions).toLocaleString()}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Years until Retirement:
                  <span className="block font-medium">{results.years}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-700">
            <strong>Note:</strong> This calculator provides an estimate based on constant returns
            and contributions. It does not account for taxes, fees, market volatility, or changes
            in contribution rates. Consult a financial advisor for personalized advice.
          </p>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculates nominal and inflation-adjusted totals</li>
            <li>Includes employer matching contributions</li>
            <li>Real-time updates with input changes</li>
            <li>Reset functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FourOhOneKCalculator;