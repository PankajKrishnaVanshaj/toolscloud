"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaChartBar } from "react-icons/fa";

const AverageCalculator = () => {
  const [numbers, setNumbers] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [calculationType, setCalculationType] = useState("all"); // New: Select calculation type
  const [decimalPlaces, setDecimalPlaces] = useState(2); // New: Control decimal precision

  // Calculate various statistical measures
  const calculateAverages = useCallback((input) => {
    const numArray = input
      .split(/[\s,]+/)
      .map((num) => num.trim())
      .filter((num) => num !== "")
      .map((num) => parseFloat(num));

    if (numArray.length === 0 || numArray.some(isNaN)) {
      return { error: "Please enter valid numbers separated by commas or spaces" };
    }

    // Mean (Arithmetic Average)
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

    // Additional Calculations
    const min = Math.min(...numArray);
    const max = Math.max(...numArray);
    const range = max - min;
    const variance =
      numArray.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) /
      numArray.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean: mean.toFixed(decimalPlaces),
      median: median.toFixed(decimalPlaces),
      mode,
      min: min.toFixed(decimalPlaces),
      max: max.toFixed(decimalPlaces),
      range: range.toFixed(decimalPlaces),
      variance: variance.toFixed(decimalPlaces),
      stdDev: stdDev.toFixed(decimalPlaces),
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

    const calcResult = calculateAverages(numbers);
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
    setCalculationType("all");
    setDecimalPlaces(2);
  };

  // Download results as text file
  const downloadResults = () => {
    if (!result) return;
    const text = `
Average Calculator Results:
- Mean: ${result.mean}
- Median: ${result.median}
- Mode: ${result.mode}
- Min: ${result.min}
- Max: ${result.max}
- Range: ${result.range}
- Variance: ${result.variance}
- Standard Deviation: ${result.stdDev}
- Numbers: ${result.numbers.join(", ")}
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `average-results-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Average Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <label className="w-32 text-gray-700 font-medium">Numbers:</label>
            <input
              type="text"
              value={numbers}
              onChange={(e) => setNumbers(e.target.value)}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 1, 2, 3, 4, 5 or 1 2 3 4 5"
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calculation Type
              </label>
              <select
                value={calculationType}
                onChange={(e) => setCalculationType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Statistics</option>
                <option value="mean">Mean Only</option>
                <option value="median">Median Only</option>
                <option value="mode">Mode Only</option>
                <option value="range">Range & Extrema</option>
                <option value="variance">Variance & Std Dev</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Places ({decimalPlaces})
              </label>
              <input
                type="range"
                min="0"
                max="6"
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaChartBar className="mr-2" /> Calculate
            </button>
            <button
              onClick={downloadResults}
              disabled={!result}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
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
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <div className="mt-2 space-y-2 text-center">
              {(calculationType === "all" || calculationType === "mean") && (
                <p>Mean: {result.mean}</p>
              )}
              {(calculationType === "all" || calculationType === "median") && (
                <p>Median: {result.median}</p>
              )}
              {(calculationType === "all" || calculationType === "mode") && (
                <p>Mode: {result.mode}</p>
              )}
              {(calculationType === "all" || calculationType === "range") && (
                <>
                  <p>Min: {result.min}</p>
                  <p>Max: {result.max}</p>
                  <p>Range: {result.range}</p>
                </>
              )}
              {(calculationType === "all" || calculationType === "variance") && (
                <>
                  <p>Variance: {result.variance}</p>
                  <p>Standard Deviation: {result.stdDev}</p>
                </>
              )}

              {/* Details Toggle */}
              <div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-purple-600 hover:underline"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2 text-left">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Numbers: {result.numbers.join(", ")}</li>
                    {(calculationType === "all" || calculationType === "mean") && (
                      <li>
                        Mean = (Sum: {result.numbers.reduce((sum, num) => sum + num, 0)}) /{" "}
                        {result.numbers.length} = {result.mean}
                      </li>
                    )}
                    {(calculationType === "all" || calculationType === "median") && (
                      <li>
                        Sorted Numbers: {result.sortedNumbers.join(", ")}
                        <br />
                        Median ={" "}
                        {result.numbers.length % 2 === 0
                          ? `Average of middle numbers (${
                              result.sortedNumbers[Math.floor(result.numbers.length / 2) - 1]
                            } + ${result.sortedNumbers[Math.floor(result.numbers.length / 2)]}) / 2 = ${
                              result.median
                            }`
                          : `Middle number = ${result.median}`}
                      </li>
                    )}
                    {(calculationType === "all" || calculationType === "mode") && (
                      <li>
                        Mode = Most frequent: {result.mode === "No mode" ? "All unique" : result.mode}
                      </li>
                    )}
                    {(calculationType === "all" || calculationType === "range") && (
                      <>
                        <li>Min = Smallest number: {result.min}</li>
                        <li>Max = Largest number: {result.max}</li>
                        <li>Range = Max - Min: {result.range}</li>
                      </>
                    )}
                    {(calculationType === "all" || calculationType === "variance") && (
                      <>
                        <li>Variance = Average of squared differences: {result.variance}</li>
                        <li>Standard Deviation = √Variance: {result.stdDev}</li>
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
            <li>Calculate mean, median, mode, min, max, range, variance, and standard deviation</li>
            <li>Customizable calculation type</li>
            <li>Adjustable decimal precision</li>
            <li>Download results as text file</li>
            <li>Detailed calculation breakdown</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AverageCalculator;