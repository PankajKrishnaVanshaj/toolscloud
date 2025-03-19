"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaCalculator, FaChartLine } from "react-icons/fa";

const CryptoProfitCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState(1000);
  const [buyPrice, setBuyPrice] = useState(1);
  const [sellPrice, setSellPrice] = useState(1.5);
  const [quantity, setQuantity] = useState(0);
  const [tradingFeePercentage, setTradingFeePercentage] = useState(0.1); // Default 0.1%
  const [results, setResults] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const calculateProfit = useCallback(() => {
    if (initialInvestment <= 0 || buyPrice <= 0 || sellPrice <= 0) {
      setResults(null);
      return;
    }

    const qty = initialInvestment / buyPrice;
    const buyFee = (initialInvestment * tradingFeePercentage) / 100;
    const sellFee = (qty * sellPrice * tradingFeePercentage) / 100;
    const totalInvestment = initialInvestment + buyFee;
    const totalValue = qty * sellPrice - sellFee;
    const profit = totalValue - totalInvestment;
    const profitPercentage = (profit / totalInvestment) * 100;
    const roi = ((sellPrice - buyPrice) / buyPrice) * 100;

    setQuantity(qty);
    setResults({
      totalValue: totalValue.toFixed(2),
      profit: profit.toFixed(2),
      profitPercentage: profitPercentage.toFixed(2),
      roi: roi.toFixed(2),
      totalFees: (buyFee + sellFee).toFixed(2),
    });
  }, [initialInvestment, buyPrice, sellPrice, tradingFeePercentage]);

  useEffect(() => {
    calculateProfit();
  }, [initialInvestment, buyPrice, sellPrice, tradingFeePercentage, calculateProfit]);

  const reset = () => {
    setInitialInvestment(1000);
    setBuyPrice(1);
    setSellPrice(1.5);
    setTradingFeePercentage(0.1);
    setCurrency("USD");
    setShowAdvanced(false);
  };

  const toggleAdvanced = () => setShowAdvanced((prev) => !prev);

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
          Crypto Profit Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Investment ({currencySymbols[currency]})
            </label>
            <input
              type="number"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buy Price ({currencySymbols[currency]})
            </label>
            <input
              type="number"
              value={buyPrice}
              onChange={(e) => setBuyPrice(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sell Price ({currencySymbols[currency]})
            </label>
            <input
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity Purchased
            </label>
            <input
              type="number"
              value={quantity.toFixed(6)}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="mb-6">
          <button
            onClick={toggleAdvanced}
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center justify-center"
          >
            <FaCalculator className="mr-2" />
            {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
          </button>
          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trading Fee (%)
                </label>
                <input
                  type="number"
                  value={tradingFeePercentage}
                  onChange={(e) => setTradingFeePercentage(Number(e.target.value))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.01"
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
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-2 text-center">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <p>
                Total Value:{" "}
                <span className="font-bold text-green-600">
                  {currencySymbols[currency]}
                  {Number(results.totalValue).toLocaleString()}
                </span>
              </p>
              <p>
                Profit/Loss:{" "}
                <span
                  className={`font-bold ${
                    results.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {currencySymbols[currency]}
                  {Number(results.profit).toLocaleString()} (
                  {results.profitPercentage}%)
                </span>
              </p>
              <p>
                ROI:{" "}
                <span
                  className={`font-bold ${
                    results.roi >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {results.roi}%
                </span>
              </p>
              <p>
                Total Fees:{" "}
                <span className="font-bold text-gray-600">
                  {currencySymbols[currency]}
                  {Number(results.totalFees).toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={calculateProfit}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaChartLine className="mr-2" /> Calculate
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-6 text-center">
          Note: This calculator includes trading fees but does not account for taxes or market
          volatility. Results are for estimation purposes only.
        </p>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time profit/loss calculation</li>
            <li>Support for multiple currencies (USD, EUR, GBP, JPY)</li>
            <li>Adjustable trading fees</li>
            <li>ROI and total fees calculation</li>
            <li>Advanced settings toggle</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CryptoProfitCalculator;