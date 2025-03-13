"use client";

import React, { useState, useCallback } from "react";
import { FaSync, FaExchangeAlt, FaDownload } from "react-icons/fa";

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Simulated real-time exchange rates (for demo purposes)
  const exchangeRates = {
    USD: { EUR: 0.85, GBP: 0.75, PKR: 278, INR: 74, JPY: 110 },
    EUR: { USD: 1.18, GBP: 0.88, PKR: 320, INR: 87, JPY: 129 },
    GBP: { USD: 1.33, EUR: 1.14, PKR: 365, INR: 100, JPY: 147 },
    PKR: { USD: 0.0036, EUR: 0.0031, GBP: 0.0027, INR: 0.74, JPY: 0.39 },
    INR: { USD: 0.013, EUR: 0.0115, GBP: 0.01, PKR: 1.36, JPY: 1.48 },
    JPY: { USD: 0.0091, EUR: 0.0078, GBP: 0.0068, PKR: 2.56, INR: 0.68 },
  };

  const currencies = Object.keys(exchangeRates);

  const validateInput = () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      return false;
    }
    setError("");
    return true;
  };

  const convertCurrency = useCallback(async () => {
    if (!validateInput()) return;

    setIsLoading(true);
    setError("");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (fromCurrency === toCurrency) {
      setConvertedAmount(amount);
    } else {
      const rate = exchangeRates[fromCurrency][toCurrency];
      if (!rate) {
        setError("Conversion rate not available for the selected currencies.");
        setIsLoading(false);
        return;
      }
      const result = (amount * rate).toFixed(2);
      setConvertedAmount(result);

      // Add to history
      setHistory((prev) => [
        {
          amount,
          from: fromCurrency,
          to: toCurrency,
          result,
          date: new Date().toLocaleString(),
        },
        ...prev.slice(0, 9), // Keep last 10 entries
      ]);
    }
    setIsLoading(false);
  }, [amount, fromCurrency, toCurrency]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedAmount(null);
  };

  const clearFields = () => {
    setAmount("");
    setConvertedAmount(null);
    setError("");
    setHistory([]);
    setShowHistory(false);
  };

  const downloadHistory = () => {
    const csvContent = [
      "Amount,From,To,Converted Amount,Date",
      ...history.map(
        (entry) => `${entry.amount},${entry.from},${entry.to},${entry.result},${entry.date}`
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `currency-conversion-history-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          💰 Currency Converter
        </h2>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                {currencies.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSwapCurrencies}
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              <FaExchangeAlt size={20} />
            </button>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                {currencies.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={convertCurrency}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
              {isLoading ? "Converting..." : "Convert"}
            </button>
            <button
              onClick={clearFields}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>

          {/* Error and Result */}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {convertedAmount !== null && (
            <p className="text-lg font-medium text-gray-800">
              Converted: {convertedAmount} {toCurrency}
            </p>
          )}
        </div>

        {/* Conversion History */}
        <div className="mt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            {showHistory ? "Hide History" : "Show History"} ({history.length})
          </button>
          {showHistory && history.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">Conversion History</h3>
                <button
                  onClick={downloadHistory}
                  className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <FaDownload className="mr-1" /> CSV
                </button>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                {history.map((entry, index) => (
                  <li key={index}>
                    {entry.amount} {entry.from} → {entry.result} {entry.to} (
                    {entry.date})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports multiple currencies (USD, EUR, GBP, PKR, INR, JPY)</li>
            <li>Swap currencies with one click</li>
            <li>Conversion history tracking</li>
            <li>Download history as CSV</li>
            <li>Real-time simulation with loading state</li>
          </ul>
        </div>

       
      </div>
    </div>
  );
};

export default CurrencyConverter;