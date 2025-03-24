"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const HomeAffordabilityCalculator = () => {
  const [annualIncome, setAnnualIncome] = useState(50000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(1000);
  const [downPayment, setDownPayment] = useState(20000);
  const [interestRate, setInterestRate] = useState(5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2); // Annual % of home value
  const [insuranceCost, setInsuranceCost] = useState(100); // Monthly
  const [hoaFees, setHoaFees] = useState(0); // Monthly
  const [dtiRatio, setDtiRatio] = useState(36); // Debt-to-Income ratio
  const [results, setResults] = useState(null);

  const calculateAffordability = useCallback(() => {
    const monthlyIncome = annualIncome / 12;
    const maxHousingExpense = (monthlyIncome * (dtiRatio / 100)) - monthlyExpenses;

    // Monthly costs beyond mortgage payment
    const monthlyTax = (maxHousingExpense * (propertyTaxRate / 100)) / 12;
    const additionalMonthlyCosts = monthlyTax + insuranceCost + hoaFees;
    const maxMonthlyPayment = maxHousingExpense - additionalMonthlyCosts;

    // Prevent negative or invalid payments
    if (maxMonthlyPayment <= 0) {
      setResults({
        maxMonthlyPayment: 0,
        loanAmount: 0,
        totalHomePrice: downPayment,
        monthlyTax,
        totalMonthlyCost: additionalMonthlyCosts,
      });
      return;
    }

    // Calculate loan amount
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    const loanAmount =
      (maxMonthlyPayment * (Math.pow(1 + monthlyRate, numberOfPayments) - 1)) /
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));

    const totalHomePrice = loanAmount + downPayment;
    const totalMonthlyCost = maxMonthlyPayment + additionalMonthlyCosts;

    setResults({
      maxMonthlyPayment: maxMonthlyPayment.toFixed(2),
      loanAmount: loanAmount.toFixed(2),
      totalHomePrice: totalHomePrice.toFixed(2),
      monthlyTax: monthlyTax.toFixed(2),
      totalMonthlyCost: totalMonthlyCost.toFixed(2),
    });
  }, [
    annualIncome,
    monthlyExpenses,
    downPayment,
    interestRate,
    loanTerm,
    propertyTaxRate,
    insuranceCost,
    hoaFees,
    dtiRatio,
  ]);

  useEffect(() => {
    calculateAffordability();
  }, [
    annualIncome,
    monthlyExpenses,
    downPayment,
    interestRate,
    loanTerm,
    propertyTaxRate,
    insuranceCost,
    hoaFees,
    dtiRatio,
  ]);

  // Reset to default values
  const reset = () => {
    setAnnualIncome(50000);
    setMonthlyExpenses(1000);
    setDownPayment(20000);
    setInterestRate(5);
    setLoanTerm(30);
    setPropertyTaxRate(1.2);
    setInsuranceCost(100);
    setHoaFees(0);
    setDtiRatio(36);
  };

  // Download results as text
  const downloadResults = () => {
    if (!results) return;
    const text = `
Home Affordability Results
-------------------------
Annual Income: $${annualIncome.toLocaleString()}
Monthly Expenses: $${monthlyExpenses.toLocaleString()}
Down Payment: $${downPayment.toLocaleString()}
Interest Rate: ${interestRate}%
Loan Term: ${loanTerm} years
Property Tax Rate: ${propertyTaxRate}%
Monthly Insurance: $${insuranceCost}
Monthly HOA Fees: $${hoaFees}
DTI Ratio: ${dtiRatio}%

Results:
Maximum Monthly Payment: $${Number(results.maxMonthlyPayment).toLocaleString()}
Maximum Loan Amount: $${Number(results.loanAmount).toLocaleString()}
Total Home Price: $${Number(results.totalHomePrice).toLocaleString()}
Monthly Property Tax: $${Number(results.monthlyTax).toLocaleString()}
Total Monthly Cost: $${Number(results.totalMonthlyCost).toLocaleString()}
    `;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `affordability-results-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Home Affordability Calculator
        </h1>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {[
            { label: "Annual Income ($)", value: annualIncome, setter: setAnnualIncome, min: 0 },
            {
              label: "Monthly Expenses ($)",
              value: monthlyExpenses,
              setter: setMonthlyExpenses,
              min: 0,
            },
            { label: "Down Payment ($)", value: downPayment, setter: setDownPayment, min: 0 },
            {
              label: "Interest Rate (%)",
              value: interestRate,
              setter: setInterestRate,
              min: 0,
              max: 20,
              step: 0.1,
            },
            {
              label: "Loan Term (years)",
              value: loanTerm,
              setter: setLoanTerm,
              min: 1,
              max: 50,
            },
            {
              label: "Property Tax Rate (%)",
              value: propertyTaxRate,
              setter: setPropertyTaxRate,
              min: 0,
              max: 10,
              step: 0.1,
            },
            {
              label: "Monthly Insurance ($)",
              value: insuranceCost,
              setter: setInsuranceCost,
              min: 0,
            },
            { label: "Monthly HOA Fees ($)", value: hoaFees, setter: setHoaFees, min: 0 },
            {
              label: "DTI Ratio (%)",
              value: dtiRatio,
              setter: setDtiRatio,
              min: 10,
              max: 50,
            },
          ].map(({ label, value, setter, min, max, step = 1 }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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

        {/* Results */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p>
                Maximum Monthly Payment:{" "}
                <span className="font-bold text-green-600">
                  ${Number(results.maxMonthlyPayment).toLocaleString()}
                </span>
              </p>
              <p>
                Maximum Loan Amount:{" "}
                <span className="font-bold text-green-600">
                  ${Number(results.loanAmount).toLocaleString()}
                </span>
              </p>
              <p>
                Total Home Price:{" "}
                <span className="font-bold text-green-600">
                  ${Number(results.totalHomePrice).toLocaleString()}
                </span>
              </p>
              <p>
                Monthly Property Tax:{" "}
                <span className="font-bold text-green-600">
                  ${Number(results.monthlyTax).toLocaleString()}
                </span>
              </p>
              <p>
                Total Monthly Cost:{" "}
                <span className="font-bold text-green-600">
                  ${Number(results.totalMonthlyCost).toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={downloadResults}
            disabled={!results}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Results
          </button>
        </div>

        {/* Notes */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Notes</h3>
          <p className="text-sm text-blue-600">
            This estimate uses a customizable debt-to-income (DTI) ratio and includes property taxes,
            insurance, and HOA fees. Actual affordability may vary due to credit score, lender
            policies, and other factors. Consult a financial advisor for personalized advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeAffordabilityCalculator;