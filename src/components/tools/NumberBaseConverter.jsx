"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const NumberBaseConverter = () => {
  const [number, setNumber] = useState("");
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(2);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [customBaseFrom, setCustomBaseFrom] = useState("");
  const [customBaseTo, setCustomBaseTo] = useState("");
  const [history, setHistory] = useState([]);

  // Supported bases (including custom)
  const bases = [2, 8, 10, 16, "custom"];

  // Convert number between bases
  const convertBase = useCallback(() => {
    const steps = [`Converting ${number} from base ${fromBase} to base ${toBase}:`];
    const effectiveFromBase = fromBase === "custom" ? parseInt(customBaseFrom) : fromBase;
    const effectiveToBase = toBase === "custom" ? parseInt(customBaseTo) : toBase;

    // Validate input
    if (!number) return { error: "Please enter a number" };
    if (fromBase === "custom" && (!customBaseFrom || isNaN(customBaseFrom) || customBaseFrom < 2 || customBaseFrom > 36)) {
      return { error: "Custom 'From' base must be between 2 and 36" };
    }
    if (toBase === "custom" && (!customBaseTo || isNaN(customBaseTo) || customBaseTo < 2 || customBaseTo > 36)) {
      return { error: "Custom 'To' base must be between 2 and 36" };
    }

    // Validate input for source base
    const validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, effectiveFromBase).toLowerCase() + "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, effectiveFromBase);
    if (!number.split("").every((char) => validChars.includes(char))) {
      return { error: `Invalid input for base ${effectiveFromBase}. Use only: ${validChars}` };
    }

    // Convert to decimal
    const decimal = parseInt(number, effectiveFromBase);
    if (isNaN(decimal)) return { error: "Invalid number format" };

    steps.push(`Step 1: Convert ${number} (base ${effectiveFromBase}) to decimal (base 10):`);
    if (effectiveFromBase !== 10) {
      const digits = number.split("").reverse();
      let calc = "";
      digits.forEach((digit, i) => {
        const value = parseInt(digit, effectiveFromBase) * Math.pow(effectiveFromBase, i);
        calc += `${i > 0 ? " + " : ""}${digit} × ${effectiveFromBase}^${i} = ${value}`;
      });
      steps.push(`${calc} = ${decimal}`);
    } else {
      steps.push(`${number} is already in base 10: ${decimal}`);
    }

    // Convert from decimal to target base
    steps.push(`Step 2: Convert ${decimal} (base 10) to base ${effectiveToBase}:`);
    let converted;
    if (effectiveToBase === 10) {
      converted = decimal.toString();
      steps.push(`${decimal} is already in base 10: ${converted}`);
    } else {
      converted = decimal.toString(effectiveToBase).toUpperCase();
      let remainderSteps = [];
      let temp = decimal;
      while (temp > 0) {
        const remainder = temp % effectiveToBase;
        remainderSteps.push(`${temp} ÷ ${effectiveToBase} = ${Math.floor(temp / effectiveToBase)} remainder ${remainder}`);
        temp = Math.floor(temp / effectiveToBase);
      }
      remainderSteps.reverse();
      steps.push("Division method:");
      remainderSteps.forEach((step) => steps.push(step));
      steps.push(`Read remainders bottom-up: ${converted}`);
    }

    return { converted, steps };
  }, [number, fromBase, toBase, customBaseFrom, customBaseTo]);

  // Handle input changes
  const handleNumberChange = (e) => {
    const value = e.target.value.toUpperCase();
    setNumber(value);
    setResult(null);
    setErrors((prev) => ({ ...prev, number: value ? "" : "Number is required" }));
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    if (!number) return false;
    const effectiveFromBase = fromBase === "custom" ? parseInt(customBaseFrom) || 0 : fromBase;
    const validChars = new RegExp(`^[0-9A-Za-z]{0,${effectiveFromBase - 1}}$`);
    return (
      validChars.test(number) &&
      (fromBase !== "custom" || (customBaseFrom >= 2 && customBaseFrom <= 36)) &&
      (toBase !== "custom" || (customBaseTo >= 2 && customBaseTo <= 36))
    );
  }, [number, fromBase, toBase, customBaseFrom, customBaseTo]);

  // Perform conversion
  const convert = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide valid inputs for the selected bases" });
      return;
    }

    const convResult = convertBase();
    if (convResult.error) {
      setErrors({ general: convResult.error });
    } else {
      setResult(convResult);
      setHistory((prev) => [
        {
          number,
          fromBase: fromBase === "custom" ? customBaseFrom : fromBase,
          toBase: toBase === "custom" ? customBaseTo : toBase,
          result: convResult.converted,
          timestamp: new Date().toLocaleString(),
        },
        ...prev.slice(0, 9), // Keep last 10 conversions
      ]);
    }
  };

  // Reset state
  const reset = () => {
    setNumber("");
    setFromBase(10);
    setToBase(2);
    setCustomBaseFrom("");
    setCustomBaseTo("");
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setHistory([]);
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.converted);
      alert("Result copied to clipboard!");
    }
  };

  // Download history as text
  const downloadHistory = () => {
    if (history.length) {
      const text = history.map((entry) => `${entry.timestamp}: ${entry.number} (base ${entry.fromBase}) → ${entry.result} (base ${entry.toBase})`).join("\n");
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `conversion-history-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Number Base Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
            <input
              type="text"
              value={number}
              onChange={handleNumberChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder={`e.g., ${fromBase === 2 ? "1010" : fromBase === 8 ? "12" : fromBase === 10 ? "10" : fromBase === 16 ? "A" : "Enter number"}`}
            />
            {errors.number && <p className="text-red-600 text-sm mt-1">{errors.number}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Base</label>
              <select
                value={fromBase}
                onChange={(e) => setFromBase(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {bases.map((base) => (
                  <option key={base} value={base}>
                    {base === "custom" ? "Custom" : `Base ${base}`}
                  </option>
                ))}
              </select>
              {fromBase === "custom" && (
                <input
                  type="number"
                  value={customBaseFrom}
                  onChange={(e) => setCustomBaseFrom(e.target.value)}
                  min="2"
                  max="36"
                  className="w-full mt-2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 2-36"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Base</label>
              <select
                value={toBase}
                onChange={(e) => setToBase(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {bases.map((base) => (
                  <option key={base} value={base}>
                    {base === "custom" ? "Custom" : `Base ${base}`}
                  </option>
                ))}
              </select>
              {toBase === "custom" && (
                <input
                  type="number"
                  value={customBaseTo}
                  onChange={(e) => setCustomBaseTo(e.target.value)}
                  min="2"
                  max="36"
                  className="w-full mt-2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 2-36"
                />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={convert}
              disabled={!isValid}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Convert
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Error Display */}
          {errors.general && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-center">
              {errors.general}
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Result</h2>
              <div className="flex items-center gap-2">
                <p className="text-xl flex-1">{result.converted}</p>
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  title="Copy to clipboard"
                >
                  <FaCopy />
                </button>
              </div>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                {showSteps ? "Hide Steps" : "Show Steps"}
              </button>
              {showSteps && (
                <ul className="mt-2 text-sm list-disc list-inside">
                  {result.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Conversion History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-700">History</h3>
                <button
                  onClick={downloadHistory}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  title="Download history"
                >
                  <FaDownload />
                </button>
              </div>
              <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                {history.map((entry, i) => (
                  <li key={i} className="text-gray-600">
                    {entry.timestamp}: {entry.number} (base {entry.fromBase}) → {entry.result} (base {entry.toBase})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between bases 2, 8, 10, 16, and custom (2-36)</li>
            <li>Detailed step-by-step conversion process</li>
            <li>Conversion history tracking</li>
            <li>Copy result to clipboard</li>
            <li>Download history as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NumberBaseConverter;