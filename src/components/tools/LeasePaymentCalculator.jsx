"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaSave } from "react-icons/fa";

const LeasePaymentCalculator = () => {
  const [vehiclePrice, setVehiclePrice] = useState(30000);
  const [downPayment, setDownPayment] = useState(3000);
  const [leaseTerm, setLeaseTerm] = useState(36);
  const [interestRate, setInterestRate] = useState(5);
  const [residualPercentage, setResidualPercentage] = useState(50);
  const [salesTaxRate, setSalesTaxRate] = useState(7); // New: Sales tax
  const [monthlyFees, setMonthlyFees] = useState(0); // New: Additional fees
  const [results, setResults] = useState(null);
  const [currency, setCurrency] = useState("USD"); // New: Currency selection

  const calculateLease = useCallback(() => {
    const principal = vehiclePrice - downPayment;
    const residualValue = vehiclePrice * (residualPercentage / 100);
    const monthlyInterest = interestRate / 100 / 12;
    const taxRate = salesTaxRate / 100;

    // Depreciation portion of payment
    const depreciation = (principal - residualValue) / leaseTerm;

    // Interest portion of payment
    const interest = (principal + residualValue) * monthlyInterest;

    // Base monthly payment (before tax and fees)
    const baseMonthlyPayment = depreciation + interest;

    // Add sales tax
    const monthlyTax = baseMonthlyPayment * taxRate;

    // Total monthly payment including fees
    const monthlyPayment = baseMonthlyPayment + monthlyTax + monthlyFees;

    setResults({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalCost: (monthlyPayment * leaseTerm).toFixed(2),
      depreciation: depreciation.toFixed(2),
      interest: interest.toFixed(2),
      monthlyTax: monthlyTax.toFixed(2),
      residualValue: residualValue.toFixed(2),
      baseMonthlyPayment: baseMonthlyPayment.toFixed(2),
    });
  }, [
    vehiclePrice,
    downPayment,
    leaseTerm,
    interestRate,
    residualPercentage,
    salesTaxRate,
    monthlyFees,
  ]);

  useEffect(() => {
    calculateLease();
  }, [
    vehiclePrice,
    downPayment,
    leaseTerm,
    interestRate,
    residualPercentage,
    salesTaxRate,
    monthlyFees,
    calculateLease,
  ]);

  // Reset to default values
  const reset = () => {
    setVehiclePrice(30000);
    setDownPayment(3000);
    setLeaseTerm(36);
    setInterestRate(5);
    setResidualPercentage(50);
    setSalesTaxRate(7);
    setMonthlyFees(0);
    setCurrency("USD");
  };

  // Save results as text file
  const saveResults = () => {
    if (!results) return;
    const text = `
      Lease Payment Calculation Results
      --------------------------------
      Vehicle Price: ${currency} ${Number(vehiclePrice).toLocaleString()}
      Down Payment: ${currency} ${Number(downPayment).toLocaleString()}
      Lease Term: ${leaseTerm} months
      Interest Rate: ${interestRate}%
      Residual Value: ${residualPercentage}% (${currency} ${Number(results.residualValue).toLocaleString()})
      Sales Tax Rate: ${salesTaxRate}%
      Monthly Fees: ${currency} ${Number(monthlyFees).toLocaleString()}
      
      Results:
      Base Monthly Payment: ${currency} ${Number(results.baseMonthlyPayment).toLocaleString()}
      Monthly Tax: ${currency} ${Number(results.monthlyTax).toLocaleString()}
      Total Monthly Payment: ${currency} ${Number(results.monthlyPayment).toLocaleString()}
      Total Lease Cost: ${currency} ${Number(results.totalCost).toLocaleString()}
      Monthly Depreciation: ${currency} ${Number(results.depreciation).toLocaleString()}
      Monthly Interest: ${currency} ${Number(results.interest).toLocaleString()}
    `;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lease-calculation-${Date.now()}.txt`;
    link.click();
  };

  // Currency symbol mapping
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Lease Payment Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {[
            { label: "Vehicle Price", value: vehiclePrice, setter: setVehiclePrice, min: 1000, step: 100 },
            { label: "Down Payment", value: downPayment, setter: setDownPayment, min: 0, max: vehiclePrice, step: 100 },
            { label: "Lease Term (months)", value: leaseTerm, setter: setLeaseTerm, min: 12, max: 60, step: 1 },
            { label: "Interest Rate (%)", value: interestRate, setter: setInterestRate, min: 0, max: 20, step: 0.1 },
            { label: "Residual Value (%)", value: residualPercentage, setter: setResidualPercentage, min: 10, max: 80, step: 1 },
            { label: "Sales Tax Rate (%)", value: salesTaxRate, setter: setSalesTaxRate, min: 0, max: 20, step: 0.1 },
            { label: "Monthly Fees", value: monthlyFees, setter: setMonthlyFees, min: 0, step: 10 },
          ].map(({ label, value, setter, min, max, step }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {label.includes("(%)") ? `(${value})` : `(${currencySymbols[currency]}${value})`}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
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

        {/* Results Section */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Lease Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Total Monthly Payment", value: results.monthlyPayment, highlight: true },
                { label: "Base Monthly Payment", value: results.baseMonthlyPayment },
                { label: "Monthly Tax", value: results.monthlyTax },
                { label: "Monthly Depreciation", value: results.depreciation },
                { label: "Monthly Interest", value: results.interest },
                { label: "Total Lease Cost", value: results.totalCost },
                { label: "Residual Value", value: results.residualValue },
              ].map(({ label, value, highlight }) => (
                <p key={label}>
                  {label}:{" "}
                  <span className={highlight ? "font-bold text-green-600" : "font-medium"}>
                    {currencySymbols[currency]}{Number(value).toLocaleString()}
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={saveResults}
            disabled={!results}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSave className="mr-2" /> Save Results
          </button>
        </div>

        {/* Notes */}
        <p className="text-xs text-gray-500 mt-4">
          Note: This calculator provides an estimate. Actual lease payments may include additional
          fees, taxes, and terms specific to your lease agreement. Consult a professional for
          precise quotes.
        </p>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time calculation updates</li>
            <li>Customizable sales tax and monthly fees</li>
            <li>Multiple currency support</li>
            <li>Save results as a text file</li>
            <li>Detailed breakdown of costs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LeasePaymentCalculator;