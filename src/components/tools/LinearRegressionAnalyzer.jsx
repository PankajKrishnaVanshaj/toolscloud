"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaSync, FaChartLine } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading results

const LinearRegressionAnalyzer = () => {
  const [data, setData] = useState("");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95); // For confidence intervals
  const resultRef = React.useRef(null);

  // Perform linear regression with additional statistics
  const performLinearRegression = useCallback(() => {
    const steps = ["Performing linear regression:"];
    const pairs = data
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "")
      .map((item, index, arr) =>
        index % 2 === 0 && index + 1 < arr.length
          ? [parseFloat(item), parseFloat(arr[index + 1])]
          : null
      )
      .filter((item) => item !== null && !isNaN(item[0]) && !isNaN(item[1]));

    if (pairs.length < 2) {
      return { error: "At least two valid x,y pairs are required (e.g., '1,2, 3,4')" };
    }

    steps.push(`Data points: ${pairs.map((p) => `(${p[0]}, ${p[1]})`).join(", ")}`);

    // Calculate sums
    const n = pairs.length;
    const sumX = pairs.reduce((sum, [x]) => sum + x, 0);
    const sumY = pairs.reduce((sum, [, y]) => sum + y, 0);
    const sumXY = pairs.reduce((sum, [x, y]) => sum + x * y, 0);
    const sumX2 = pairs.reduce((sum, [x]) => sum + x * x, 0);
    const sumY2 = pairs.reduce((sum, [, y]) => sum + y * y, 0);

    steps.push(`n = ${n}, Σx = ${sumX.toFixed(2)}, Σy = ${sumY.toFixed(2)}`);
    steps.push(`Σxy = ${sumXY.toFixed(2)}, Σx² = ${sumX2.toFixed(2)}, Σy² = ${sumY2.toFixed(2)}`);

    // Slope (m) and intercept (b)
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    steps.push(`Slope (m) = (${n} * ${sumXY.toFixed(2)} - ${sumX.toFixed(2)} * ${sumY.toFixed(2)}) / (${n} * ${sumX2.toFixed(2)} - (${sumX.toFixed(2)})²) = ${m.toFixed(4)}`);
    steps.push(`Intercept (b) = (${sumY.toFixed(2)} - ${m.toFixed(4)} * ${sumX.toFixed(2)}) / ${n} = ${b.toFixed(4)}`);

    // Calculate R² and additional stats
    const meanX = sumX / n;
    const meanY = sumY / n;
    const ssTot = pairs.reduce((sum, [, y]) => sum + (y - meanY) ** 2, 0);
    const ssRes = pairs.reduce((sum, [x, y]) => sum + (y - (m * x + b)) ** 2, 0);
    const rSquared = 1 - ssRes / ssTot;

    // Standard error and confidence intervals
    const se = Math.sqrt(ssRes / (n - 2));
    const tValue = 1.96; // Approximation for 95% confidence, adjust based on n for accuracy
    const seM = se / Math.sqrt(sumX2 - (sumX * sumX) / n);
    const seB = se * Math.sqrt(sumX2 / (n * sumX2 - sumX * sumX));
    const ciM = tValue * seM;
    const ciB = tValue * seB;

    steps.push(`R² = 1 - ${ssRes.toFixed(2)} / ${ssTot.toFixed(2)} = ${rSquared.toFixed(4)}`);
    steps.push(`Standard Error = √(${ssRes.toFixed(2)} / ${n - 2}) = ${se.toFixed(4)}`);
    steps.push(`Confidence Interval for m: ${m.toFixed(4)} ± ${ciM.toFixed(4)}`);
    steps.push(`Confidence Interval for b: ${b.toFixed(4)} ± ${ciB.toFixed(4)}`);

    return {
      slope: m.toFixed(4),
      intercept: b.toFixed(4),
      rSquared: rSquared.toFixed(4),
      standardError: se.toFixed(4),
      confidenceIntervals: {
        slope: [parseFloat(m - ciM).toFixed(4), parseFloat(m + ciM).toFixed(4)],
        intercept: [parseFloat(b - ciB).toFixed(4), parseFloat(b + ciB).toFixed(4)],
      },
      steps,
      dataPoints: pairs,
    };
  }, [data]);

  // Handle input changes
  const handleDataChange = (e) => {
    const value = e.target.value;
    setData(value);
    setResult(null);
    validateInput(value);
  };

  // Validate input
  const validateInput = (value) => {
    const pairs = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "")
      .map((item, index, arr) =>
        index % 2 === 0 && index + 1 < arr.length ? [parseFloat(item), parseFloat(arr[index + 1])] : null
      )
      .filter((item) => item !== null);

    if (!value) {
      setErrors((prev) => ({ ...prev, data: "Data points are required" }));
    } else if (pairs.some((p) => p === null || isNaN(p[0]) || isNaN(p[1]))) {
      setErrors((prev) => ({ ...prev, data: "Invalid format (use e.g., '1,2, 3,4')" }));
    } else {
      setErrors((prev) => ({ ...prev, data: "" }));
    }
  };

  // Check if input is valid
  const isValid = useMemo(() => {
    const pairs = data
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "")
      .map((item, index, arr) =>
        index % 2 === 0 && index + 1 < arr.length ? [parseFloat(item), parseFloat(arr[index + 1])] : null
      )
      .filter((item) => item !== null);
    return pairs.length >= 2 && pairs.every((p) => !isNaN(p[0]) && !isNaN(p[1])) && !errors.data;
  }, [data, errors]);

  // Analyze data
  const analyze = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide valid data points (at least 2 pairs)" });
      return;
    }

    const regResult = performLinearRegression();
    if (regResult.error) {
      setErrors({ general: regResult.error });
    } else {
      setResult(regResult);
    }
  };

  // Reset state
  const reset = () => {
    setData("");
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setConfidenceLevel(0.95);
  };

  // Download results
  const downloadResults = () => {
    if (resultRef.current) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `linear-regression-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Linear Regression Analyzer
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Points (x,y pairs)
            </label>
            <input
              type="text"
              value={data}
              onChange={handleDataChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1,2, 3,4, 5,6"
              aria-label="Data points (x,y pairs)"
            />
            {errors.data && <p className="text-red-600 text-sm mt-1">{errors.data}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Enter comma-separated x,y pairs (e.g., "1,2, 3,4")
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confidence Level
            </label>
            <select
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(parseFloat(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={0.90}>90%</option>
              <option value={0.95}>95%</option>
              <option value={0.99}>99%</option>
            </select>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={analyze}
              disabled={!isValid}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaChartLine className="mr-2" /> Analyze
            </button>
            <button
              onClick={downloadResults}
              disabled={!result}
              className="flex-1 py-2 assistpx-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div ref={resultRef} className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Results</h2>
            <p className="text-sm">
              <strong>Regression Line:</strong> y = {result.slope}x + {result.intercept}
            </p>
            <p className="text-sm">
              <strong>R²:</strong> {result.rSquared}
            </p>
            <p className="text-sm">
              <strong>Standard Error:</strong> {result.standardError}
            </p>
            <p className="text-sm">
              <strong>{confidenceLevel * 100}% CI for Slope:</strong> [{result.confidenceIntervals.slope[0]}, {result.confidenceIntervals.slope[1]}]
            </p>
            <p className="text-sm">
              <strong>{confidenceLevel * 100}% CI for Intercept:</strong> [{result.confidenceIntervals.intercept[0]}, {result.confidenceIntervals.intercept[1]}]
            </p>

            <button
              onClick={() => setShowSteps(!showSteps)}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside max-h-48 overflow-y-auto">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Least squares linear regression</li>
            <li>R² coefficient of determination</li>
            <li>Standard error calculation</li>
            <li>Configurable confidence intervals</li>
            <li>Detailed step-by-step breakdown</li>
            <li>Download results as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LinearRegressionAnalyzer;