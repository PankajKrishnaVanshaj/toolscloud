"use client";
import React, { useState, useCallback } from "react";
import { FaHistory, FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const LogarithmCalculator = () => {
  const [number, setNumber] = useState("");
  const [base, setBase] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState(6);
  const [isScientific, setIsScientific] = useState(false);

  // Calculate logarithm with detailed steps
  const calculateLogarithm = useCallback(
    (num, logBase) => {
      const steps = [];

      if (num <= 0) {
        return { error: "Logarithm argument must be positive" };
      }

      let finalResult;
      let baseDisplay;

      if (logBase === "e") {
        if (num === 1) {
          steps.push("ln(1) = 0 (since e⁰ = 1)");
          return { result: 0, steps };
        }
        finalResult = Math.log(num);
        baseDisplay = "e";
        steps.push(`ln(${num}) = log base e of ${num}`);
        steps.push(`Using natural logarithm: ${num} = eˣ`);
      } else if (logBase === "10") {
        if (num === 1) {
          steps.push("log₁₀(1) = 0 (since 10⁰ = 1)");
          return { result: 0, steps };
        }
        finalResult = Math.log10(num);
        baseDisplay = "10";
        steps.push(`log₁₀(${num}) = log base 10 of ${num}`);
        steps.push(`Using common logarithm: ${num} = 10ˣ`);
      } else if (logBase === "2") {
        if (num === 1) {
          steps.push("log₂(1) = 0 (since 2⁰ = 1)");
          return { result: 0, steps };
        }
        finalResult = Math.log2(num);
        baseDisplay = "2";
        steps.push(`log₂(${num}) = log base 2 of ${num}`);
        steps.push(`Using binary logarithm: ${num} = 2ˣ`);
      } else {
        const baseNum = parseFloat(logBase);
        if (isNaN(baseNum)) {
          return { error: "Invalid base value" };
        }
        if (baseNum <= 0 || baseNum === 1) {
          return { error: "Base must be positive and not equal to 1" };
        }
        if (num === 1) {
          steps.push(`log_${baseNum}(1) = 0 (since ${baseNum}⁰ = 1)`);
          return { result: 0, steps };
        }
        finalResult = Math.log(num) / Math.log(baseNum);
        baseDisplay = baseNum;
        steps.push(`log_${baseNum}(${num}) = log base ${baseNum} of ${num}`);
        steps.push(`Using change of base: log(${num}) / log(${baseNum})`);
      }

      finalResult = Number(finalResult.toFixed(precision));
      steps.push(`Result ≈ ${isScientific ? finalResult.toExponential() : finalResult}`);
      const simplified =
        finalResult === Math.round(finalResult) ? Math.round(finalResult) : null;

      return { result: finalResult, steps, simplified, baseDisplay };
    },
    [precision, isScientific]
  );

  const calculate = () => {
    setError("");
    setResult(null);

    const num = parseFloat(number);
    if (isNaN(num) || (base !== "e" && base !== "10" && base !== "2" && base === "")) {
      setError("Please enter valid numbers");
      return;
    }

    const calcResult = calculateLogarithm(num, base || "10");
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
    setHistory((prev) => [
      ...prev.slice(-9),
      {
        number: num,
        base: calcResult.baseDisplay,
        result: calcResult.result,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const reset = () => {
    setNumber("");
    setBase("");
    setResult(null);
    setError("");
    setShowSteps(false);
    setPrecision(6);
    setIsScientific(false);
  };

  const downloadHistory = () => {
    const text = history
      .map(
        (item) =>
          `log_${item.base}(${item.number}) = ${item.result} [${item.timestamp}]`
      )
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `logarithm_history_${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Logarithm Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
            <span className="text-xl text-center sm:col-span-1">log</span>
            <input
              type="text"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="sm:col-span-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
              placeholder="Base (e, 10, 2, or number)"
            />
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="sm:col-span-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
              placeholder="Number"
              step="any"
            />
          </div>

          {/* Quick Base Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            {["10", "e", "2"].map((b) => (
              <button
                key={b}
                onClick={() => setBase(b)}
                className={`px-3 py-1 rounded-lg ${
                  base === b
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                } transition-colors`}
              >
                {b === "10" ? "log₁₀" : b === "e" ? "ln" : "log₂"}
              </button>
            ))}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision ({precision} digits)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={precision}
                onChange={(e) => setPrecision(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isScientific}
                  onChange={(e) => setIsScientific(e.target.checked)}
                  className="mr-2 accent-purple-500"
                />
                <span className="text-sm text-gray-700">Scientific Notation</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all font-semibold flex items-center justify-center"
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
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              Result:
            </h2>
            <div className="mt-2 space-y-2 text-center">
              <p className="text-xl">
                log<sub>{result.baseDisplay}</sub>({number}) ={" "}
                {isScientific ? result.result.toExponential() : result.result}
                {result.simplified && ` ≈ ${result.simplified}`}
              </p>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-sm text-purple-600 hover:underline"
              >
                {showSteps ? "Hide Steps" : "Show Steps"}
              </button>
              {showSteps && (
                <div className="text-sm text-left">
                  <p className="font-medium">Calculation Steps:</p>
                  <ul className="list-disc list-inside mt-1">
                    {result.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-700">
                History ({history.length}/10):
              </h3>
              <button
                onClick={downloadHistory}
                className="text-sm text-purple-600 hover:underline flex items-center"
              >
                <FaDownload className="mr-1" /> Export
              </button>
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((item, index) => (
                <li
                  key={index}
                  className="text-sm bg-gray-50 p-2 rounded flex justify-between"
                >
                  <span>
                    log<sub>{item.base}</sub>({item.number}) = {item.result}
                  </span>
                  <span className="text-gray-500 text-xs">{item.timestamp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports ln, log₁₀, log₂, and custom bases</li>
            <li>Adjustable precision (1-10 digits)</li>
            <li>Scientific notation option</li>
            <li>Detailed calculation steps</li>
            <li>History with export functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LogarithmCalculator;