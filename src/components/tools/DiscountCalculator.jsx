"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const DiscountCalculator = () => {
  const [mode, setMode] = useState("originalDiscount"); // originalDiscount, finalDiscount, discountAmount
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [currency, setCurrency] = useState("USD"); // Currency selection
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  // Currency symbols
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
  };

  // Calculate discount based on mode
  const calculateDiscount = useCallback(() => {
    setError("");
    setResult(null);

    const original = parseFloat(originalPrice);
    const discount = parseFloat(discountPercent);
    const final = parseFloat(finalPrice);
    const amount = parseFloat(discountAmount);

    if (mode === "originalDiscount") {
      if (isNaN(original) || isNaN(discount)) {
        return { error: "Please enter valid original price and discount percentage" };
      }
      if (original < 0 || discount < 0 || discount > 100) {
        return {
          error: "Original price must be non-negative, discount must be between 0 and 100%",
        };
      }
      const discountAmountCalc = original * (discount / 100);
      const finalPriceCalc = original - discountAmountCalc;
      return {
        originalPrice: original.toFixed(2),
        discountPercent: discount.toFixed(2),
        discountAmount: discountAmountCalc.toFixed(2),
        finalPrice: finalPriceCalc.toFixed(2),
        type: "originalDiscount",
      };
    } else if (mode === "finalDiscount") {
      if (isNaN(final) || isNaN(discount)) {
        return { error: "Please enter valid final price and discount percentage" };
      }
      if (final < 0 || discount < 0 || discount >= 100) {
        return {
          error: "Final price must be non-negative, discount must be between 0 and 99.99%",
        };
      }
      const originalPriceCalc = final / (1 - discount / 100);
      const discountAmountCalc = originalPriceCalc - final;
      return {
        originalPrice: originalPriceCalc.toFixed(2),
        discountPercent: discount.toFixed(2),
        discountAmount: discountAmountCalc.toFixed(2),
        finalPrice: final.toFixed(2),
        type: "finalDiscount",
      };
    } else if (mode === "discountAmount") {
      if (isNaN(original) || isNaN(amount)) {
        return { error: "Please enter valid original price and discount amount" };
      }
      if (original < 0 || amount < 0 || amount > original) {
        return {
          error: "Original price and discount amount must be non-negative, discount cannot exceed original price",
        };
      }
      const discountPercentCalc = (amount / original) * 100;
      const finalPriceCalc = original - amount;
      return {
        originalPrice: original.toFixed(2),
        discountPercent: discountPercentCalc.toFixed(2),
        discountAmount: amount.toFixed(2),
        finalPrice: finalPriceCalc.toFixed(2),
        type: "discountAmount",
      };
    }
    return null;
  }, [mode, originalPrice, discountPercent, finalPrice, discountAmount]);

  const calculate = () => {
    if (
      (mode === "originalDiscount" && (!originalPrice || !discountPercent)) ||
      (mode === "finalDiscount" && (!finalPrice || !discountPercent)) ||
      (mode === "discountAmount" && (!originalPrice || !discountAmount))
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const calcResult = calculateDiscount();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setMode("originalDiscount");
    setOriginalPrice("");
    setDiscountPercent("");
    setFinalPrice("");
    setDiscountAmount("");
    setCurrency("USD");
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  const downloadResult = () => {
    if (!result) return;
    const text = `
Discount Calculation Result (${currency}):
- Original Price: ${currencySymbols[currency]}${result.originalPrice}
- Discount: ${result.discountPercent}%
- Savings: ${currencySymbols[currency]}${result.discountAmount}
- Final Price: ${currencySymbols[currency]}${result.finalPrice}
    `;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `discount-result-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Discount Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            { id: "originalDiscount", label: "Original & Discount %" },
            { id: "finalDiscount", label: "Final & Discount %" },
            { id: "discountAmount", label: "Original & Discount Amount" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`px-3 py-1 rounded-lg text-sm sm:text-base ${
                mode === id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              } transition-colors`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700 text-sm sm:text-base">Currency:</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(currencySymbols).map((curr) => (
                  <option key={curr} value={curr}>
                    {curr} ({currencySymbols[curr]})
                  </option>
                ))}
              </select>
            </div>
            {(mode === "originalDiscount" || mode === "discountAmount") && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700 text-sm sm:text-base">
                  Original Price ({currencySymbols[currency]}):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100"
                />
              </div>
            )}
            {(mode === "originalDiscount" || mode === "finalDiscount") && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700 text-sm sm:text-base">
                  Discount (%):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 20"
                />
              </div>
            )}
            {mode === "finalDiscount" && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700 text-sm sm:text-base">
                  Final Price ({currencySymbols[currency]}):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 80"
                />
              </div>
            )}
            {mode === "discountAmount" && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700 text-sm sm:text-base">
                  Discount Amount ({currencySymbols[currency]}):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 20"
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
            <button
              onClick={downloadResult}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Result
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
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              Discount Results ({currency})
            </h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">
                Original Price: {currencySymbols[currency]}
                {result.originalPrice}
              </p>
              <p className="text-center">Discount: {result.discountPercent}%</p>
              <p className="text-center">
                Savings: {currencySymbols[currency]}
                {result.discountAmount}
              </p>
              <p className="text-center">
                Final Price: {currencySymbols[currency]}
                {result.finalPrice}
              </p>

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
                    {result.type === "originalDiscount" && (
                      <>
                        <li>
                          Original Price: {currencySymbols[currency]}
                          {result.originalPrice}
                        </li>
                        <li>
                          Discount Amount = Original × (Discount/100) ={" "}
                          {result.originalPrice} × ({result.discountPercent}/100) ={" "}
                          {currencySymbols[currency]}
                          {result.discountAmount}
                        </li>
                        <li>
                          Final Price = Original - Discount Amount ={" "}
                          {result.originalPrice} - {result.discountAmount} ={" "}
                          {currencySymbols[currency]}
                          {result.finalPrice}
                        </li>
                      </>
                    )}
                    {result.type === "finalDiscount" && (
                      <>
                        <li>
                          Final Price: {currencySymbols[currency]}
                          {result.finalPrice}
                        </li>
                        <li>
                          Original Price = Final / (1 - Discount/100) ={" "}
                          {result.finalPrice} / (1 - {result.discountPercent}/100) ={" "}
                          {currencySymbols[currency]}
                          {result.originalPrice}
                        </li>
                        <li>
                          Discount Amount = Original - Final ={" "}
                          {result.originalPrice} - {result.finalPrice} ={" "}
                          {currencySymbols[currency]}
                          {result.discountAmount}
                        </li>
                      </>
                    )}
                    {result.type === "discountAmount" && (
                      <>
                        <li>
                          Original Price: {currencySymbols[currency]}
                          {result.originalPrice}
                        </li>
                        <li>
                          Discount % = (Discount Amount / Original) × 100 = (
                          {result.discountAmount} / {result.originalPrice}) × 100 ={" "}
                          {result.discountPercent}%
                        </li>
                        <li>
                          Final Price = Original - Discount Amount ={" "}
                          {result.originalPrice} - {result.discountAmount} ={" "}
                          {currencySymbols[currency]}
                          {result.finalPrice}
                        </li>
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
            <li>Three calculation modes: Original & Discount %, Final & Discount %, Original & Discount Amount</li>
            <li>Multiple currency support</li>
            <li>Detailed calculation breakdown</li>
            <li>Download results as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DiscountCalculator;