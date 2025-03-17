"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaSync, FaCopy } from "react-icons/fa";

const PermutationGenerator = () => {
  const [items, setItems] = useState("");
  const [count, setCount] = useState("all");
  const [numPerms, setNumPerms] = useState("");
  const [allowRepetition, setAllowRepetition] = useState(false);
  const [separator, setSeparator] = useState(",");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [format, setFormat] = useState("list"); // List or CSV

  // Generate permutations without repetition
  const generatePermutationsNoRep = (arr) => {
    const result = [];
    const used = new Array(arr.length).fill(false);

    const permute = (current) => {
      if (current.length === arr.length) {
        result.push([...current]);
        return;
      }
      for (let i = 0; i < arr.length; i++) {
        if (!used[i]) {
          used[i] = true;
          current.push(arr[i]);
          permute(current);
          current.pop();
          used[i] = false;
        }
      }
    };

    permute([]);
    return result;
  };

  // Generate permutations with repetition
  const generatePermutationsWithRep = (arr, n) => {
    const result = [];
    const permute = (current) => {
      if (current.length === n) {
        result.push([...current]);
        return;
      }
      for (let i = 0; i < arr.length; i++) {
        current.push(arr[i]);
        permute(current);
        current.pop();
      }
    };

    permute([]);
    return result;
  };

  // Main generation logic
  const generatePermutations = useCallback(() => {
    const steps = ["Generating permutations:"];
    const itemList = items
      .split(separator)
      .map((item) => item.trim())
      .filter((item) => item !== "");

    if (itemList.length === 0) {
      return { error: "Please enter at least one item" };
    }

    let permutations;
    if (allowRepetition) {
      const n = count === "all" ? itemList.length : parseInt(numPerms);
      if (isNaN(n) || n <= 0) {
        return { error: "Number of items in each permutation must be a positive integer" };
      }
      permutations = generatePermutationsWithRep(itemList, n);
      steps.push(
        `Generating all possible permutations with repetition for ${n} positions from ${itemList.length} items`
      );
      steps.push(`Total possible: ${itemList.length}^${n} = ${Math.pow(itemList.length, n)}`);
    } else {
      permutations = generatePermutationsNoRep(itemList);
      steps.push(`Generating all permutations without repetition of ${itemList.length} items`);
      steps.push(`Total possible: ${itemList.length}! = ${factorial(itemList.length)}`);
    }

    const exampleCount = Math.min(3, permutations.length);
    for (let i = 0; i < exampleCount; i++) {
      steps.push(`Permutation ${i + 1}: ${permutations[i].join(", ")}`);
    }
    if (permutations.length > exampleCount) {
      steps.push(`...and ${permutations.length - exampleCount} more`);
    }

    const finalPermutations =
      count === "all" ? permutations : permutations.slice(0, parseInt(numPerms));
    return { permutations: finalPermutations, steps };
  }, [items, count, numPerms, allowRepetition, separator]);

  // Factorial helper
  const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));

  // Input handlers
  const handleItemsChange = (e) => {
    const value = e.target.value;
    setItems(value);
    setResult(null);
    setErrors((prev) => ({ ...prev, items: value ? "" : "Items are required" }));
  };

  const handleNumPermsChange = (e) => {
    const value = e.target.value;
    setNumPerms(value);
    setResult(null);
    if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0)) {
      setErrors((prev) => ({ ...prev, numPerms: "Must be a positive integer" }));
    } else {
      setErrors((prev) => ({ ...prev, numPerms: "" }));
    }
  };

  // Validation
  const isValid = useMemo(() => {
    const itemList = items
      .split(separator)
      .map((item) => item.trim())
      .filter((item) => item !== "");
    if (itemList.length === 0) return false;

    if (count === "specific") {
      return (
        numPerms &&
        !isNaN(parseInt(numPerms)) &&
        parseInt(numPerms) > 0 &&
        Object.values(errors).every((err) => !err)
      );
    }
    return Object.values(errors).every((err) => !err);
  }, [items, count, numPerms, errors, separator]);

  // Generate permutations
  const generate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({ ...prev, general: "Please provide valid inputs" }));
      return;
    }

    const genResult = generatePermutations();
    if (genResult.error) {
      setErrors({ general: genResult.error });
    } else {
      setResult(genResult);
    }
  };

  // Reset state
  const reset = () => {
    setItems("");
    setCount("all");
    setNumPerms("");
    setAllowRepetition(false);
    setSeparator(",");
    setResult(null);
    setErrors({});
    setShowSteps(false);
    setFormat("list");
  };

  // Download result
  const downloadResult = () => {
    if (!result) return;
    const content =
      format === "list"
        ? result.permutations.map((perm) => perm.join(separator)).join("\n")
        : result.permutations.map((perm) => perm.join(separator)).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `permutations-${Date.now()}.${format === "list" ? "txt" : "csv"}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!result) return;
    const content =
      format === "list"
        ? result.permutations.map((perm) => perm.join(separator)).join("\n")
        : result.permutations.map((perm) => perm.join(separator)).join("\n");
    navigator.clipboard.writeText(content);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Permutation Generator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
            <input
              type="text"
              value={items}
              onChange={handleItemsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder={`e.g., 1${separator} 2${separator} 3 or A${separator} B${separator} C`}
            />
            {errors.items && <p className="text-red-600 text-sm mt-1">{errors.items}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCount("all")}
                  className={`flex-1 py-2 rounded-md transition-colors ${
                    count === "all" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setCount("specific")}
                  className={`flex-1 py-2 rounded-md transition-colors ${
                    count === "specific" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Specific
                </button>
              </div>
            </div>
            {count === "specific" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Permutations
                </label>
                <input
                  type="number"
                  step="1"
                  value={numPerms}
                  onChange={handleNumPermsChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                />
                {errors.numPerms && (
                  <p className="text-red-600 text-sm mt-1">{errors.numPerms}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Separator</label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value=" ">Space</option>
                <option value="\t">Tab</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="list">List</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={allowRepetition}
              onChange={(e) => setAllowRepetition(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Allow Repetition</label>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={generate}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Generate
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
          <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700">{errors.general}</div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Permutations</h2>
            <div className="max-h-64 overflow-y-auto bg-white p-2 rounded-md shadow-inner">
              {format === "list" ? (
                <ul className="text-sm space-y-1">
                  {result.permutations.map((perm, i) => (
                    <li key={i}>{perm.join(separator)}</li>
                  ))}
                </ul>
              ) : (
                <pre className="text-sm">{result.permutations.map((perm) => perm.join(separator)).join("\n")}</pre>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600">Total: {result.permutations.length}</p>

            {/* Result Actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={downloadResult}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={copyToClipboard}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <FaCopy className="mr-2" /> Copy
              </button>
            </div>

            {/* Steps */}
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside text-gray-600">
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
            <li>Generate permutations with or without repetition</li>
            <li>Customizable item count and separator</li>
            <li>Output in list or CSV format</li>
            <li>Download or copy results</li>
            <li>Step-by-step generation process</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PermutationGenerator;