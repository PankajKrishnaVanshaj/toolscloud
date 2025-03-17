"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaSync, FaEye, FaEyeSlash } from "react-icons/fa";

const FibonacciSequenceGenerator = () => {
  const [start, setStart] = useState("0");
  const [terms, setTerms] = useState("");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [format, setFormat] = useState("decimal"); // New: number format
  const [precision, setPrecision] = useState(2); // New: decimal precision
  const [downloadFormat, setDownloadFormat] = useState("txt"); // New: download format

  // Generate Fibonacci sequence
  const generateFibonacci = useCallback(() => {
    const steps = ["Generating Fibonacci sequence:"];
    const startNum = parseFloat(start) || 0;
    const numTerms = parseInt(terms);

    if (isNaN(numTerms) || numTerms <= 0 || !Number.isInteger(numTerms)) {
      return { error: "Number of terms must be a positive integer" };
    }

    const sequence = [];
    steps.push(`Starting with ${startNum}, next term is ${startNum + 1}`);
    steps.push("Formula: F(n) = F(n-1) + F(n-2)");

    // First two terms
    sequence.push(startNum);
    if (numTerms > 1) sequence.push(startNum + 1);

    // Generate subsequent terms
    for (let n = 2; n < numTerms; n++) {
      const term = sequence[n - 1] + sequence[n - 2];
      sequence.push(term);
      if (n < 5) {
        steps.push(`F(${n + 1}): ${sequence[n - 1]} + ${sequence[n - 2]} = ${term}`);
      }
    }
    if (numTerms > 5) steps.push(`...and so on up to ${numTerms} terms`);

    // Format sequence based on selected format
    const formattedSequence = sequence.map((num) => {
      if (format === "scientific") return num.toExponential(precision);
      if (format === "hex") return "0x" + Math.round(num).toString(16);
      return num.toFixed(precision);
    });

    return { sequence: formattedSequence, steps };
  }, [start, terms, format, precision]);

  // Handle input changes with validation
  const handleStartChange = (e) => {
    const value = e.target.value;
    setStart(value);
    setResult(null);
    setErrors((prev) => ({
      ...prev,
      start: value && isNaN(parseFloat(value)) ? "Must be a number" : "",
    }));
  };

  const handleTermsChange = (e) => {
    const value = e.target.value;
    setTerms(value);
    setResult(null);
    setErrors((prev) => ({
      ...prev,
      terms:
        value && (isNaN(parseInt(value)) || parseInt(value) <= 0 || !Number.isInteger(parseFloat(value)))
          ? "Must be a positive integer"
          : "",
    }));
  };

  // Validate inputs
  const isValid = useMemo(() => {
    return (
      (!start || !isNaN(parseFloat(start))) &&
      terms &&
      !isNaN(parseInt(terms)) &&
      parseInt(terms) > 0 &&
      Number.isInteger(parseFloat(terms)) &&
      Object.values(errors).every((err) => !err)
    );
  }, [start, terms, errors]);

  // Generate sequence
  const generate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide a valid starting number and number of terms" });
      return;
    }

    const genResult = generateFibonacci();
    if (genResult.error) {
      setErrors({ general: genResult.error });
    } else {
      setResult(genResult);
    }
  };

  // Reset state
  const reset = () => {
    setStart("0");
    setTerms("");
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setFormat("decimal");
    setPrecision(2);
    setDownloadFormat("txt");
  };

  // Download sequence
  const downloadSequence = () => {
    if (!result) return;

    const content =
      downloadFormat === "txt"
        ? `Fibonacci Sequence:\n${result.sequence.join(", ")}\n\nSteps:\n${result.steps.join("\n")}`
        : JSON.stringify({ sequence: result.sequence, steps: result.steps }, null, 2);

    const blob = new Blob([content], { type: downloadFormat === "txt" ? "text/plain" : "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fibonacci-sequence-${Date.now()}.${downloadFormat}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Fibonacci Sequence Generator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starting Number</label>
              <input
                type="number"
                step="0.01"
                value={start}
                onChange={handleStartChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 0"
                aria-label="Starting number"
              />
              {errors.start && <p className="text-red-600 text-sm mt-1">{errors.start}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Terms</label>
              <input
                type="number"
                step="1"
                value={terms}
                onChange={handleTermsChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5"
                aria-label="Number of terms"
              />
              {errors.terms && <p className="text-red-600 text-sm mt-1">{errors.terms}</p>}
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="decimal">Decimal</option>
                <option value="scientific">Scientific</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision ({precision} digits)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={precision}
                onChange={(e) => setPrecision(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                disabled={format === "hex"}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={generate}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Generate
          </button>
          <button
            onClick={downloadSequence}
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

        {/* Download Format */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Download Format</label>
          <select
            value={downloadFormat}
            onChange={(e) => setDownloadFormat(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="txt">Text (.txt)</option>
            <option value="json">JSON (.json)</option>
          </select>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Fibonacci Sequence:</h2>
            <p className="text-center text-xl break-words">{result.sequence.join(", ")}</p>
            <p className="text-center mt-2 text-sm">Total Terms: {result.sequence.length}</p>
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
            <li>Custom starting number</li>
            <li>Multiple number formats (Decimal, Scientific, Hex)</li>
            <li>Adjustable precision for decimal places</li>
            <li>Download sequence in TXT or JSON format</li>
            <li>Step-by-step generation details</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FibonacciSequenceGenerator;