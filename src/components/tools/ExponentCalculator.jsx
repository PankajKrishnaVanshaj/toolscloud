"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaHistory, FaDownload } from "react-icons/fa";

const ExponentCalculator = () => {
  const [base, setBase] = useState("");
  const [exponent, setExponent] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState(6);
  const [baseType, setBaseType] = useState("decimal"); // decimal, binary, hex
  const [showHistory, setShowHistory] = useState(false);

  // Calculate exponentiation with detailed steps
  const calculateExponent = useCallback(
    (baseNum, expStr) => {
      const steps = [];

      // Convert base based on type
      let parsedBase;
      try {
        if (baseType === "binary") parsedBase = parseInt(baseNum, 2);
        else if (baseType === "hex") parsedBase = parseInt(baseNum, 16);
        else parsedBase = parseFloat(baseNum);
      } catch {
        return { error: `Invalid ${baseType} base number` };
      }

      if (isNaN(parsedBase)) {
        return { error: `Invalid ${baseType} base number` };
      }

      // Handle special cases
      if (parsedBase === 0 && parseFloat(expStr) <= 0) {
        return { error: "0 raised to 0 or negative power is undefined" };
      }

      // Parse exponent (integer or fractional)
      let numerator, denominator;
      if (expStr.includes("/")) {
        const [num, den] = expStr.split("/").map(Number);
        numerator = num;
        denominator = den;
        if (isNaN(numerator) || isNaN(denominator)) {
          return { error: "Invalid fractional exponent format" };
        }
        if (denominator === 0) {
          return { error: "Denominator cannot be zero in fractional exponent" };
        }
      } else {
        numerator = parseFloat(expStr);
        denominator = 1;
        if (isNaN(numerator)) {
          return { error: "Invalid exponent value" };
        }
      }

      // Calculate result
      let finalResult;
      const isNegative = numerator < 0;
      const absNumerator = Math.abs(numerator);

      if (denominator === 1) {
        finalResult = Math.pow(parsedBase, absNumerator);
        steps.push(`${parsedBase} × ${parsedBase} repeated ${absNumerator} times`);
        if (isNegative) {
          finalResult = 1 / finalResult;
          steps.push(`1 / ${parsedBase}^${absNumerator} (negative exponent)`);
        }
      } else {
        if (parsedBase < 0 && denominator % 2 === 0) {
          return { error: "Even root of negative number is not real" };
        }
        finalResult = Math.pow(Math.abs(parsedBase), absNumerator / denominator);
        if (parsedBase < 0 && denominator % 2 === 1) {
          finalResult = -finalResult;
        }
        steps.push(`${denominator}th root of ${parsedBase}^${absNumerator}`);
        if (isNegative) {
          finalResult = 1 / finalResult;
          steps.push(`1 / result (negative exponent)`);
        }
      }

      const roundedResult = Number(finalResult.toFixed(precision));
      return {
        result: roundedResult,
        steps,
        simplified: roundedResult === Math.round(finalResult) ? Math.round(finalResult) : null,
      };
    },
    [baseType, precision]
  );

  const calculate = () => {
    setError("");
    setResult(null);

    if (!base || !exponent) {
      setError("Please enter both base and exponent");
      return;
    }

    const calcResult = calculateExponent(base, exponent);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
    setHistory((prev) => [
      ...prev.slice(-9), // Keep last 10 entries
      { base, exponent, result: calcResult.result, baseType },
    ]);
  };

  const reset = () => {
    setBase("");
    setExponent("");
    setResult(null);
    setError("");
    setShowSteps(false);
    setPrecision(6);
    setBaseType("decimal");
    setShowHistory(false);
  };

  const downloadHistory = () => {
    const historyText = history
      .map((item) => `${item.base}^${item.exponent} = ${item.result} (${item.baseType})`)
      .join("\n");
    const blob = new Blob([historyText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `exponent_history_${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Exponent Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
            <input
              type="text"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="sm:col-span-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
              placeholder={`Base (${baseType})`}
            />
            <span className="text-2xl text-center sm:col-span-1">^</span>
            <input
              type="text"
              value={exponent}
              onChange={(e) => setExponent(e.target.value)}
              className="sm:col-span-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
              placeholder="Exponent (e.g., 2 or 1/2)"
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Type
              </label>
              <select
                value={baseType}
                onChange={(e) => setBaseType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="decimal">Decimal</option>
                <option value="binary">Binary</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision ({precision} decimals)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={precision}
                onChange={(e) => setPrecision(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <div className="mt-2 space-y-2 text-center">
              <p className="text-xl">
                {base}^{exponent} = {result.result}
                {result.simplified && ` ≈ ${result.simplified}`}
              </p>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-sm text-green-600 hover:underline"
              >
                {showSteps ? "Hide Steps" : "Show Steps"}
              </button>
              {showSteps && (
                <div className="text-sm text-left">
                  <p>Calculation Steps:</p>
                  <ul className="list-decimal list-inside">
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
              <h3 className="text-lg font-semibold text-gray-700">History:</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm text-green-600 hover:underline flex items-center"
                >
                  <FaHistory className="mr-1" />
                  {showHistory ? "Hide" : "Show"}
                </button>
                <button
                  onClick={downloadHistory}
                  className="text-sm text-green-600 hover:underline flex items-center"
                >
                  <FaDownload className="mr-1" /> Download
                </button>
              </div>
            </div>
            {showHistory && (
              <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {history.map((item, index) => (
                  <li key={index} className="text-sm bg-gray-50 p-2 rounded">
                    {item.base}^{item.exponent} = {item.result} ({item.baseType})
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
            <li>Supports integer and fractional exponents</li>
            <li>Base input in decimal, binary, or hexadecimal</li>
            <li>Adjustable precision (0-10 decimals)</li>
            <li>Detailed calculation steps</li>
            <li>History with download option</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExponentCalculator;