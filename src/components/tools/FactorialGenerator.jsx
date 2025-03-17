"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaCopy, FaDownload } from "react-icons/fa";

const FactorialGenerator = () => {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [calculationMode, setCalculationMode] = useState("decimal"); // New feature: mode selection
  const [history, setHistory] = useState([]); // New feature: calculation history

  // Calculate factorial with different modes
  const calculateFactorial = useCallback(
    (n) => {
      const steps = [`Calculating factorial of ${n}:`];
      if (isNaN(n) || n < 0 || !Number.isInteger(n)) {
        return { error: "Please enter a non-negative integer" };
      }

      const maxLimit = calculationMode === "decimal" ? 100 : 20; // Adjust limit for binary/hex
      if (n > maxLimit) {
        return { error: `Number too large (max ${maxLimit} for ${calculationMode})` };
      }

      let factorial = 1n;
      steps.push(`${n}! = ${n === 0 ? "1 (by definition)" : `${n} × ${n - 1} × ... × 1`}`);

      if (n === 0) {
        return { factorial: "1", steps };
      }

      const breakdown = [];
      for (let i = n; i >= 1; i--) {
        factorial *= BigInt(i);
        breakdown.push(i);
        if (breakdown.length <= 5 || i === 1) {
          steps.push(`Step: ${breakdown.join(" × ")} = ${factorial.toString()}`);
        }
      }
      if (n > 5) steps.splice(2, n - 5, "...");

      let resultValue;
      switch (calculationMode) {
        case "binary":
          resultValue = factorial.toString(2);
          steps.push(`Converted to binary: ${resultValue}`);
          break;
        case "hex":
          resultValue = factorial.toString(16).toUpperCase();
          steps.push(`Converted to hexadecimal: ${resultValue}`);
          break;
        default:
          resultValue = factorial.toString();
      }

      return { factorial: resultValue, steps };
    },
    [calculationMode]
  );

  // Handle input change with validation
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNumber(value);
    setResult(null);

    if (value === "") {
      setErrors((prev) => ({ ...prev, number: "Number is required" }));
    } else if (isNaN(parseInt(value)) || parseInt(value) < 0 || !Number.isInteger(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, number: "Must be a non-negative integer" }));
    } else if (parseInt(value) > (calculationMode === "decimal" ? 100 : 20)) {
      setErrors((prev) => ({ ...prev, number: `Max value is ${calculationMode === "decimal" ? 100 : 20}` }));
    } else {
      setErrors((prev) => ({ ...prev, number: "" }));
    }
  };

  // Check if input is valid
  const isValid = useMemo(() => {
    const maxLimit = calculationMode === "decimal" ? 100 : 20;
    return (
      number !== "" &&
      !isNaN(parseInt(number)) &&
      parseInt(number) >= 0 &&
      Number.isInteger(parseFloat(number)) &&
      parseInt(number) <= maxLimit &&
      !errors.number
    );
  }, [number, errors, calculationMode]);

  // Generate factorial
  const generate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: `Please provide a valid non-negative integer (max ${calculationMode === "decimal" ? 100 : 20})`,
      }));
      return;
    }

    const calcResult = calculateFactorial(parseInt(number));
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
      setHistory((prev) => [
        { number, result: calcResult.factorial, mode: calculationMode, timestamp: Date.now() },
        ...prev.slice(0, 9), // Keep last 10 entries
      ]);
    }
  };

  // Reset state
  const reset = () => {
    setNumber("");
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setHistory([]);
    setCalculationMode("decimal");
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.factorial);
      alert("Result copied to clipboard!");
    }
  };

  // Download result as text file
  const downloadResult = () => {
    if (result) {
      const blob = new Blob(
        [`${number}! = ${result.factorial}\n\nSteps:\n${result.steps.join("\n")}`],
        { type: "text/plain" }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `factorial-${number}-${calculationMode}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Factorial Generator
        </h1>

        {/* Input and Settings */}
        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input
                type="number"
                step="1"
                value={number}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5"
                aria-label="Number to calculate factorial"
              />
              {errors.number && <p className="text-red-600 text-sm mt-1">{errors.number}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Output Mode</label>
              <select
                value={calculationMode}
                onChange={(e) => setCalculationMode(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="decimal">Decimal</option>
                <option value="binary">Binary</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          {result && (
            <>
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center"
              >
                <FaCopy className="mr-2" /> Copy
              </button>
              <button
                onClick={downloadResult}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <p className="text-center text-xl break-all">
              {number}! = {result.factorial} {calculationMode !== "decimal" && `(${calculationMode})`}
            </p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside transition-opacity">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Calculation History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Calculation History</h3>
            <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
              {history.map((entry, index) => (
                <li key={index}>
                  {entry.number}! = {entry.result} ({entry.mode}) -{" "}
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate factorials in decimal, binary, or hexadecimal</li>
            <li>Detailed step-by-step breakdown</li>
            <li>Copy result to clipboard</li>
            <li>Download result as text file</li>
            <li>Calculation history (last 10 entries)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FactorialGenerator;