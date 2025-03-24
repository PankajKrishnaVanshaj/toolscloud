"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const GSTCalculator = () => {
  const [amount, setAmount] = useState("");
  const [gstRate, setGstRate] = useState("");
  const [isGstIncluded, setIsGstIncluded] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState([]);

  // Calculate GST
  const calculateGST = useCallback((price, rate, gstIncluded) => {
    const amountNum = parseFloat(price);
    const rateNum = parseFloat(rate);

    if (isNaN(amountNum) || isNaN(rateNum)) {
      return { error: "Please enter valid numbers" };
    }
    if (amountNum < 0 || rateNum < 0) {
      return { error: "Amount and GST rate must be non-negative" };
    }

    let gstAmount, netPrice, totalPrice;

    if (gstIncluded) {
      totalPrice = amountNum;
      netPrice = amountNum / (1 + rateNum / 100);
      gstAmount = totalPrice - netPrice;
    } else {
      netPrice = amountNum;
      gstAmount = netPrice * (rateNum / 100);
      totalPrice = netPrice + gstAmount;
    }

    return {
      netPrice: netPrice.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      gstRate: rateNum.toFixed(2),
      isGstIncluded,
      currency,
    };
  }, [currency]);

  const calculate = () => {
    setError("");
    setResult(null);

    if (!amount || !gstRate) {
      setError("Please enter both amount and GST rate");
      return;
    }

    const calcResult = calculateGST(amount, gstRate, isGstIncluded);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
    setHistory((prev) => [...prev, calcResult].slice(-5)); // Keep last 5 calculations
  };

  const reset = () => {
    setAmount("");
    setGstRate("");
    setIsGstIncluded(false);
    setCurrency("USD");
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  const downloadResult = () => {
    if (!result) return;
    const text = `
GST Calculation Result:
- Net Price (excl. GST): ${result.currency} ${result.netPrice}
- GST Amount: ${result.currency} ${result.gstAmount}
- Total Price (incl. GST): ${result.currency} ${result.totalPrice}
- GST Rate: ${result.gstRate}%
- GST Included in Amount: ${result.isGstIncluded ? "Yes" : "No"}
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `gst-calculation-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          GST Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700 text-sm font-medium">Amount:</label>
              <div className="flex-1 flex items-center gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
                >
                  <option value="USD">$ USD</option>
                  <option value="INR">₹ INR</option>
                  <option value="EUR">€ EUR</option>
                  <option value="AUD">$ AUD</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 100"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700 text-sm font-medium">GST Rate (%):</label>
              <input
                type="number"
                step="0.01"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 10"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700 text-sm font-medium">GST Included?</label>
              <input
                type="checkbox"
                checked={isGstIncluded}
                onChange={(e) => setIsGstIncluded(e.target.checked)}
                className="h-5 w-5 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-gray-700">Yes</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center"
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
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
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
          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">GST Results:</h2>
            <div className="mt-2 space-y-2 text-center">
              <p>Net Price (excl. GST): {result.currency} {result.netPrice}</p>
              <p>GST Amount: {result.currency} {result.gstAmount}</p>
              <p className="text-xl font-bold">
                Total Price (incl. GST): {result.currency} {result.totalPrice}
              </p>

              {/* Details Toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-orange-600 hover:underline"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>

              {showDetails && (
                <div className="text-sm text-gray-600 space-y-2 mt-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>GST Rate: {result.gstRate}%</li>
                    {result.isGstIncluded ? (
                      <>
                        <li>Total Price (with GST): {result.currency} {result.totalPrice}</li>
                        <li>
                          Net Price = Total / (1 + GST Rate/100) = {result.totalPrice} / (1 +{" "}
                          {result.gstRate}/100) = {result.currency} {result.netPrice}
                        </li>
                        <li>
                          GST Amount = Total - Net = {result.totalPrice} - {result.netPrice} ={" "}
                          {result.currency} {result.gstAmount}
                        </li>
                      </>
                    ) : (
                      <>
                        <li>Net Price (without GST): {result.currency} {result.netPrice}</li>
                        <li>
                          GST Amount = Net × (GST Rate/100) = {result.netPrice} × (
                          {result.gstRate}/100) = {result.currency} {result.gstAmount}
                        </li>
                        <li>
                          Total Price = Net + GST = {result.netPrice} + {result.gstAmount} ={" "}
                          {result.currency} {result.totalPrice}
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
            <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
              {history.slice().reverse().map((item, index) => (
                <li key={index}>
                  {item.currency} {item.totalPrice} (GST: {item.gstAmount}, Rate: {item.gstRate}%
                  {item.isGstIncluded ? ", Incl." : ", Excl."})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate GST included or excluded amounts</li>
            <li>Support for multiple currencies</li>
            <li>Detailed calculation breakdown</li>
            <li>Download results as text file</li>
            <li>Calculation history (last 5)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GSTCalculator;