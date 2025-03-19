"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaCalculator, FaChartPie } from "react-icons/fa";

const RentalYieldCalculator = () => {
  const [propertyValue, setPropertyValue] = useState(300000);
  const [monthlyRent, setMonthlyRent] = useState(1500);
  const [annualExpenses, setAnnualExpenses] = useState(5000);
  const [vacancyRate, setVacancyRate] = useState(5); // Percentage of time property is vacant
  const [managementFee, setManagementFee] = useState(8); // Percentage of rent
  const [currency, setCurrency] = useState("USD");
  const [results, setResults] = useState(null);

  // Calculate yield with additional factors
  const calculateYield = useCallback(() => {
    const annualRent = monthlyRent * 12;
    const vacancyLoss = (annualRent * vacancyRate) / 100;
    const managementCost = (annualRent * managementFee) / 100;
    const effectiveAnnualRent = annualRent - vacancyLoss;
    const totalExpenses = annualExpenses + managementCost;
    
    const grossYield = (annualRent / propertyValue) * 100;
    const netYield = ((effectiveAnnualRent - totalExpenses) / propertyValue) * 100;
    const roi = netYield; // Simplified ROI as net yield for this example

    setResults({
      annualRent: annualRent.toFixed(2),
      effectiveAnnualRent: effectiveAnnualRent.toFixed(2),
      vacancyLoss: vacancyLoss.toFixed(2),
      managementCost: managementCost.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      grossYield: grossYield.toFixed(2),
      netYield: netYield.toFixed(2),
      roi: roi.toFixed(2),
    });
  }, [propertyValue, monthlyRent, annualExpenses, vacancyRate, managementFee]);

  // Recalculate when inputs change
  useEffect(() => {
    calculateYield();
  }, [propertyValue, monthlyRent, annualExpenses, vacancyRate, managementFee, calculateYield]);

  // Reset to default values
  const reset = () => {
    setPropertyValue(300000);
    setMonthlyRent(1500);
    setAnnualExpenses(5000);
    setVacancyRate(5);
    setManagementFee(8);
    setCurrency("USD");
  };

  // Currency symbol mapping
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  const symbol = currencySymbols[currency] || "$";

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
          <FaCalculator /> Rental Yield Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Value ({symbol})
            </label>
            <input
              type="number"
              value={propertyValue}
              onChange={(e) => setPropertyValue(Math.max(1, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1"
              step="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Rent ({symbol})
            </label>
            <input
              type="number"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Expenses ({symbol})
            </label>
            <input
              type="number"
              value={annualExpenses}
              onChange={(e) => setAnnualExpenses(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vacancy Rate (%)
            </label>
            <input
              type="number"
              value={vacancyRate}
              onChange={(e) => setVacancyRate(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Management Fee (% of rent)
            </label>
            <input
              type="number"
              value={managementFee}
              onChange={(e) => setManagementFee(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="1"
            />
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

        {/* Results Section */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FaChartPie /> Results
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p>
                  Annual Rental Income:{" "}
                  <span className="font-bold text-green-600">
                    {symbol}
                    {Number(results.annualRent).toLocaleString()}
                  </span>
                </p>
                <p>
                  Effective Annual Rent (after vacancy):{" "}
                  <span className="font-bold text-green-600">
                    {symbol}
                    {Number(results.effectiveAnnualRent).toLocaleString()}
                  </span>
                </p>
                <p>
                  Vacancy Loss:{" "}
                  <span className="font-bold text-red-600">
                    {symbol}
                    {Number(results.vacancyLoss).toLocaleString()}
                  </span>
                </p>
                <p>
                  Management Cost:{" "}
                  <span className="font-bold text-red-600">
                    {symbol}
                    {Number(results.managementCost).toLocaleString()}
                  </span>
                </p>
                <p>
                  Total Expenses:{" "}
                  <span className="font-bold text-red-600">
                    {symbol}
                    {Number(results.totalExpenses).toLocaleString()}
                  </span>
                </p>
              </div>
              <div>
                <p>
                  Gross Yield:{" "}
                  <span className="font-bold text-blue-600">{results.grossYield}%</span>
                </p>
                <p>
                  Net Yield:{" "}
                  <span className="font-bold text-blue-600">{results.netYield}%</span>
                </p>
                <p>
                  Return on Investment (ROI):{" "}
                  <span className="font-bold text-blue-600">{results.roi}%</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center">
          <button
            onClick={reset}
            className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <FaSync /> Reset
          </button>
        </div>

        {/* Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Calculation Details</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Gross Yield = (Annual Rent / Property Value) × 100</li>
            <li>Effective Annual Rent = Annual Rent × (1 - Vacancy Rate/100)</li>
            <li>Total Expenses = Annual Expenses + (Annual Rent × Management Fee/100)</li>
            <li>Net Yield = ((Effective Annual Rent - Total Expenses) / Property Value) × 100</li>
            <li>ROI is approximated as Net Yield in this simplified model</li>
            <li>Results are estimates and may vary based on actual conditions</li>
          </ul>
        </div>

        {/* Features */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Real-time calculations</li>
            <li>Adjustable vacancy rate and management fees</li>
            <li>Multi-currency support (USD, EUR, GBP, JPY)</li>
            <li>Detailed breakdown of income and expenses</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RentalYieldCalculator;