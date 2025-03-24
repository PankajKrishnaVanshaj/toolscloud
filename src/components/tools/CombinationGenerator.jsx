"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaSync, FaCog } from "react-icons/fa";

const CombinationGenerator = () => {
  const [items, setItems] = useState("");
  const [k, setK] = useState("");
  const [count, setCount] = useState("all");
  const [numCombs, setNumCombs] = useState("");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [uniqueOnly, setUniqueOnly] = useState(false); // New: Remove duplicates from input
  const [sortOutput, setSortOutput] = useState(false); // New: Sort combinations
  const [outputFormat, setOutputFormat] = useState("comma"); // New: Output separator

  // Generate combinations
  const generateCombinations = useCallback((arr, k) => {
    const result = [];
    const combine = (start, current) => {
      if (current.length === k) {
        result.push([...current]);
        return;
      }
      for (let i = start; i < arr.length; i++) {
        current.push(arr[i]);
        combine(i + 1, current);
        current.pop();
      }
    };
    combine(0, []);
    return result;
  }, []);

  // Calculate binomial coefficient (nCk)
  const binomialCoefficient = (n, k) => {
    if (k > n) return 0;
    let res = 1;
    for (let i = 0; i < k; i++) {
      res *= (n - i) / (i + 1);
    }
    return Math.round(res);
  };

  // Main generation logic
  const generate = useCallback(() => {
    const steps = ["Generating combinations:"];
    let itemList = items.split(",").map((item) => item.trim()).filter((item) => item !== "");
    
    if (uniqueOnly) {
      itemList = [...new Set(itemList)]; // Remove duplicates
      steps.push("Removed duplicates from input");
    }
    
    const kVal = parseInt(k);

    if (itemList.length === 0) {
      return { error: "Please enter at least one item" };
    }
    if (isNaN(kVal) || kVal <= 0 || kVal > itemList.length) {
      return { error: `k must be a positive integer between 1 and ${itemList.length}` };
    }

    let combinations = generateCombinations(itemList, kVal);
    const totalPossible = binomialCoefficient(itemList.length, kVal);
    steps.push(`Generating combinations of ${kVal} items from ${itemList.length} items`);
    steps.push(`Total possible: C(${itemList.length}, ${kVal}) = ${totalPossible}`);

    if (sortOutput) {
      combinations = combinations.sort((a, b) => a.join().localeCompare(b.join()));
      steps.push("Sorted combinations alphabetically");
    }

    const exampleCount = Math.min(3, combinations.length);
    for (let i = 0; i < exampleCount; i++) {
      steps.push(`Combination ${i + 1}: ${combinations[i].join(", ")}`);
    }
    if (combinations.length > exampleCount) {
      steps.push(`...and ${combinations.length - exampleCount} more`);
    }

    const finalCombinations = count === "all" ? combinations : combinations.slice(0, parseInt(numCombs));
    return { combinations: finalCombinations, steps };
  }, [items, k, count, numCombs, uniqueOnly, sortOutput]);

  // Input handlers
  const handleItemsChange = (e) => {
    const value = e.target.value;
    setItems(value);
    setResult(null);
    setErrors((prev) => ({ ...prev, items: value ? "" : "Items are required" }));
  };

  const handleKChange = (e) => {
    const value = e.target.value;
    setK(value);
    setResult(null);
    const itemList = items.split(",").map((item) => item.trim()).filter((item) => item !== "");
    if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0 || parseInt(value) > itemList.length)) {
      setErrors((prev) => ({ ...prev, k: `Must be between 1 and ${itemList.length}` }));
    } else {
      setErrors((prev) => ({ ...prev, k: "" }));
    }
  };

  const handleNumCombsChange = (e) => {
    const value = e.target.value;
    setNumCombs(value);
    setResult(null);
    if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0)) {
      setErrors((prev) => ({ ...prev, numCombs: "Must be a positive integer" }));
    } else {
      setErrors((prev) => ({ ...prev, numCombs: "" }));
    }
  };

  // Validation
  const isValid = useMemo(() => {
    const itemList = items.split(",").map((item) => item.trim()).filter((item) => item !== "");
    if (itemList.length === 0) return false;

    const kVal = parseInt(k);
    if (isNaN(kVal) || kVal <= 0 || kVal > itemList.length) return false;

    if (count === "specific") {
      return (
        numCombs &&
        !isNaN(parseInt(numCombs)) &&
        parseInt(numCombs) > 0 &&
        Object.values(errors).every((err) => !err)
      );
    }
    return Object.values(errors).every((err) => !err);
  }, [items, k, count, numCombs, errors]);

  // Generate combinations
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({ ...prev, general: "Please provide valid inputs" }));
      return;
    }

    const genResult = generate();
    if (genResult.error) {
      setErrors({ general: genResult.error });
    } else {
      setResult(genResult);
    }
  };

  // Reset
  const reset = () => {
    setItems("");
    setK("");
    setCount("all");
    setNumCombs("");
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setUniqueOnly(false);
    setSortOutput(false);
    setOutputFormat("comma");
  };

  // Download as text file
  const downloadResult = () => {
    if (!result) return;
    const separator = outputFormat === "comma" ? ", " : outputFormat === "newline" ? "\n" : " | ";
    const text = result.combinations.map((comb) => comb.join(separator)).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `combinations-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Combination Generator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Items (comma-separated)
            </label>
            <input
              type="text"
              value={items}
              onChange={handleItemsChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1, 2, 3 or A, B, C"
            />
            {errors.items && <p className="text-red-600 text-sm mt-1">{errors.items}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choose (k)
              </label>
              <input
                type="number"
                step="1"
                value={k}
                onChange={handleKChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2"
              />
              {errors.k && <p className="text-red-600 text-sm mt-1">{errors.k}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCount("all")}
                  className={`flex-1 p-2 rounded-md transition-colors ${
                    count === "all" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setCount("specific")}
                  className={`flex-1 p-2 rounded-md transition-colors ${
                    count === "specific" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Specific
                </button>
              </div>
            </div>
          </div>

          {count === "specific" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Combinations
              </label>
              <input
                type="number"
                step="1"
                value={numCombs}
                onChange={handleNumCombsChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3"
              />
              {errors.numCombs && <p className="text-red-600 text-sm mt-1">{errors.numCombs}</p>}
            </div>
          )}

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaCog className="mr-2" /> Advanced Options
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={uniqueOnly}
                  onChange={(e) => setUniqueOnly(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-600">Unique Items Only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sortOutput}
                  onChange={(e) => setSortOutput(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-600">Sort Output</span>
              </label>
              <div>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="comma">Comma (,)</option>
                  <option value="newline">New Line</option>
                  <option value="pipe">Pipe (|)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
          >
            Generate
          </button>
          <button
            onClick={downloadResult}
            disabled={!result}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
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

        {/* Errors */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Combinations:</h2>
            <ul className="text-sm space-y-1 max-h-60 overflow-y-auto">
              {result.combinations.map((comb, i) => (
                <li key={i} className="text-gray-600">
                  {comb.join(outputFormat === "comma" ? ", " : outputFormat === "newline" ? " " : " | ")}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-gray-600">Total: {result.combinations.length}</p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
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
            <li>Generate combinations of k items from a list</li>
            <li>Option for all or specific number of combinations</li>
            <li>Remove duplicates, sort output, custom separators</li>
            <li>Download results as text file</li>
            <li>Detailed generation steps</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CombinationGenerator;