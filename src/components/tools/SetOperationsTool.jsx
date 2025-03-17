"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaSync, FaDownload, FaEye, FaEyeSlash } from "react-icons/fa";

const SetOperationsTool = () => {
  const [setA, setSetA] = useState("");
  const [setB, setSetB] = useState("");
  const [operation, setOperation] = useState("union");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [inputFormat, setInputFormat] = useState("comma"); // New: comma, space, json
  const [caseSensitive, setCaseSensitive] = useState(false); // New: toggle case sensitivity

  // Parse input based on format
  const parseInput = useCallback(
    (input) => {
      try {
        if (inputFormat === "json") {
          return JSON.parse(input);
        }
        const delimiter = inputFormat === "comma" ? "," : " ";
        const items = input
          .split(delimiter)
          .map((item) => (caseSensitive ? item.trim() : item.trim().toLowerCase()))
          .filter((item) => item !== "");
        return items;
      } catch (e) {
        return { error: "Invalid input format" };
      }
    },
    [inputFormat, caseSensitive]
  );

  // Perform set operation
  const performSetOperation = useCallback(() => {
    const steps = [`Performing ${operation} operation:`];
    
    const parsedA = parseInput(setA);
    const parsedB = parseInput(setB);

    if (parsedA.error || parsedB.error) {
      return { error: parsedA.error || parsedB.error };
    }
    if (parsedA.length === 0 || parsedB.length === 0) {
      return { error: "Both sets must contain at least one element" };
    }

    const A = new Set(parsedA);
    const B = new Set(parsedB);

    steps.push(`Set A = {${Array.from(A).join(", ")}}`);
    steps.push(`Set B = {${Array.from(B).join(", ")}}`);

    let resultSet;
    switch (operation) {
      case "union":
        resultSet = new Set([...A, ...B]);
        steps.push("Union (A ∪ B): Combine all elements from A and B");
        break;
      case "intersection":
        resultSet = new Set([...A].filter((x) => B.has(x)));
        steps.push("Intersection (A ∩ B): Elements common to both A and B");
        break;
      case "differenceA":
        resultSet = new Set([...A].filter((x) => !B.has(x)));
        steps.push("Difference (A - B): Elements in A but not in B");
        break;
      case "differenceB":
        resultSet = new Set([...B].filter((x) => !A.has(x)));
        steps.push("Difference (B - A): Elements in B but not in A");
        break;
      case "symmetric":
        const union = new Set([...A, ...B]);
        const intersection = new Set([...A].filter((x) => B.has(x)));
        resultSet = new Set([...union].filter((x) => !intersection.has(x)));
        steps.push("Symmetric Difference (A △ B): Elements in A or B but not both");
        steps.push("= (A ∪ B) - (A ∩ B)");
        break;
      default:
        return { error: "Invalid operation" };
    }

    steps.push(`Result: {${Array.from(resultSet).join(", ")}}`);
    return { result: Array.from(resultSet), steps };
  }, [setA, setB, operation, parseInput]);

  // Handle input changes
  const handleSetChange = (setKey) => (e) => {
    const value = e.target.value;
    if (setKey === "A") {
      setSetA(value);
      setErrors((prev) => ({ ...prev, setA: value ? "" : "Set A is required" }));
    } else {
      setSetB(value);
      setErrors((prev) => ({ ...prev, setB: value ? "" : "Set B is required" }));
    }
    setResult(null);
  };

  // Validate inputs
  const isValid = useMemo(() => {
    const parsedA = parseInput(setA);
    const parsedB = parseInput(setB);
    return (
      !parsedA.error &&
      !parsedB.error &&
      parsedA.length > 0 &&
      parsedB.length > 0 &&
      Object.values(errors).every((err) => !err)
    );
  }, [setA, setB, errors, parseInput]);

  // Calculate result
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: "Please provide valid inputs for both sets",
      }));
      return;
    }

    const calcResult = performSetOperation();
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setSetA("");
    setSetB("");
    setOperation("union");
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setInputFormat("comma");
    setCaseSensitive(false);
  };

  // Download result as text file
  const downloadResult = () => {
    if (!result) return;
    const content = [
      `Set A: ${setA}`,
      `Set B: ${setB}`,
      `Operation: ${operation}`,
      `Result: {${result.result.join(", ")}}`,
      "Steps:",
      ...result.steps,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `set-operation-result-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Set Operations Tool
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["A", "B"].map((setKey) => (
              <div key={setKey}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Set {setKey}
                </label>
                <input
                  type="text"
                  value={setKey === "A" ? setA : setB}
                  onChange={handleSetChange(setKey)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    inputFormat === "json"
                      ? 'e.g., ["a", "b", "c"]'
                      : inputFormat === "comma"
                      ? "e.g., a, b, c"
                      : "e.g., a b c"
                  }
                  aria-label={`Set ${setKey}`}
                />
                {errors[`set${setKey}`] && (
                  <p className="text-red-600 text-sm mt-1">{errors[`set${setKey}`]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Format
              </label>
              <select
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="comma">Comma-separated</option>
                <option value="space">Space-separated</option>
                <option value="json">JSON Array</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Case Sensitive</span>
              </label>
            </div>
          </div>

          {/* Operation Selection */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { key: "union", label: "Union (A ∪ B)" },
              { key: "intersection", label: "Intersection (A ∩ B)" },
              { key: "differenceA", label: "Difference (A - B)" },
              { key: "differenceB", label: "Difference (B - A)" },
              { key: "symmetric", label: "Symmetric Diff (A △ B)" },
            ].map((op) => (
              <button
                key={op.key}
                onClick={() => setOperation(op.key)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  operation === op.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              disabled={!isValid}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Calculate
            </button>
            <button
              onClick={downloadResult}
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
          <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-700 text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Result:</h2>
            <p className="text-center text-xl font-mono">{`{${result.result.join(", ")}}`}</p>
            <p className="text-center text-sm mt-1">Size: {result.result.length}</p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="flex items-center mx-auto mt-2 text-blue-600 hover:underline"
            >
              {showSteps ? <FaEyeSlash className="mr-1" /> : <FaEye className="mr-1" />}
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside">
                {result.steps.map((step, i) => (
                  <li key={i} className="text-gray-600">{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports Union, Intersection, Differences, and Symmetric Difference</li>
            <li>Multiple input formats: Comma, Space, JSON</li>
            <li>Case sensitivity toggle</li>
            <li>Step-by-step calculation breakdown</li>
            <li>Download result as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SetOperationsTool;