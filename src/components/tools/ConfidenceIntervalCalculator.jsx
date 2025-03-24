"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaInfoCircle } from "react-icons/fa";

const ConfidenceIntervalCalculator = () => {
  const [sampleSize, setSampleSize] = useState("");
  const [sampleMean, setSampleMean] = useState("");
  const [stdDev, setStdDev] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [distribution, setDistribution] = useState("z"); // z or t distribution
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  // Z-scores and T-scores (simplified for common df values)
  const zScores = { 90: 1.645, 95: 1.96, 99: 2.576 };
  const tScores = {
    90: { 10: 1.812, 30: 1.697, 100: 1.660 },
    95: { 10: 2.228, 30: 2.042, 100: 1.984 },
    99: { 10: 2.764, 30: 2.457, 100: 2.364 },
  };

  const calculateConfidenceInterval = useCallback(() => {
    const n = parseInt(sampleSize);
    const mean = parseFloat(sampleMean);
    const s = parseFloat(stdDev);
    const cl = parseInt(confidenceLevel);

    if (isNaN(n) || isNaN(mean) || isNaN(s)) {
      return { error: "Please enter valid numbers" };
    }
    if (n <= 0 || s < 0) {
      return { error: "Sample size must be positive, standard deviation cannot be negative" };
    }
    if (n < 2) {
      return { error: "Sample size must be at least 2" };
    }

    const df = n - 1; // Degrees of freedom for t-distribution
    let criticalValue;

    if (distribution === "z") {
      criticalValue = zScores[cl];
    } else {
      // Simplified t-score lookup based on sample size ranges
      const tTable = tScores[cl];
      criticalValue =
        n <= 10 ? tTable[10] : n <= 30 ? tTable[30] : tTable[100] || zScores[cl];
    }

    const standardError = s / Math.sqrt(n);
    const marginOfError = criticalValue * standardError;
    const lowerBound = mean - marginOfError;
    const upperBound = mean + marginOfError;

    return {
      sampleSize: n,
      mean: mean.toFixed(2),
      stdDev: s.toFixed(2),
      confidenceLevel: cl,
      distribution: distribution === "z" ? "Z" : "t",
      criticalValue: criticalValue.toFixed(3),
      standardError: standardError.toFixed(4),
      marginOfError: marginOfError.toFixed(4),
      lowerBound: lowerBound.toFixed(2),
      upperBound: upperBound.toFixed(2),
    };
  }, [sampleSize, sampleMean, stdDev, confidenceLevel, distribution]);

  const calculate = () => {
    setError("");
    setResult(null);

    if (!sampleSize || !sampleMean || !stdDev) {
      setError("Please fill in all required fields");
      return;
    }

    const calcResult = calculateConfidenceInterval();
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setSampleSize("");
    setSampleMean("");
    setStdDev("");
    setConfidenceLevel(95);
    setDistribution("z");
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  const downloadResult = () => {
    if (!result) return;
    const text = `
Confidence Interval Calculation Result
------------------------------------
Sample Size (n): ${result.sampleSize}
Sample Mean (x̄): ${result.mean}
Standard Deviation (s): ${result.stdDev}
Confidence Level: ${result.confidenceLevel}%
Distribution: ${result.distribution}
Critical Value: ${result.criticalValue}
Standard Error: ${result.standardError}
Margin of Error: ${result.marginOfError}
Confidence Interval: [${result.lowerBound}, ${result.upperBound}]
    `.trim();

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `confidence-interval-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Confidence Interval Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sample Size (n)
              </label>
              <input
                type="number"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 30"
                min="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sample Mean (x̄)
              </label>
              <input
                type="number"
                step="0.01"
                value={sampleMean}
                onChange={(e) => setSampleMean(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Std Dev (s)
              </label>
              <input
                type="number"
                step="0.01"
                value={stdDev}
                onChange={(e) => setStdDev(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confidence Level (%)
              </label>
              <select
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={90}>90%</option>
                <option value={95}>95%</option>
                <option value={99}>99%</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distribution
              </label>
              <select
                value={distribution}
                onChange={(e) => setDistribution(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="z">Z (Normal)</option>
                <option value="t">t (Student's t)</option>
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Calculate
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
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center border border-red-200">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              {result.confidenceLevel}% Confidence Interval ({result.distribution}):
            </h2>
            <div className="mt-4 space-y-4">
              <p className="text-center text-xl font-medium">
                [{result.lowerBound}, {result.upperBound}]
              </p>
              <p className="text-center text-gray-600">
                Margin of Error: ±{result.marginOfError}
              </p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:underline flex items-center justify-center mx-auto"
                >
                  <FaInfoCircle className="mr-1" />
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="font-semibold">Calculation Details:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Sample Size (n): {result.sampleSize}</li>
                    <li>Sample Mean (x̄): {result.mean}</li>
                    <li>Standard Deviation (s): {result.stdDev}</li>
                    <li>
                      Critical Value ({result.distribution}-score): {result.criticalValue}
                    </li>
                    <li>
                      Standard Error (SE) = s / √n = {result.stdDev} / √{result.sampleSize} ={" "}
                      {result.standardError}
                    </li>
                    <li>
                      Margin of Error (ME) = {result.distribution} × SE ={" "}
                      {result.criticalValue} × {result.standardError} = {result.marginOfError}
                    </li>
                    <li>
                      Lower Bound = x̄ - ME = {result.mean} - {result.marginOfError} ={" "}
                      {result.lowerBound}
                    </li>
                    <li>
                      Upper Bound = x̄ + ME = {result.mean} + {result.marginOfError} ={" "}
                      {result.upperBound}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            <li>Supports Z and t distributions</li>
            <li>Customizable confidence levels (90%, 95%, 99%)</li>
            <li>Detailed calculation breakdown</li>
            <li>Download results as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceIntervalCalculator;