"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaShareAlt, FaDollarSign } from "react-icons/fa";

const TipCalculator = () => {
  const [billAmount, setBillAmount] = useState("");
  const [tipPercentage, setTipPercentage] = useState("15"); // Default 15%
  const [customTip, setCustomTip] = useState("");
  const [numPeople, setNumPeople] = useState("1");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [currency, setCurrency] = useState("$"); // Default USD
  const [splitEvenly, setSplitEvenly] = useState(true); // Toggle for even split

  // Calculate tip and total
  const calculateTip = useCallback((bill, tipPercent, people) => {
    const billNum = parseFloat(bill);
    const tipNum = tipPercent === "custom" ? parseFloat(customTip) : parseFloat(tipPercent);
    const peopleNum = parseInt(people);

    if (isNaN(billNum) || isNaN(tipNum) || isNaN(peopleNum)) {
      return { error: "Please enter valid numbers" };
    }
    if (billNum < 0 || tipNum < 0 || peopleNum < 1) {
      return { error: "Bill and tip must be non-negative, people must be at least 1" };
    }

    const tipAmount = billNum * (tipNum / 100);
    const totalAmount = billNum + tipAmount;
    const tipPerPerson = tipAmount / peopleNum;
    const totalPerPerson = totalAmount / peopleNum;

    return {
      tipAmount: tipAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      tipPerPerson: tipPerPerson.toFixed(2),
      totalPerPerson: totalPerPerson.toFixed(2),
      bill: billNum.toFixed(2),
      tipPercentage: tipNum,
      people: peopleNum,
    };
  }, [customTip]);

  const calculate = () => {
    setError("");
    setResult(null);

    if (!billAmount || (tipPercentage === "custom" && !customTip)) {
      setError("Please enter bill amount and tip percentage");
      return;
    }

    const calcResult = calculateTip(billAmount, tipPercentage, numPeople);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setBillAmount("");
    setTipPercentage("15");
    setCustomTip("");
    setNumPeople("1");
    setResult(null);
    setError("");
    setShowDetails(false);
    setCurrency("$");
    setSplitEvenly(true);
  };

  // Share result
  const shareResult = () => {
    if (!result) return;
    const text = `Tip Calculator Result:\nTotal Tip: ${currency}${result.tipAmount}\nTotal Bill: ${currency}${result.totalAmount}\nTip per Person: ${currency}${result.tipPerPerson}\nTotal per Person: ${currency}${result.totalPerPerson}`;
    if (navigator.share) {
      navigator.share({ title: "Tip Calculation", text });
    } else {
      alert("Share feature not supported. Here's the result:\n" + text);
    }
  };

  const tipOptions = ["10", "15", "20", "25", "custom"];
  const currencyOptions = [
    { symbol: "$", label: "USD" },
    { symbol: "€", label: "EUR" },
    { symbol: "£", label: "GBP" },
    { symbol: "¥", label: "JPY" },
  ];

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center gap-2">
          <FaCalculator /> Tip Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Bill Amount */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700 text-sm font-medium">
                Bill Amount ({currency}):
              </label>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-gray-500">{currency}</span>
                <input
                  type="number"
                  step="0.01"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 50.00"
                />
              </div>
            </div>

            {/* Tip Percentage */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700 text-sm font-medium">Tip Percentage:</label>
              <div className="flex-1 flex flex-wrap gap-2">
                {tipOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setTipPercentage(option)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      tipPercentage === option
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {option === "custom" ? "Custom" : `${option}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Tip */}
            {tipPercentage === "custom" && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-gray-700 text-sm font-medium">
                  Custom Tip (%):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 18"
                />
              </div>
            )}

            {/* Number of People */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700 text-sm font-medium">
                Number of People:
              </label>
              <input
                type="number"
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 1"
                min="1"
              />
            </div>

            {/* Currency Selection */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700 text-sm font-medium">Currency:</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {currencyOptions.map((opt) => (
                  <option key={opt.symbol} value={opt.symbol}>
                    {opt.label} ({opt.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Split Toggle */}
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700 text-sm font-medium">Split Evenly:</label>
              <input
                type="checkbox"
                checked={splitEvenly}
                onChange={(e) => setSplitEvenly(e.target.checked)}
                className="h-5 w-5 text-green-600 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold flex items-center justify-center"
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
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center flex items-center justify-center gap-2">
              <FaDollarSign /> Tip Results
            </h2>
            <div className="mt-4 space-y-3 text-center">
              <p>Total Tip: {currency}{result.tipAmount}</p>
              <p>Total Bill: {currency}{result.totalAmount}</p>
              {splitEvenly && (
                <>
                  <p>Tip per Person: {currency}{result.tipPerPerson}</p>
                  <p>Total per Person: {currency}{result.totalPerPerson}</p>
                </>
              )}

              {/* Share Button */}
              <button
                onClick={shareResult}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center mx-auto"
              >
                <FaShareAlt className="mr-2" /> Share Result
              </button>

              {/* Details Toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-2 text-sm text-green-600 hover:underline"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>

              {showDetails && (
                <div className="mt-2 text-sm text-gray-600 space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Bill Amount: {currency}{result.bill}</li>
                    <li>Tip Percentage: {result.tipPercentage}%</li>
                    <li>
                      Tip Amount = {currency}{result.bill} × {result.tipPercentage / 100} ={" "}
                      {currency}{result.tipAmount}
                    </li>
                    <li>
                      Total Amount = {currency}{result.bill} + {currency}{result.tipAmount} ={" "}
                      {currency}{result.totalAmount}
                    </li>
                    <li>Number of People: {result.people}</li>
                    {splitEvenly && (
                      <>
                        <li>
                          Tip per Person = {currency}{result.tipAmount} / {result.people} ={" "}
                          {currency}{result.tipPerPerson}
                        </li>
                        <li>
                          Total per Person = {currency}{result.totalAmount} / {result.people} ={" "}
                          {currency}{result.totalPerPerson}
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
            <li>Customizable tip percentages</li>
            <li>Multiple currency support</li>
            <li>Option to split bill evenly or view total only</li>
            <li>Share results via Web Share API</li>
            <li>Detailed calculation breakdown</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TipCalculator;