"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const LoanToValueCalculator = () => {
  const [mode, setMode] = useState("ltv"); // ltv, loan, value
  const [loanAmount, setLoanAmount] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [ltv, setLtv] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [currency, setCurrency] = useState("USD"); // New currency option
  const [history, setHistory] = useState([]); // Calculation history

  // Format number with currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(value);
  };

  // Calculate LTV based on mode
  const calculateLTV = useCallback(() => {
    setError("");
    setResult(null);

    const loanNum = parseFloat(loanAmount);
    const valueNum = parseFloat(propertyValue);
    const ltvNum = parseFloat(ltv);

    if (mode === "ltv") {
      if (isNaN(loanNum) || isNaN(valueNum))
        return { error: "Please enter valid loan amount and property value" };
      if (loanNum < 0 || valueNum <= 0)
        return { error: "Loan amount must be non-negative, property value must be positive" };
      const ltvCalc = (loanNum / valueNum) * 100;
      return { loanAmount: loanNum, propertyValue: valueNum, ltv: ltvCalc, type: "ltv" };
    } else if (mode === "loan") {
      if (isNaN(ltvNum) || isNaN(valueNum))
        return { error: "Please enter valid LTV and property value" };
      if (ltvNum < 0 || valueNum <= 0)
        return { error: "LTV must be non-negative, property value must be positive" };
      const loanCalc = (ltvNum / 100) * valueNum;
      return { loanAmount: loanCalc, propertyValue: valueNum, ltv: ltvNum, type: "loan" };
    } else if (mode === "value") {
      if (isNaN(loanNum) || isNaN(ltvNum))
        return { error: "Please enter valid loan amount and LTV" };
      if (loanNum < 0 || ltvNum <= 0)
        return { error: "Loan amount must be non-negative, LTV must be positive" };
      const valueCalc = loanNum / (ltvNum / 100);
      return { loanAmount: loanNum, propertyValue: valueCalc, ltv: ltvNum, type: "value" };
    }
    return null;
  }, [mode, loanAmount, propertyValue, ltv]);

  const calculate = () => {
    if (
      (mode === "ltv" && (!loanAmount || !propertyValue)) ||
      (mode === "loan" && (!ltv || !propertyValue)) ||
      (mode === "value" && (!loanAmount || !ltv))
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const calcResult = calculateLTV();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
    setHistory((prev) => [
      ...prev,
      { ...calcResult, timestamp: new Date().toLocaleString() },
    ].slice(-5)); // Keep last 5 calculations
  };

  const reset = () => {
    setMode("ltv");
    setLoanAmount("");
    setPropertyValue("");
    setLtv("");
    setResult(null);
    setError("");
    setShowDetails(false);
    setCurrency("USD");
  };

  const downloadResult = () => {
    if (!result) return;
    const text = `
Loan-to-Value Calculation Result (${new Date().toLocaleString()}):
Mode: ${mode.toUpperCase()}
Loan Amount: ${formatCurrency(result.loanAmount)}
Property Value: ${formatCurrency(result.propertyValue)}
LTV Ratio: ${result.ltv.toFixed(2)}%
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ltv-result-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Loan-to-Value Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["ltv", "loan", "value"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                mode === m
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors`}
            >
              Calculate {m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {(mode === "ltv" || mode === "value") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-gray-700 text-sm font-medium">
                  Loan Amount ({currency}):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 80000"
                />
              </div>
            )}
            {(mode === "ltv" || mode === "loan") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-gray-700 text-sm font-medium">
                  Property Value ({currency}):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100000"
                />
              </div>
            )}
            {(mode === "loan" || mode === "value") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-gray-700 text-sm font-medium">LTV (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={ltv}
                  onChange={(e) => setLtv(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 80"
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700 text-sm font-medium">Currency:</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
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
              <FaDownload className="mr-2" /> Download
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
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">LTV Results</h2>
            <div className="mt-2 space-y-2 text-center">
              <p>Loan Amount: {formatCurrency(result.loanAmount)}</p>
              <p>Property Value: {formatCurrency(result.propertyValue)}</p>
              <p>LTV Ratio: {result.ltv.toFixed(2)}%</p>

              {/* Details Toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>

              {showDetails && (
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium">Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.type === "ltv" && (
                      <>
                        <li>Loan Amount: {formatCurrency(result.loanAmount)}</li>
                        <li>Property Value: {formatCurrency(result.propertyValue)}</li>
                        <li>
                          LTV = (Loan Amount / Property Value) × 100 = (
                          {result.loanAmount} / {result.propertyValue}) × 100 ={" "}
                          {result.ltv.toFixed(2)}%
                        </li>
                      </>
                    )}
                    {result.type === "loan" && (
                      <>
                        <li>Property Value: {formatCurrency(result.propertyValue)}</li>
                        <li>LTV: {result.ltv.toFixed(2)}%</li>
                        <li>
                          Loan Amount = (LTV / 100) × Property Value = (
                          {result.ltv} / 100) × {result.propertyValue} ={" "}
                          {formatCurrency(result.loanAmount)}
                        </li>
                      </>
                    )}
                    {result.type === "value" && (
                      <>
                        <li>Loan Amount: {formatCurrency(result.loanAmount)}</li>
                        <li>LTV: {result.ltv.toFixed(2)}%</li>
                        <li>
                          Property Value = Loan Amount / (LTV / 100) ={" "}
                          {result.loanAmount} / ({result.ltv} / 100) ={" "}
                          {formatCurrency(result.propertyValue)}
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
            <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
              {history.slice().reverse().map((entry, index) => (
                <li key={index}>
                  {entry.timestamp} - {entry.type.toUpperCase()}: Loan:{" "}
                  {formatCurrency(entry.loanAmount)}, Value:{" "}
                  {formatCurrency(entry.propertyValue)}, LTV: {entry.ltv.toFixed(2)}%
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate LTV, Loan Amount, or Property Value</li>
            <li>Multiple currency support</li>
            <li>Detailed calculation breakdown</li>
            <li>Download results as text file</li>
            <li>Calculation history (last 5)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoanToValueCalculator;