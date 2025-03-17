"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const PayPalFeeCalculator = () => {
  const [amount, setAmount] = useState("");
  const [feeType, setFeeType] = useState("domestic");
  const [customPercent, setCustomPercent] = useState("");
  const [customFixed, setCustomFixed] = useState("");
  const [isFeeDeducted, setIsFeeDeducted] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState([]);

  // PayPal fee rates (simplified for demo)
  const feeRates = {
    domestic: { percent: 2.9, fixed: { USD: 0.30, EUR: 0.35, GBP: 0.20 } },
    international: { percent: 4.4, fixed: { USD: 0.30, EUR: 0.35, GBP: 0.20 } },
    micropayments: { percent: 5.0, fixed: { USD: 0.05, EUR: 0.05, GBP: 0.05 } },
  };

  const currencySymbols = { USD: "$", EUR: "€", GBP: "£" };

  // Calculate PayPal fees
  const calculatePayPalFees = useCallback(
    (amt, type, customP, customF, feeDeducted, curr) => {
      const amountNum = parseFloat(amt);
      let percent =
        type === "custom" ? parseFloat(customP) : feeRates[type].percent;
      let fixed =
        type === "custom"
          ? parseFloat(customF)
          : feeRates[type].fixed[curr] || 0.30;

      if (
        isNaN(amountNum) ||
        (type === "custom" && (isNaN(percent) || isNaN(fixed)))
      ) {
        return { error: "Please enter valid numbers" };
      }
      if (amountNum < 0 || percent < 0 || fixed < 0) {
        return { error: "Amount, percentage, and fixed fee must be non-negative" };
      }

      let fee, net, gross;

      if (feeDeducted) {
        gross = (amountNum + fixed) / (1 - percent / 100);
        fee = gross * (percent / 100) + fixed;
        net = amountNum;
      } else {
        gross = amountNum;
        fee = gross * (percent / 100) + fixed;
        net = gross - fee;
      }

      const result = {
        gross: gross.toFixed(2),
        fee: fee.toFixed(2),
        net: net.toFixed(2),
        percent: percent.toFixed(2),
        fixed: fixed.toFixed(2),
        isFeeDeducted,
        currency: curr,
      };

      setHistory((prev) => [...prev, result].slice(-5)); // Keep last 5 calculations
      return result;
    },
    []
  );

  const calculate = () => {
    setError("");
    setResult(null);

    if (!amount || (feeType === "custom" && (!customPercent || !customFixed))) {
      setError("Please fill in all required fields");
      return;
    }

    const calcResult = calculatePayPalFees(
      amount,
      feeType,
      customPercent,
      customFixed,
      isFeeDeducted,
      currency
    );
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setAmount("");
    setFeeType("domestic");
    setCustomPercent("");
    setCustomFixed("");
    setIsFeeDeducted(false);
    setCurrency("USD");
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  const downloadResult = () => {
    if (!result) return;
    const text = `
PayPal Fee Calculation Result
----------------------------
Gross Amount: ${currencySymbols[currency]}${result.gross}
PayPal Fee: ${currencySymbols[currency]}${result.fee}
Net Amount: ${currencySymbols[currency]}${result.net}
Fee Rate: ${result.percent}% + ${currencySymbols[currency]}${result.fixed}
${result.isFeeDeducted ? "Amount Entered as Net" : "Amount Entered as Gross"}
Currency: ${currency}
    `;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `paypal-fee-result-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          PayPal Fee Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ({currencySymbols[currency]})
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 100"
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
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Type
              </label>
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="domestic">Domestic (2.9% + {currencySymbols[currency]}{feeRates.domestic.fixed[currency]})</option>
                <option value="international">International (4.4% + {currencySymbols[currency]}{feeRates.international.fixed[currency]})</option>
                <option value="micropayments">Micropayments (5.0% + {currencySymbols[currency]}{feeRates.micropayments.fixed[currency]})</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {feeType === "custom" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Fee (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={customPercent}
                    onChange={(e) => setCustomPercent(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2.9"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fixed Fee ({currencySymbols[currency]})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={customFixed}
                    onChange={(e) => setCustomFixed(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 0.30"
                  />
                </div>
              </>
            )}
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isFeeDeducted}
                  onChange={(e) => setIsFeeDeducted(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Fee Deducted (Net Amount)</span>
              </label>
            </div>
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
              onClick={downloadResult}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Result
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center border border-red-200">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              PayPal Fee Results
            </h2>
            <div className="mt-2 space-y-2 text-center">
              <p>Gross Amount: {currencySymbols[currency]}{result.gross}</p>
              <p>PayPal Fee: {currencySymbols[currency]}{result.fee}</p>
              <p>Net Amount: {currencySymbols[currency]}{result.net}</p>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>

              {showDetails && (
                <div className="text-sm text-gray-600 mt-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Fee Rate: {result.percent}% + {currencySymbols[currency]}{result.fixed}</li>
                    {result.isFeeDeducted ? (
                      <>
                        <li>Net Amount (received): {currencySymbols[currency]}{result.net}</li>
                        <li>Gross = (Net + Fixed) / (1 - Percent/100)</li>
                        <li>Gross = ({result.net} + {result.fixed}) / (1 - {result.percent}/100) = {currencySymbols[currency]}{result.gross}</li>
                        <li>Fee = Gross × (Percent/100) + Fixed = {result.gross} × ({result.percent}/100) + {result.fixed} = {currencySymbols[currency]}{result.fee}</li>
                      </>
                    ) : (
                      <>
                        <li>Gross Amount (charged): {currencySymbols[currency]}{result.gross}</li>
                        <li>Fee = Gross × (Percent/100) + Fixed = {result.gross} × ({result.percent}/100) + {result.fixed} = {currencySymbols[currency]}{result.fee}</li>
                        <li>Net = Gross - Fee = {result.gross} - {result.fee} = {currencySymbols[currency]}{result.net}</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calculation History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Calculation History</h3>
            <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
              {history.slice().reverse().map((entry, index) => (
                <li key={index}>
                  {entry.isFeeDeducted ? "Net" : "Gross"}: {currencySymbols[entry.currency]}{entry.isFeeDeducted ? entry.net : entry.gross} → Fee: {currencySymbols[entry.currency]}{entry.fee} ({entry.percent}% + {currencySymbols[entry.currency]}{entry.fixed})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple fee types: Domestic, International, Micropayments, Custom</li>
            <li>Support for USD, EUR, GBP currencies</li>
            <li>Calculate with fees included or excluded</li>
            <li>Detailed calculation breakdown</li>
            <li>Download results as text file</li>
            <li>Calculation history (last 5)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PayPalFeeCalculator;