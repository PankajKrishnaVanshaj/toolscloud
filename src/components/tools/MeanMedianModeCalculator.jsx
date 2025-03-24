"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const MeanMedianModeCalculator = () => {
  const [numbers, setNumbers] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [inputMode, setInputMode] = useState("text"); // "text" or "list"

  // Calculate statistics
  const calculateStats = useCallback((input) => {
    const numArray = input
      .split(/[\s,\n]+/)
      .map((num) => num.trim())
      .filter((num) => num !== "")
      .map((num) => parseFloat(num));

    if (numArray.length === 0 || numArray.some(isNaN)) {
      return { error: "Please enter valid numbers separated by commas, spaces, or newlines" };
    }

    // Mean
    const mean = numArray.reduce((sum, num) => sum + num, 0) / numArray.length;

    // Median
    const sortedArray = [...numArray].sort((a, b) => a - b);
    const mid = Math.floor(sortedArray.length / 2);
    const median =
      sortedArray.length % 2 === 0
        ? (sortedArray[mid - 1] + sortedArray[mid]) / 2
        : sortedArray[mid];

    // Mode
    const frequency = {};
    numArray.forEach((num) => {
      frequency[num] = (frequency[num] || 0) + 1;
    });
    let maxFreq = 0;
    let modes = [];
    for (const [num, count] of Object.entries(frequency)) {
      if (count > maxFreq) {
        maxFreq = count;
        modes = [parseFloat(num)];
      } else if (count === maxFreq) {
        modes.push(parseFloat(num));
      }
    }
    const mode = modes.length === numArray.length ? "No mode" : modes.join(", ");

    // Additional stats
    const variance =
      numArray.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numArray.length;
    const stdDev = Math.sqrt(variance);
    const range = Math.max(...numArray) - Math.min(...numArray);

    return {
      mean: mean.toFixed(decimalPlaces),
      median: median.toFixed(decimalPlaces),
      mode,
      variance: variance.toFixed(decimalPlaces),
      stdDev: stdDev.toFixed(decimalPlaces),
      range: range.toFixed(decimalPlaces),
      numbers: numArray,
      sortedNumbers: sortedArray,
    };
  }, [decimalPlaces]);

  const calculate = () => {
    setError("");
    setResult(null);

    if (!numbers.trim()) {
      setError("Please enter numbers to calculate");
      return;
    }

    const calcResult = calculateStats(numbers);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setNumbers("");
    setResult(null);
    setError("");
    setShowDetails(false);
    setDecimalPlaces(2);
    setInputMode("text");
  };

  const downloadResults = () => {
    if (!result) return;
    const content = `
Mean, Median, Mode Calculator Results
------------------------------
Numbers: ${result.numbers.join(", ")}
Mean: ${result.mean}
Median: ${result.median}
Mode: ${result.mode}
Variance: ${result.variance}
Standard Deviation: ${result.stdDev}
Range: ${result.range}
    `.trim();
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `stats-results-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Statistical Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Numbers:
            </label>
            {inputMode === "text" ? (
              <textarea
                value={numbers}
                onChange={(e) => setNumbers(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-32 resize-y"
                placeholder="e.g., 1, 2, 3, 4, 5 or 1 2 3 4 5 or one per line"
              />
            ) : (
              <textarea
                value={numbers}
                onChange={(e) => setNumbers(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-32 resize-y"
                placeholder="Enter one number per line"
              />
            )}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Places
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(Math.max(0, Math.min(6, e.target.value)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Mode
              </label>
              <select
                value={inputMode}
                onChange={(e) => setInputMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-yellow-500"
              >
                <option value="text">Free Text</option>
                <option value="list">One Per Line</option>
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-all flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadResults}
              disabled={!result}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p className="text-center">
                <span className="font-medium">Mean:</span> {result.mean}
              </p>
              <p className="text-center">
                <span className="font-medium">Median:</span> {result.median}
              </p>
              <p className="text-center">
                <span className="font-medium">Mode:</span> {result.mode}
              </p>
              <p className="text-center">
                <span className="font-medium">Variance:</span> {result.variance}
              </p>
              <p className="text-center">
                <span className="font-medium">Std. Dev.:</span> {result.stdDev}
              </p>
              <p className="text-center">
                <span className="font-medium">Range:</span> {result.range}
              </p>
            </div>

            {/* Details Toggle */}
            <div className="text-center mt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-yellow-600 hover:underline"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
            </div>

            {showDetails && (
              <div className="mt-4 text-sm space-y-2">
                <p className="font-medium">Calculation Details:</p>
                <ul className="list-disc list-inside">
                  <li>Numbers: {result.numbers.join(", ")}</li>
                  <li>
                    Mean = (Sum) / Count = ({result.numbers.reduce((sum, num) => sum + num, 0)}) /{" "}
                    {result.numbers.length} = {result.mean}
                  </li>
                  <li>Sorted: {result.sortedNumbers.join(", ")}</li>
                  <li>
                    Median ={" "}
                    {result.numbers.length % 2 === 0
                      ? `Average of middle (${result.sortedNumbers[Math.floor(result.numbers.length / 2) - 1]} + ${result.sortedNumbers[Math.floor(result.numbers.length / 2)]}) / 2 = ${result.median}`
                      : `Middle value = ${result.median}`}
                  </li>
                  <li>
                    Mode = Most frequent: {result.mode === "No mode" ? "All appear once" : result.mode}
                  </li>
                  <li>Variance = Σ(x - mean)² / n = {result.variance}</li>
                  <li>Standard Deviation = √Variance = {result.stdDev}</li>
                  <li>Range = Max - Min = {result.range}</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculates Mean, Median, Mode, Variance, Std. Dev., Range</li>
            <li>Customizable decimal places (0-6)</li>
            <li>Flexible input: commas, spaces, or newlines</li>
            <li>Two input modes: Free Text or One Per Line</li>
            <li>Download results as text file</li>
            <li>Detailed calculation breakdown</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MeanMedianModeCalculator;