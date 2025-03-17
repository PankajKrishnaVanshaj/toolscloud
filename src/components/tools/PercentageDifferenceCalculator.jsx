"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const PercentageDifferenceCalculator = () => {
  const [number1, setNumber1] = useState("");
  const [number2, setNumber2] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [precision, setPrecision] = useState(2); // Decimal places
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Calculate percentage difference
  const calculatePercentageDifference = useCallback((num1, num2) => {
    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);

    if (isNaN(n1) || isNaN(n2)) {
      return { error: "Please enter valid numbers" };
    }
    if (n1 === 0 && n2 === 0) {
      return { error: "Both numbers cannot be zero (undefined percentage difference)" };
    }

    const absoluteDiff = Math.abs(n2 - n1);
    const average = (n1 + n2) / 2;
    const percentDiff = average === 0 ? 0 : (absoluteDiff / average) * 100;
    const directionalChange = n1 === 0 ? (n2 > 0 ? Infinity : -Infinity) : ((n2 - n1) / Math.abs(n1)) * 100;
    const isIncrease = n2 > n1;

    return {
      number1: n1.toFixed(precision),
      number2: n2.toFixed(precision),
      percentDiff: percentDiff.toFixed(precision),
      directionalChange: isFinite(directionalChange) ? directionalChange.toFixed(precision) : directionalChange,
      absoluteDiff: absoluteDiff.toFixed(precision),
      average: average.toFixed(precision),
      isIncrease,
      isZeroBase: n1 === 0,
    };
  }, [precision]);

  const calculate = () => {
    setError("");
    setResult(null);

    if (!number1 || !number2) {
      setError("Please enter both numbers");
      return;
    }

    const calcResult = calculatePercentageDifference(number1, number2);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
    setHistory((prev) => [
      { ...calcResult, timestamp: new Date().toLocaleString() },
      ...prev.slice(0, 9), // Keep last 10 entries
    ]);
  };

  const reset = () => {
    setNumber1("");
    setNumber2("");
    setResult(null);
    setError("");
    setShowDetails(false);
    setPrecision(2);
  };

  const downloadResult = () => {
    if (!result) return;
    const text = [
      "Percentage Difference Calculator Result",
      `Date: ${new Date().toLocaleString()}`,
      `Number 1: ${result.number1}`,
      `Number 2: ${result.number2}`,
      `Percentage Difference: ${result.percentDiff}%`,
      `Directional Change: ${result.isZeroBase ? "Undefined (base is zero)" : `${result.isIncrease ? "Increase" : "Decrease"} by ${Math.abs(result.directionalChange)}%`}`,
      `Absolute Difference: ${result.absoluteDiff}`,
      `Average: ${result.average}`,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `percent-diff-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Percentage Difference Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {["Number 1", "Number 2"].map((label, index) => (
              <div key={label} className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-gray-700 text-sm font-medium">{label}:</label>
                <input
                  type="number"
                  step="any"
                  value={index === 0 ? number1 : number2}
                  onChange={(e) => (index === 0 ? setNumber1(e.target.value) : setNumber2(e.target.value))}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={`e.g., ${index === 0 ? "100" : "120"}`}
                />
              </div>
            ))}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700 text-sm font-medium">Precision (decimals):</label>
              <input
                type="number"
                min="0"
                max="6"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(6, parseInt(e.target.value) || 0)))}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadResult}
              disabled={!result}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl font-medium">
                Percentage Difference: {result.percentDiff}%
              </p>
              <p className="text-center">
                {result.isZeroBase
                  ? "Directional Change: Undefined (base is zero)"
                  : `Directional Change: ${result.isIncrease ? "Increase" : "Decrease"} by ${Math.abs(result.directionalChange)}%`}
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
                  <p className="font-medium">Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Number 1: {result.number1}</li>
                    <li>Number 2: {result.number2}</li>
                    <li>Absolute Difference = |{result.number2} - {result.number1}| = {result.absoluteDiff}</li>
                    <li>Average = ({result.number1} + {result.number2}) / 2 = {result.average}</li>
                    <li>Percentage Difference = ({result.absoluteDiff} / {result.average}) × 100 = {result.percentDiff}%</li>
                    <li>
                      Directional Change = 
                      {result.isZeroBase
                        ? `${result.number2 > 0 ? "Infinity" : "-Infinity"} (division by zero)`
                        : `(${result.number2} - ${result.number1}) / |${result.number1}| × 100 = ${result.directionalChange}%`}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="mt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700 font-semibold"
          >
            {showHistory ? "Hide History" : "Show History"} ({history.length} calculations)
          </button>
          {showHistory && history.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Calculation History</h3>
              <ul className="space-y-2 text-sm">
                {history.map((entry, index) => (
                  <li key={index} className="p-2 bg-white rounded-md shadow-sm">
                    <p>{entry.timestamp}</p>
                    <p>Number 1: {entry.number1}, Number 2: {entry.number2}</p>
                    <p>Percentage Difference: {entry.percentDiff}%</p>
                    <p>
                      Directional Change: {entry.isZeroBase ? "Undefined" : `${entry.isIncrease ? "Increase" : "Decrease"} by ${Math.abs(entry.directionalChange)}%`}
                    </p>
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
            <li>Calculate percentage difference and directional change</li>
            <li>Adjustable precision (0-6 decimal places)</li>
            <li>Detailed calculation breakdown</li>
            <li>Download results as text file</li>
            <li>Calculation history (last 10 entries)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PercentageDifferenceCalculator;