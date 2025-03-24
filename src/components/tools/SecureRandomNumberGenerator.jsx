"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaRandom } from "react-icons/fa";

const SecureRandomNumberGenerator = () => {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState("decimal");
  const [unique, setUnique] = useState(false); // New: Ensure unique numbers
  const [numbers, setNumbers] = useState([]);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate secure random numbers
  const generateNumbers = useCallback(() => {
    setError("");
    setNumbers([]);
    setIsGenerating(true);

    // Input validation
    if (isNaN(min) || isNaN(max) || min >= max) {
      setError("Minimum must be less than Maximum");
      setIsGenerating(false);
      return;
    }
    if (isNaN(count) || count < 1 || count > 1000) {
      setError("Count must be between 1 and 1000");
      setIsGenerating(false);
      return;
    }
    const range = max - min + 1;
    if (range > 2 ** 32) {
      setError("Range too large (max - min must be ≤ 4,294,967,295)");
      setIsGenerating(false);
      return;
    }
    if (unique && count > range) {
      setError("Count exceeds possible unique values in range");
      setIsGenerating(false);
      return;
    }

    try {
      const results = new Set(unique ? [] : null); // Use Set for uniqueness
      const array = new Uint32Array(count);
      window.crypto.getRandomValues(array);

      for (let i = 0; i < count; i++) {
        let randomValue = array[i] % range + min;
        if (unique) {
          while (results.has(randomValue) && results.size < count) {
            const newArray = new Uint32Array(1);
            window.crypto.getRandomValues(newArray);
            randomValue = newArray[0] % range + min;
          }
          if (results.size >= range) break;
          results.add(randomValue);
        }

        let formattedValue;
        switch (format) {
          case "hex":
            formattedValue = randomValue.toString(16).toUpperCase().padStart(2, "0");
            break;
          case "binary":
            formattedValue = randomValue.toString(2).padStart(8, "0");
            break;
          case "octal":
            formattedValue = randomValue.toString(8).padStart(3, "0");
            break;
          case "decimal":
          default:
            formattedValue = randomValue.toString(10);
            break;
        }

        if (!unique) results.push(formattedValue);
      }

      setNumbers(unique ? Array.from(results) : results);
      setIsGenerating(false);
    } catch (err) {
      setError("Generation failed: " + err.message);
      setIsGenerating(false);
    }
  }, [min, max, count, format, unique]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateNumbers();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (numbers.length > 0) {
      navigator.clipboard.writeText(numbers.join("\n"));
    }
  };

  // Download as file
  const downloadAsFile = () => {
    if (numbers.length > 0) {
      const blob = new Blob([numbers.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `random_numbers_${format}_${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all
  const clearAll = () => {
    setMin(1);
    setMax(100);
    setCount(1);
    setFormat("decimal");
    setUnique(false);
    setNumbers([]);
    setError("");
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Secure Random Number Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Value
              </label>
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(parseInt(e.target.value) || "")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Value
              </label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(parseInt(e.target.value) || "")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 100"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Count (1-1000)
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || "")}
                min={1}
                max={1000}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              >
                <option value="decimal">Decimal</option>
                <option value="hex">Hexadecimal</option>
                <option value="binary">Binary</option>
                <option value="octal">Octal</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={unique}
                  onChange={(e) => setUnique(e.target.checked)}
                  className="mr-2 accent-blue-500"
                  disabled={isGenerating}
                />
                <span className="text-sm text-gray-700">Unique Numbers</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isGenerating}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaRandom className="mr-2" /> {isGenerating ? "Generating..." : "Generate"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={isGenerating}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Generated Numbers */}
        {numbers.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Generated Numbers</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadAsFile}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border max-h-64 overflow-y-auto">
              <ul className="list-none font-mono text-sm space-y-1">
                {numbers.map((number, index) => (
                  <li key={index} className="py-1">{number}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Count: {numbers.length} | Format:{" "}
              {format.charAt(0).toUpperCase() + format.slice(1)} | Unique: {unique ? "Yes" : "No"}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Secure random numbers using Web Crypto API</li>
            <li>Multiple formats: Decimal, Hexadecimal, Binary, Octal</li>
            <li>Option for unique numbers</li>
            <li>Customizable range and count (up to 1000)</li>
            <li>Copy to clipboard and download as text file</li>
          </ul>
        </div>

       
      </div>
    </div>
  );
};

export default SecureRandomNumberGenerator;