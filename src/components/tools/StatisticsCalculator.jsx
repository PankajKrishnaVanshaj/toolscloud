"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaUpload, FaSync } from "react-icons/fa";

const StatisticsCalculator = () => {
  const [data, setData] = useState("");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState("");
  const [showSteps, setShowSteps] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const fileInputRef = React.useRef(null);

  // Calculate statistics from dataset
  const calculateStats = useCallback(
    (input) => {
      const steps = [];
      const numbers = input
        .split(",")
        .map((num) => parseFloat(num.trim()))
        .filter((num) => !isNaN(num));

      if (numbers.length === 0) {
        return { error: "Please enter a valid list of numbers (e.g., 1, 2, 3)" };
      }

      steps.push(`Dataset: ${numbers.join(", ")}`);

      // Mean
      const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
      steps.push(`Mean = (${numbers.join(" + ")}) / ${numbers.length} = ${mean.toFixed(decimalPlaces)}`);

      // Median
      const sorted = [...numbers].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      steps.push(`Median: Sorted = ${sorted.join(", ")}, Middle = ${median.toFixed(decimalPlaces)}`);

      // Mode
      const frequency = {};
      numbers.forEach((num) => {
        frequency[num] = (frequency[num] || 0) + 1;
      });
      let maxFreq = 0;
      let modes = [];
      for (const num in frequency) {
        if (frequency[num] > maxFreq) {
          maxFreq = frequency[num];
          modes = [parseFloat(num)];
        } else if (frequency[num] === maxFreq) {
          modes.push(parseFloat(num));
        }
      }
      const modeText = modes.length === numbers.length ? "No mode" : modes.join(", ");
      steps.push(`Mode: Frequencies = ${JSON.stringify(frequency)}, Mode(s) = ${modeText}`);

      // Variance (population)
      const variancePop =
        numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
      steps.push(`Population Variance = Σ(x - mean)² / n = ${variancePop.toFixed(decimalPlaces)}`);

      // Variance (sample)
      const varianceSample =
        numbers.length > 1
          ? numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / (numbers.length - 1)
          : 0;
      steps.push(`Sample Variance = Σ(x - mean)² / (n-1) = ${varianceSample.toFixed(decimalPlaces)}`);

      // Standard Deviation (population)
      const stdDevPop = Math.sqrt(variancePop);
      steps.push(`Population Std Dev = √(${variancePop.toFixed(decimalPlaces)}) = ${stdDevPop.toFixed(decimalPlaces)}`);

      // Standard Deviation (sample)
      const stdDevSample = Math.sqrt(varianceSample);
      steps.push(`Sample Std Dev = √(${varianceSample.toFixed(decimalPlaces)}) = ${stdDevSample.toFixed(decimalPlaces)}`);

      // Min and Max
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      steps.push(`Min = ${min.toFixed(decimalPlaces)}, Max = ${max.toFixed(decimalPlaces)}`);

      // Range
      const range = max - min;
      steps.push(`Range = Max - Min = ${range.toFixed(decimalPlaces)}`);

      // Midrange
      const midrange = (min + max) / 2;
      steps.push(`Midrange = (Min + Max) / 2 = ${midrange.toFixed(decimalPlaces)}`);

      // Quartiles
      const q1 = sorted[Math.floor(sorted.length / 4)];
      const q3 = sorted[Math.floor((sorted.length * 3) / 4)];
      const iqr = q3 - q1;
      steps.push(`Q1 = ${q1.toFixed(decimalPlaces)}, Q3 = ${q3.toFixed(decimalPlaces)}, IQR = ${iqr.toFixed(decimalPlaces)}`);

      return {
        mean: mean.toFixed(decimalPlaces),
        median: median.toFixed(decimalPlaces),
        mode: modeText,
        variancePop: variancePop.toFixed(decimalPlaces),
        varianceSample: varianceSample.toFixed(decimalPlaces),
        stdDevPop: stdDevPop.toFixed(decimalPlaces),
        stdDevSample: stdDevSample.toFixed(decimalPlaces),
        min: min.toFixed(decimalPlaces),
        max: max.toFixed(decimalPlaces),
        range: range.toFixed(decimalPlaces),
        midrange: midrange.toFixed(decimalPlaces),
        q1: q1.toFixed(decimalPlaces),
        q3: q3.toFixed(decimalPlaces),
        iqr: iqr.toFixed(decimalPlaces),
        steps,
      };
    },
    [decimalPlaces]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setData(value);
    setResult(null);

    if (value && !value.split(",").every((num) => !isNaN(parseFloat(num.trim())) || num.trim() === "")) {
      setErrors("Please enter comma-separated numbers (e.g., 1, 2, 3)");
    } else {
      setErrors("");
    }
  };

  // Validate input
  const isValid = useMemo(() => {
    return (
      data &&
      data.split(",").every((num) => !isNaN(parseFloat(num.trim())) && num.trim() !== "") &&
      !errors
    );
  }, [data, errors]);

  // Perform calculation
  const calculate = () => {
    setErrors("");
    setResult(null);

    if (!isValid) {
      setErrors("Please enter a valid list of numbers (e.g., 1, 2, 3)");
      return;
    }

    const calcResult = calculateStats(data);
    if (calcResult.error) {
      setErrors(calcResult.error);
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setData("");
    setErrors("");
    setResult(null);
    setShowSteps(false);
    setDecimalPlaces(2);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Import data from file
  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setData(event.target.result.trim());
        setResult(null);
      };
      reader.readAsText(file);
    }
  };

  // Export results as CSV
  const exportResults = () => {
    if (!result) return;
    const csvContent = [
      "Statistic,Value",
      `Mean,${result.mean}`,
      `Median,${result.median}`,
      `Mode,${result.mode}`,
      `Variance (Population),${result.variancePop}`,
      `Variance (Sample),${result.varianceSample}`,
      `Std Dev (Population),${result.stdDevPop}`,
      `Std Dev (Sample),${result.stdDevSample}`,
      `Min,${result.min}`,
      `Max,${result.max}`,
      `Range,${result.range}`,
      `Midrange,${result.midrange}`,
      `Q1,${result.q1}`,
      `Q3,${result.q3}`,
      `IQR,${result.iqr}`,
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stats-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Statistics Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="text"
                value={data}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1, 2, 3, 4"
                aria-label="Comma-separated numbers"
              />
              {errors && <p className="text-red-600 text-sm mt-1">{errors}</p>}
            </div>
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
          </div>

          {/* File Import */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Import Data (CSV/TXT)
            </label>
            <input
              type="file"
              accept=".csv,.txt"
              ref={fileInputRef}
              onChange={importData}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              disabled={!isValid}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              Calculate
            </button>
            <button
              onClick={exportResults}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Export
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p><strong>Mean:</strong> {result.mean}</p>
              <p><strong>Median:</strong> {result.median}</p>
              <p><strong>Mode:</strong> {result.mode}</p>
              <p><strong>Variance (Pop):</strong> {result.variancePop}</p>
              <p><strong>Variance (Sample):</strong> {result.varianceSample}</p>
              <p><strong>Std Dev (Pop):</strong> {result.stdDevPop}</p>
              <p><strong>Std Dev (Sample):</strong> {result.stdDevSample}</p>
              <p><strong>Min:</strong> {result.min}</p>
              <p><strong>Max:</strong> {result.max}</p>
              <p><strong>Range:</strong> {result.range}</p>
              <p><strong>Midrange:</strong> {result.midrange}</p>
              <p><strong>Q1:</strong> {result.q1}</p>
              <p><strong>Q3:</strong> {result.q3}</p>
              <p><strong>IQR:</strong> {result.iqr}</p>
            </div>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-4 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-4 text-sm list-disc list-inside bg-white p-4 rounded-md shadow-inner">
                {result.steps.map((step, i) => (
                  <li key={i} className="mb-1">{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculates mean, median, mode, variance, std dev, and more</li>
            <li>Adjustable decimal precision</li>
            <li>Import data from CSV/TXT files</li>
            <li>Export results as CSV</li>
            <li>Detailed calculation steps</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCalculator;