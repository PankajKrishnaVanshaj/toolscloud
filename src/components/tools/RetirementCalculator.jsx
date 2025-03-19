"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaChartLine } from "react-icons/fa";

const RetirementCalculator = () => {
  const [currentAge, setCurrentAge] = useState("");
  const [retirementAge, setRetirementAge] = useState("");
  const [monthlySavings, setMonthlySavings] = useState("");
  const [lumpSum, setLumpSum] = useState("");
  const [rate, setRate] = useState("");
  const [inflationRate, setInflationRate] = useState("");
  const [monthlyPension, setMonthlyPension] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState(""); // New field
  const [withdrawalRate, setWithdrawalRate] = useState(""); // New field
  const [totalSavings, setTotalSavings] = useState(null);
  const [yearlyBreakdown, setYearlyBreakdown] = useState([]);
  const [inflationAdjustedValue, setInflationAdjustedValue] = useState(null);
  const [retirementIncome, setRetirementIncome] = useState(null);

  // Calculate retirement savings
  const calculateRetirementSavings = useCallback(() => {
    if (!currentAge || !retirementAge || !monthlySavings || !rate) {
      setTotalSavings(null);
      setRetirementIncome(null);
      return;
    }

    const yearsToSave = parseInt(retirementAge) - parseInt(currentAge);
    if (yearsToSave <= 0) {
      alert("Retirement age must be greater than current age.");
      return;
    }

    const monthlyRate = parseFloat(rate) / 100 / 12;
    const months = yearsToSave * 12;
    const savings = parseFloat(monthlySavings || 0);
    const lump = parseFloat(lumpSum || 0);
    const yearlyInflationRate = parseFloat(inflationRate || 0) / 100;
    const pension = parseFloat(monthlyPension || 0);
    const expectancy = parseInt(lifeExpectancy || 85); // Default to 85 if not provided
    const withdrawal = parseFloat(withdrawalRate || 4) / 100; // Default 4% withdrawal rate

    let futureValue = lump;
    let breakdown = [];

    for (let i = 0; i < months; i++) {
      futureValue = (futureValue + savings) * (1 + monthlyRate);
      if ((i + 1) % 12 === 0) {
        breakdown.push({
          year: Math.floor((i + 1) / 12),
          value: futureValue.toFixed(2),
        });
      }
    }

    const adjustedValue =
      yearlyInflationRate > 0
        ? futureValue / Math.pow(1 + yearlyInflationRate, yearsToSave)
        : futureValue;

    // Calculate sustainable monthly income during retirement
    const yearsInRetirement = expectancy - parseInt(retirementAge);
    const totalRetirementMonths = yearsInRetirement * 12;
    const monthlyIncomeFromSavings = (futureValue * withdrawal) / 12;
    const totalMonthlyIncome = monthlyIncomeFromSavings + pension;

    setTotalSavings(futureValue.toFixed(2));
    setInflationAdjustedValue(adjustedValue.toFixed(2));
    setYearlyBreakdown(breakdown);
    setRetirementIncome({
      monthly: totalMonthlyIncome.toFixed(2),
      years: yearsInRetirement,
    });
  }, [
    currentAge,
    retirementAge,
    monthlySavings,
    lumpSum,
    rate,
    inflationRate,
    monthlyPension,
    lifeExpectancy,
    withdrawalRate,
  ]);

  // Reset all fields
  const reset = () => {
    setCurrentAge("");
    setRetirementAge("");
    setMonthlySavings("");
    setLumpSum("");
    setRate("");
    setInflationRate("");
    setMonthlyPension("");
    setLifeExpectancy("");
    setWithdrawalRate("");
    setTotalSavings(null);
    setYearlyBreakdown([]);
    setInflationAdjustedValue(null);
    setRetirementIncome(null);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center">
          <FaCalculator className="mr-2" /> Advanced Retirement Calculator
        </h2>

        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { label: "Current Age", value: currentAge, setter: setCurrentAge },
            { label: "Retirement Age", value: retirementAge, setter: setRetirementAge },
            { label: "Monthly Savings ($)", value: monthlySavings, setter: setMonthlySavings },
            { label: "Lump Sum ($)", value: lumpSum, setter: setLumpSum },
            { label: "Annual Interest Rate (%)", value: rate, setter: setRate },
            { label: "Inflation Rate (%)", value: inflationRate, setter: setInflationRate },
            { label: "Monthly Pension ($)", value: monthlyPension, setter: setMonthlyPension },
            { label: "Life Expectancy", value: lifeExpectancy, setter: setLifeExpectancy },
            {
              label: "Withdrawal Rate (%)",
              value: withdrawalRate,
              setter: setWithdrawalRate,
              placeholder: "4",
            },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="number"
                placeholder={placeholder || label}
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
                step={label.includes("Rate") ? "0.1" : "1"}
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={calculateRetirementSavings}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Results */}
        {totalSavings && (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-700 mb-2">Retirement Savings</h3>
              <p className="text-sm text-green-600">
                Total Savings: <span className="font-medium">${totalSavings}</span>
              </p>
              <p className="text-sm text-green-600">
                Inflation-Adjusted Value:{" "}
                <span className="font-medium">${inflationAdjustedValue}</span>
              </p>
              {retirementIncome && (
                <>
                  <p className="text-sm text-green-600">
                    Monthly Retirement Income:{" "}
                    <span className="font-medium">${retirementIncome.monthly}</span>
                  </p>
                  <p className="text-sm text-green-600">
                    Years in Retirement:{" "}
                    <span className="font-medium">{retirementIncome.years}</span>
                  </p>
                </>
              )}
            </div>

            {/* Yearly Breakdown */}
            {yearlyBreakdown.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
                  <FaChartLine className="mr-2" /> Yearly Savings Breakdown
                </h3>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-sm text-blue-600">
                    <thead>
                      <tr className="border-b">
                        <th className="py-1 px-2 text-left">Year</th>
                        <th className="py-1 px-2 text-right">Savings ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyBreakdown.map((year) => (
                        <tr key={year.year} className="border-b last:border-0">
                          <td className="py-1 px-2">{year.year}</td>
                          <td className="py-1 px-2 text-right">{year.value}</td>
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
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            <li>Calculate total savings with compound interest</li>
            <li>Adjust for inflation</li>
            <li>Include lump sum and monthly pension</li>
            <li>Estimate monthly retirement income with withdrawal rate</li>
            <li>Yearly savings breakdown</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RetirementCalculator;