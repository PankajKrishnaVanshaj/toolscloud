"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaHistory, FaDownload } from "react-icons/fa";

const RootCalculator = () => {
  const [number, setNumber] = useState("");
  const [root, setRoot] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState(6);
  const [showHistory, setShowHistory] = useState(false);

  // Calculate nth root with detailed steps
  const calculateRoot = useCallback(
    (num, n) => {
      const steps = [];

      // Handle special cases
      if (n === 0) {
        return { error: "Root index cannot be zero" };
      }
      if (num === 0) {
        steps.push("Any root of 0 is 0");
        return { result: 0, steps };
      }
      if (n < 0) {
        return { error: "Negative root index is not supported" };
      }
      if (num < 0 && n % 2 === 0) {
        return { error: "Even root of negative number is not real" };
      }

      // Calculate result
      const absNum = Math.abs(num);
      const rootResult = Math.pow(absNum, 1 / n);
      let finalResult = num < 0 && n % 2 === 1 ? -rootResult : rootResult;

      steps.push(`Calculate ${n}th root of ${absNum}`);
      steps.push(`${n}th root = ${absNum}^(1/${n})`);
      if (num < 0 && n % 2 === 1) {
        steps.push("Apply negative sign due to odd root of negative number");
      }

      finalResult = Number(finalResult.toFixed(precision));
      const simplified = finalResult === Math.round(finalResult) ? Math.round(finalResult) : null;

      return { result: finalResult, steps, simplified };
    },
    [precision]
  );

  const calculate = () => {
    setError("");
    setResult(null);

    const num = parseFloat(number);
    const n = parseInt(root);

    if (isNaN(num) || isNaN(n)) {
      setError("Please enter valid numbers");
      return;
    }

    const calcResult = calculateRoot(num, n);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
    setHistory((prev) => [
      ...prev.slice(-9),
      { number: num, root: n, result: calcResult.result, timestamp: new Date().toLocaleString() },
    ]);
  };

  const reset = () => {
    setNumber("");
    setRoot("");
    setResult(null);
    setError("");
    setShowSteps(false);
    setPrecision(6);
    setShowHistory(false);
  };

  const downloadResult = () => {
    if (!result) return;
    const text = [
      `Root Calculation Result`,
      `Number: ${number}`,
      `Root Index: ${root}`,
      `Result: ${result.result}${result.simplified ? ` (${result.simplified})` : ""}`,
      `\nSteps:`,
      ...result.steps.map((step) => `- ${step}`),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `root-calculation-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Root Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
            <span className="text-2xl text-center sm:col-span-1">√</span>
            <input
              type="number"
              value={root}
              onChange={(e) => setRoot(e.target.value)}
              className="sm:col-span-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              placeholder="Root (n)"
            />
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="sm:col-span-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              placeholder="Number"
            />
          </div>

          {/* Precision Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precision (decimal places: {precision})
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            {result && (
              <button
                onClick={downloadResult}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            )}
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
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <div className="mt-2 space-y-3 text-center">
              <p className="text-xl sm:text-2xl">
                {root}√{number} = {result.result}
                {result.simplified && (
                  <span className="text-green-600"> ≈ {result.simplified}</span>
                )}
              </p>

              {/* Steps Toggle */}
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showSteps ? "Hide Steps" : "Show Steps"}
              </button>

              {showSteps && (
                <div className="text-sm text-left bg-white p-3 rounded-lg shadow-inner">
                  <p className="font-semibold">Calculation Steps:</p>
                  <ul className="list-decimal list-inside mt-1">
                    {result.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                    <li>Final result (rounded to {precision} decimals): {result.result}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-700">History</h3>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                <FaHistory className="mr-1" />
                {showHistory ? "Hide" : "Show"}
              </button>
            </div>
            {showHistory && (
              <ul className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {history.slice().reverse().map((item, index) => (
                  <li
                    key={index}
                    className="text-sm bg-gray-50 p-3 rounded-lg flex justify-between items-center"
                  >
                    <span>
                      {item.root}√{item.number} = {item.result}
                    </span>
                    <span className="text-xs text-gray-500">{item.timestamp}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate any nth root of a number</li>
            <li>Adjustable precision (0-10 decimal places)</li>
            <li>Step-by-step calculation breakdown</li>
            <li>History tracking with timestamps</li>
            <li>Download results as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RootCalculator;