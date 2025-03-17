"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const EarningsPerShareCalculator = () => {
  const [netIncome, setNetIncome] = useState("");
  const [outstandingShares, setOutstandingShares] = useState("");
  const [isDiluted, setIsDiluted] = useState(false);
  const [convertibleShares, setConvertibleShares] = useState("");
  const [preferredDividends, setPreferredDividends] = useState(""); // New: Preferred dividends
  const [currency, setCurrency] = useState("USD"); // New: Currency selection
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  // Calculate EPS with additional parameters
  const calculateEPS = useCallback(() => {
    const netIncomeNum = parseFloat(netIncome);
    const sharesNum = parseInt(outstandingShares);
    const extraSharesNum = isDiluted ? parseInt(convertibleShares) || 0 : 0;
    const dividendsNum = parseFloat(preferredDividends) || 0;

    if (isNaN(netIncomeNum) || isNaN(sharesNum) || (isDiluted && isNaN(extraSharesNum))) {
      return { error: "Please enter valid numbers" };
    }
    if (sharesNum <= 0 || extraSharesNum < 0) {
      return { error: "Outstanding shares must be positive, convertible shares cannot be negative" };
    }
    if (dividendsNum < 0) {
      return { error: "Preferred dividends cannot be negative" };
    }

    const adjustedIncome = netIncomeNum - dividendsNum; // Adjust for preferred dividends
    const totalShares = sharesNum + extraSharesNum;
    const basicEPS = adjustedIncome / sharesNum;
    const dilutedEPS = isDiluted ? adjustedIncome / totalShares : null;

    return {
      netIncome: netIncomeNum.toFixed(2),
      preferredDividends: dividendsNum.toFixed(2),
      adjustedIncome: adjustedIncome.toFixed(2),
      outstandingShares: sharesNum,
      convertibleShares: extraSharesNum,
      totalShares: totalShares,
      basicEPS: basicEPS.toFixed(2),
      dilutedEPS: dilutedEPS ? dilutedEPS.toFixed(2) : null,
      isDiluted,
      currency,
    };
  }, [netIncome, outstandingShares, isDiluted, convertibleShares, preferredDividends, currency]);

  const calculate = () => {
    setError("");
    setResult(null);

    if (!netIncome || !outstandingShares || (isDiluted && !convertibleShares)) {
      setError("Please fill in all required fields");
      return;
    }

    const calcResult = calculateEPS();
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setNetIncome("");
    setOutstandingShares("");
    setIsDiluted(false);
    setConvertibleShares("");
    setPreferredDividends("");
    setCurrency("USD");
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  // Download result as text file
  const downloadResult = () => {
    if (!result) return;

    const content = `
Earnings Per Share Calculation
-----------------------------
Currency: ${result.currency}
Net Income: ${result.netIncome}
Preferred Dividends: ${result.preferredDividends}
Adjusted Income: ${result.adjustedIncome}
Outstanding Shares: ${result.outstandingShares}
${result.isDiluted ? `Convertible Shares: ${result.convertibleShares}` : ""}
${result.isDiluted ? `Total Shares (Diluted): ${result.totalShares}` : ""}
Basic EPS: ${result.basicEPS}
${result.isDiluted ? `Diluted EPS: ${result.dilutedEPS}` : ""}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `eps-calculation-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Earnings Per Share Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Net Income
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={netIncome}
                  onChange={(e) => setNetIncome(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1000000"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outstanding Shares
                </label>
                <input
                  type="number"
                  value={outstandingShares}
                  onChange={(e) => setOutstandingShares(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 500000"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Dividends
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={preferredDividends}
                  onChange={(e) => setPreferredDividends(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 50000"
                  min="0"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isDiluted}
                  onChange={(e) => setIsDiluted(e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Calculate Diluted EPS</span>
              </label>
            </div>
            {isDiluted && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Convertible Shares
                </label>
                <input
                  type="number"
                  value={convertibleShares}
                  onChange={(e) => setConvertibleShares(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10000"
                  min="0"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            {result && (
              <button
                onClick={downloadResult}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">EPS Results</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">
                Basic EPS: {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : result.currency === "GBP" ? "£" : "¥"}
                {result.basicEPS}
              </p>
              {result.isDiluted && (
                <p className="text-center">
                  Diluted EPS: {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : result.currency === "GBP" ? "£" : "¥"}
                  {result.dilutedEPS}
                </p>
              )}

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Net Income: {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : result.currency === "GBP" ? "£" : "¥"}{result.netIncome}</li>
                    <li>Preferred Dividends: {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : result.currency === "GBP" ? "£" : "¥"}{result.preferredDividends}</li>
                    <li>Adjusted Income: {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : result.currency === "GBP" ? "£" : "¥"}{result.adjustedIncome}</li>
                    <li>Outstanding Shares: {result.outstandingShares}</li>
                    <li>Basic EPS = Adjusted Income / Outstanding Shares = {result.adjustedIncome} / {result.outstandingShares} = {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : result.currency === "GBP" ? "£" : "¥"}{result.basicEPS}</li>
                    {result.isDiluted && (
                      <>
                        <li>Convertible Shares: {result.convertibleShares}</li>
                        <li>Total Shares (Diluted) = {result.outstandingShares} + {result.convertibleShares} = {result.totalShares}</li>
                        <li>Diluted EPS = Adjusted Income / Total Shares = {result.adjustedIncome} / {result.totalShares} = {result.currency === "USD" ? "$" : result.currency === "EUR" ? "€" : result.currency === "GBP" ? "£" : "¥"}{result.dilutedEPS}</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate Basic and Diluted EPS</li>
            <li>Adjust for preferred dividends</li>
            <li>Multiple currency support (USD, EUR, GBP, JPY)</li>
            <li>Detailed calculation breakdown</li>
            <li>Download results as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EarningsPerShareCalculator;