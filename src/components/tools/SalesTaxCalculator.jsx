"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa"; 

const SalesTaxCalculator = () => {
  const [amount, setAmount] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [isTaxIncluded, setIsTaxIncluded] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState([]);

  // Calculate sales tax
  const calculateSalesTax = useCallback((price, rate, taxIncluded) => {
    const priceNum = parseFloat(price);
    const rateNum = parseFloat(rate);

    if (isNaN(priceNum) || isNaN(rateNum)) {
      return { error: "Please enter valid numbers" };
    }
    if (priceNum < 0 || rateNum < 0) {
      return { error: "Amount and tax rate must be non-negative" };
    }

    let taxAmount, subtotal, total;

    if (taxIncluded) {
      total = priceNum;
      subtotal = priceNum / (1 + rateNum / 100);
      taxAmount = total - subtotal;
    } else {
      subtotal = priceNum;
      taxAmount = subtotal * (rateNum / 100);
      total = subtotal + taxAmount;
    }

    return {
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
      taxRate: rateNum.toFixed(2),
      isTaxIncluded: taxIncluded,
    };
  }, []);

  const calculate = () => {
    setError("");
    setResult(null);

    if (!amount || !taxRate) {
      setError("Please enter both amount and tax rate");
      return;
    }

    const calcResult = calculateSalesTax(amount, taxRate, isTaxIncluded);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
    setHistory((prev) => [
      { ...calcResult, amount, taxRate, currency, date: new Date().toLocaleString() },
      ...prev.slice(0, 9), // Keep last 10 calculations
    ]);
  };

  const reset = () => {
    setAmount("");
    setTaxRate("");
    setIsTaxIncluded(false);
    setCurrency("USD");
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  const downloadResult = () => {
    if (!result) return;

    const text = [
      `Sales Tax Calculation (${new Date().toLocaleString()})`,
      `Currency: ${currency}`,
      `Tax Included in Amount: ${isTaxIncluded ? "Yes" : "No"}`,
      `Subtotal (before tax): ${currency} ${result.subtotal}`,
      `Sales Tax (${result.taxRate}%): ${currency} ${result.taxAmount}`,
      `Total Amount: ${currency} ${result.total}`,
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sales-tax-result-${Date.now()}.txt`;
    link.click();
  };

  const formatCurrency = (value) => {
    const symbols = { USD: "$", EUR: "€", GBP: "£", JPY: "¥" };
    return `${symbols[currency] || "$"}${value}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Sales Tax Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  {formatCurrency("")[0]}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 p-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 8.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isTaxIncluded}
                  onChange={(e) => setIsTaxIncluded(e.target.checked)}
                  className="h-5 w-5 text-teal-600 focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-gray-700">Tax Included?</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-all flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate {/* Updated to FaCalculator */}
            </button>
            <button
              onClick={downloadResult}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-teal-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">
                Subtotal (before tax): {formatCurrency(result.subtotal)}
              </p>
              <p className="text-center">
                Sales Tax ({result.taxRate}%): {formatCurrency(result.taxAmount)}
              </p>
              <p className="text-center">
                Total Amount: {formatCurrency(result.total)}
              </p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-teal-600 hover:underline"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.isTaxIncluded ? (
                      <>
                        <li>Total Amount (with tax): {formatCurrency(result.total)}</li>
                        <li>Tax Rate: {result.taxRate}%</li>
                        <li>
                          Subtotal = Total / (1 + Tax Rate/100) = {result.total} / (1 +{" "}
                          {result.taxRate}/100) = {formatCurrency(result.subtotal)}
                        </li>
                        <li>
                          Sales Tax = Total - Subtotal = {result.total} - {result.subtotal} ={" "}
                          {formatCurrency(result.taxAmount)}
                        </li>
                      </>
                    ) : (
                      <>
                        <li>Subtotal (before tax): {formatCurrency(result.subtotal)}</li>
                        <li>Tax Rate: {result.taxRate}%</li>
                        <li>
                          Sales Tax = Subtotal × (Tax Rate/100) = {result.subtotal} × (
                          {result.taxRate}/100) = {formatCurrency(result.taxAmount)}
                        </li>
                        <li>
                          Total Amount = Subtotal + Sales Tax = {result.subtotal} +{" "}
                          {result.taxAmount} = {formatCurrency(result.total)}
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Calculation History</h3>
            <ul className="text-sm text-gray-600 space-y-2 max-h-48 overflow-y-auto">
              {history.map((entry, index) => (
                <li key={index}>
                  {entry.date}: {formatCurrency(entry.amount)} @ {entry.taxRate}% (
                  {entry.isTaxIncluded ? "Tax Incl." : "Tax Excl."}) ={" "}
                  {formatCurrency(entry.total)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate tax included or excluded amounts</li>
            <li>Support for multiple currencies (USD, EUR, GBP, JPY)</li>
            <li>Download results as a text file</li>
            <li>Calculation history (last 10 entries)</li>
            <li>Detailed calculation breakdown</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SalesTaxCalculator;