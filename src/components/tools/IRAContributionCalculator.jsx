"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaChartLine } from "react-icons/fa";

const IRAContributionCalculator = () => {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [annualContribution, setAnnualContribution] = useState(7000); // 2025 IRA limit
  const [currentBalance, setCurrentBalance] = useState(0);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [inflationRate, setInflationRate] = useState(2); // New: Inflation adjustment
  const [contributionIncrease, setContributionIncrease] = useState(0); // New: Annual increase in contributions
  const [results, setResults] = useState(null);
  const [showGraph, setShowGraph] = useState(false); // New: Toggle for growth graph

  const calculateIRA = useCallback(() => {
    const years = retirementAge - currentAge;
    if (years <= 0) {
      setResults(null);
      return;
    }

    let balance = Number(currentBalance);
    let contribution = Number(annualContribution);
    const yearlyReturn = annualReturn / 100;
    const yearlyInflation = inflationRate / 100;
    const contribGrowth = contributionIncrease / 100;
    let totalContributions = Number(currentBalance);
    const yearlyData = [];

    for (let i = 0; i < years; i++) {
      balance = balance * (1 + yearlyReturn) + contribution; // Growth with contribution
      balance = balance / (1 + yearlyInflation); // Adjust for inflation
      totalContributions += contribution;
      yearlyData.push({
        year: currentAge + i + 1,
        balance: balance.toFixed(2),
        contribution: contribution.toFixed(2),
      });
      contribution *= 1 + contribGrowth; // Increase contribution annually
      if (contribution > 7000) contribution = 7000; // Cap at IRA limit
    }

    setResults({
      finalBalance: balance.toFixed(2),
      totalContributions: totalContributions.toFixed(2),
      investmentGrowth: (balance - totalContributions).toFixed(2),
      yearlyData,
    });
  }, [
    currentAge,
    retirementAge,
    annualContribution,
    currentBalance,
    annualReturn,
    inflationRate,
    contributionIncrease,
  ]);

  useEffect(() => {
    calculateIRA();
  }, [
    currentAge,
    retirementAge,
    annualContribution,
    currentBalance,
    annualReturn,
    inflationRate,
    contributionIncrease,
    calculateIRA,
  ]);

  const reset = () => {
    setCurrentAge(30);
    setRetirementAge(65);
    setAnnualContribution(7000);
    setCurrentBalance(0);
    setAnnualReturn(7);
    setInflationRate(2);
    setContributionIncrease(0);
    setShowGraph(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          IRA Contribution Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Current Age",
              value: currentAge,
              setValue: setCurrentAge,
              min: 18,
              max: 100,
            },
            {
              label: "Retirement Age",
              value: retirementAge,
              setValue: setRetirementAge,
              min: currentAge,
              max: 100,
            },
            {
              label: "Annual Contribution ($)",
              value: annualContribution,
              setValue: setAnnualContribution,
              min: 0,
              max: 7000,
            },
            {
              label: "Current IRA Balance ($)",
              value: currentBalance,
              setValue: setCurrentBalance,
              min: 0,
            },
            {
              label: "Expected Annual Return (%)",
              value: annualReturn,
              setValue: setAnnualReturn,
              min: 0,
              max: 20,
              step: 0.1,
            },
            {
              label: "Inflation Rate (%)",
              value: inflationRate,
              setValue: setInflationRate,
              min: 0,
              max: 10,
              step: 0.1,
            },
            {
              label: "Annual Contribution Increase (%)",
              value: contributionIncrease,
              setValue: setContributionIncrease,
              min: 0,
              max: 10,
              step: 0.1,
            },
          ].map((input) => (
            <div key={input.label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {input.label}
              </label>
              <input
                type="number"
                value={input.value}
                onChange={(e) => input.setValue(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min={input.min}
                max={input.max}
                step={input.step || 1}
              />
            </div>
          ))}
        </div>

        {/* Results Section */}
        {results && retirementAge > currentAge ? (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Results</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p>
                  Final Balance:{" "}
                  <span className="font-bold text-green-600">
                    ${Number(results.finalBalance).toLocaleString()}
                  </span>
                </p>
                <p>
                  Total Contributions:{" "}
                  <span className="font-medium">
                    ${Number(results.totalContributions).toLocaleString()}
                  </span>
                </p>
                <p>
                  Investment Growth:{" "}
                  <span className="font-medium text-blue-600">
                    ${Number(results.investmentGrowth).toLocaleString()}
                  </span>
                </p>
                <p>
                  Years until Retirement:{" "}
                  <span className="font-medium">{retirementAge - currentAge}</span>
                </p>
              </div>
            </div>

            {/* Growth Graph */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowGraph(!showGraph)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaChartLine className="mr-2" />
                {showGraph ? "Hide" : "Show"} Growth Graph
              </button>
              <button
                onClick={reset}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>

            {showGraph && (
              <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                <h3 className="text-md font-semibold mb-2">Yearly Growth</h3>
                <div className="min-w-[600px]">
                  <table className="w-full text-sm text-gray-700">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-2 text-left">Year</th>
                        <th className="p-2 text-right">Contribution</th>
                        <th className="p-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.yearlyData.map((data, index) => (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                        >
                          <td className="p-2">{data.year}</td>
                          <td className="p-2 text-right">
                            ${Number(data.contribution).toLocaleString()}
                          </td>
                          <td className="p-2 text-right">
                            ${Number(data.balance).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
            {retirementAge <= currentAge
              ? "Retirement age must be greater than current age"
              : "Enter values to see results"}
          </p>
        )}

        {/* Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Notes</h3>
          <p className="text-sm text-blue-600">
            Based on 2025 IRA limit ($7,000). Assumes constant returns and doesn’t account for
            taxes or fees. Inflation and contribution increases are factored in. Consult a
            financial advisor for precise planning.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IRAContributionCalculator;