"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaSync } from "react-icons/fa";

const StatisticsAnalyzer = () => {
  const [data, setData] = useState("");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [analysisType, setAnalysisType] = useState("basic"); // basic or advanced

  // Analyze statistics
  const analyzeStats = useCallback(() => {
    const steps = ["Analyzing statistics:"];
    const numList = data.split(",").map((item) => parseFloat(item.trim())).filter((num) => !isNaN(num));

    if (numList.length === 0) {
      return { error: "Please enter at least one valid number" };
    }

    const sortedList = [...numList].sort((a, b) => a - b);
    steps.push(`Dataset: ${numList.join(", ")}`);
    steps.push(`Sorted dataset: ${sortedList.join(", ")}`);

    // Basic Stats
    const mean = numList.reduce((sum, val) => sum + val, 0) / numList.length;
    steps.push(`Mean: (${numList.join(" + ")}) / ${numList.length} = ${mean.toFixed(decimalPlaces)}`);

    const mid = Math.floor(sortedList.length / 2);
    const median =
      sortedList.length % 2 === 0
        ? (sortedList[mid - 1] + sortedList[mid]) / 2
        : sortedList[mid];
    steps.push(
      `Median: ${
        sortedList.length % 2 === 0
          ? `Average of middle terms (${sortedList[mid - 1]} + ${sortedList[mid]}) / 2 = ${median.toFixed(decimalPlaces)}`
          : `Middle term = ${median.toFixed(decimalPlaces)}`
      }`
    );

    const frequency = {};
    numList.forEach((num) => (frequency[num] = (frequency[num] || 0) + 1));
    const maxFreq = Math.max(...Object.values(frequency));
    const mode =
      maxFreq > 1
        ? Object.keys(frequency)
            .filter((key) => frequency[key] === maxFreq)
            .map(Number)
        : "No mode";
    steps.push(
      `Mode: ${
        maxFreq > 1
          ? `Value(s) with highest frequency (${maxFreq}): ${mode.join(", ")}`
          : "All values appear once (no mode)"
      }`
    );

    const variance = numList.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numList.length;
    const stdDev = Math.sqrt(variance);
    steps.push(`Standard Deviation:`);
    steps.push(
      `1. Variance = Σ(x - mean)² / n = (${numList
        .map((val) => `(${val} - ${mean.toFixed(decimalPlaces)})^2`)
        .join(" + ")}) / ${numList.length} = ${variance.toFixed(decimalPlaces)}`
    );
    steps.push(`2. Std Dev = √${variance.toFixed(decimalPlaces)} = ${stdDev.toFixed(decimalPlaces)}`);

    const range = sortedList[sortedList.length - 1] - sortedList[0];
    steps.push(
      `Range: ${sortedList[sortedList.length - 1]} - ${sortedList[0]} = ${range.toFixed(decimalPlaces)}`
    );

    const stats = {
      count: numList.length,
      mean: mean.toFixed(decimalPlaces),
      median: median.toFixed(decimalPlaces),
      mode: mode === "No mode" ? mode : mode.join(", "),
      stdDev: stdDev.toFixed(decimalPlaces),
      range: range.toFixed(decimalPlaces),
    };

    // Advanced Stats
    if (analysisType === "advanced") {
      const min = sortedList[0];
      const max = sortedList[sortedList.length - 1];
      steps.push(`Min: ${min.toFixed(decimalPlaces)}`);
      steps.push(`Max: ${max.toFixed(decimalPlaces)}`);

      const q1 = sortedList[Math.floor(sortedList.length / 4)];
      const q3 = sortedList[Math.floor((sortedList.length * 3) / 4)];
      const iqr = q3 - q1;
      steps.push(`Q1 (25th percentile): ${q1.toFixed(decimalPlaces)}`);
      steps.push(`Q3 (75th percentile): ${q3.toFixed(decimalPlaces)}`);
      steps.push(`IQR: ${q3.toFixed(decimalPlaces)} - ${q1.toFixed(decimalPlaces)} = ${iqr.toFixed(decimalPlaces)}`);

      const skewness =
        (numList.reduce((sum, val) => sum + Math.pow(val - mean, 3), 0) / numList.length) /
        Math.pow(stdDev, 3);
      steps.push(`Skewness: [Σ(x - mean)³ / n] / stdDev³ = ${skewness.toFixed(decimalPlaces)}`);

      Object.assign(stats, {
        min: min.toFixed(decimalPlaces),
        max: max.toFixed(decimalPlaces),
        q1: q1.toFixed(decimalPlaces),
        q3: q3.toFixed(decimalPlaces),
        iqr: iqr.toFixed(decimalPlaces),
        skewness: skewness.toFixed(decimalPlaces),
      });
    }

    return { stats, steps };
  }, [data, decimalPlaces, analysisType]);

  // Handle input changes
  const handleDataChange = (e) => {
    const value = e.target.value;
    setData(value);
    setResult(null);
    setErrors((prev) => ({ ...prev, data: value ? "" : "Data is required" }));
  };

  // Input validation
  const isValid = useMemo(() => {
    const numList = data.split(",").map((item) => parseFloat(item.trim())).filter((num) => !isNaN(num));
    return numList.length > 0 && Object.values(errors).every((err) => !err);
  }, [data, errors]);

  // Analyze data
  const analyze = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide valid numerical data" });
      return;
    }

    const analysisResult = analyzeStats();
    if (analysisResult.error) {
      setErrors({ general: analysisResult.error });
    } else {
      setResult(analysisResult);
    }
  };

  // Reset state
  const reset = () => {
    setData("");
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setDecimalPlaces(2);
    setAnalysisType("basic");
  };

  // Download results as text
  const downloadResults = () => {
    if (!result) return;
    const content = [
      "Statistics Analysis Results",
      `Dataset: ${data}`,
      "",
      "Statistics:",
      ...Object.entries(result.stats).map(([key, value]) => `${key}: ${value}`),
      "",
      "Steps:",
      ...result.steps,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stats-analysis-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Statistics Analyzer
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Dataset (comma-separated):</label>
            <input
              type="text"
              value={data}
              onChange={handleDataChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., 1, 2, 3, 4, 5"
              aria-label="Dataset"
            />
            {errors.data && <p className="text-red-600 text-sm">{errors.data}</p>}
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
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Analysis Type
              </label>
              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Basic</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={analyze}
              disabled={!isValid}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Analyze
            </button>
            <button
              onClick={downloadResults}
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

        {/* General Error */}
        {errors.general && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 text-sm text-center">{errors.general}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Statistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {Object.entries(result.stats).map(([key, value]) => (
                <p key={key}>
                  <strong className="capitalize">{key.replace(/([A-Z])/g, " $1")}:</strong> {value}
                </p>
              ))}
            </div>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-4 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700">Calculation Steps</h3>
                <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                  {result.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Basic stats: Mean, Median, Mode, Std Dev, Range</li>
            <li>Advanced stats: Min, Max, Q1, Q3, IQR, Skewness</li>
            <li>Customizable decimal places</li>
            <li>Detailed calculation steps</li>
            <li>Download results as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatisticsAnalyzer;