"use client";
import React, { useState, useCallback } from "react";
import { generate } from "randomstring";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";
import { saveAs } from "file-saver"; // For downloading as text file

const SecurePINGenerator = () => {
  const [pinLength, setPinLength] = useState(4);
  const [pinCount, setPinCount] = useState(1);
  const [includeLetters, setIncludeLetters] = useState(false);
  const [includeSpecial, setIncludeSpecial] = useState(false);
  const [separator, setSeparator] = useState("");
  const [caseOption, setCaseOption] = useState("uppercase"); // uppercase, lowercase, mixed
  const [excludeSimilar, setExcludeSimilar] = useState(false); // Exclude similar characters
  const [pins, setPins] = useState([]);
  const [error, setError] = useState("");

  // Generate secure PINs
  const generatePins = useCallback(() => {
    setError("");
    setPins([]);

    if (pinLength < 4 || pinLength > 16) {
      setError("PIN length must be between 4 and 16 characters");
      return;
    }
    if (pinCount < 1 || pinCount > 100) {
      setError("Number of PINs must be between 1 and 100");
      return;
    }

    const charset = includeSpecial
      ? "alphanumeric!@#$%^&*"
      : includeLetters
      ? "alphanumeric"
      : "numeric";

    const newPins = Array.from({ length: pinCount }, () => {
      let pin = generate({
        length: pinLength,
        charset,
        capitalization:
          includeLetters && !includeSpecial
            ? caseOption === "mixed"
              ? undefined
              : caseOption
            : undefined,
        readable: excludeSimilar, // Excludes similar chars like 0, O, I, 1
      });

      // Add separator if specified and length allows
      if (separator && pinLength >= 4) {
        const mid = Math.floor(pinLength / 2);
        pin = `${pin.slice(0, mid)}${separator}${pin.slice(mid)}`;
      }

      return pin;
    });

    setPins(newPins);
  }, [
    pinLength,
    pinCount,
    includeLetters,
    includeSpecial,
    separator,
    caseOption,
    excludeSimilar,
  ]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generatePins();
  };

  // Copy PINs to clipboard
  const copyToClipboard = () => {
    if (pins.length > 0) {
      const text = pins.join("\n");
      navigator.clipboard.writeText(text);
    }
  };

  // Download PINs as text file
  const downloadPins = () => {
    if (pins.length > 0) {
      const blob = new Blob([pins.join("\n")], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `secure-pins-${Date.now()}.txt`);
    }
  };

  // Clear all
  const clearAll = () => {
    setPins([]);
    setError("");
    setPinLength(4);
    setPinCount(1);
    setIncludeLetters(false);
    setIncludeSpecial(false);
    setSeparator("");
    setCaseOption("uppercase");
    setExcludeSimilar(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Secure PIN Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid Layout for Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PIN Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN Length (4-16)
              </label>
              <input
                type="number"
                value={pinLength}
                onChange={(e) => setPinLength(Math.max(4, Math.min(16, parseInt(e.target.value))))}
                min={4}
                max={16}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Number of PINs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of PINs (1-100)
              </label>
              <input
                type="number"
                value={pinCount}
                onChange={(e) => setPinCount(Math.max(1, Math.min(100, parseInt(e.target.value))))}
                min={1}
                max={100}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Include Letters */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={includeLetters}
                  onChange={(e) => setIncludeLetters(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Include Letters (A-Z)
              </label>
              {includeLetters && !includeSpecial && (
                <select
                  value={caseOption}
                  onChange={(e) => setCaseOption(e.target.value)}
                  className="w-full p-2 border rounded-md mt-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="uppercase">Uppercase</option>
                  <option value="lowercase">Lowercase</option>
                  <option value="mixed">Mixed Case</option>
                </select>
              )}
            </div>

            {/* Include Special Characters */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={includeSpecial}
                  onChange={(e) => setIncludeSpecial(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Include Special (!@#$%^&*)
              </label>
            </div>

            {/* Separator Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Separator
              </label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                <option value="-">Dash (-)</option>
                <option value=" ">Space</option>
                <option value=".">Dot (.)</option>
              </select>
            </div>

            {/* Exclude Similar Characters */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={(e) => setExcludeSimilar(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Exclude Similar (e.g., 0, O, I, 1)
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Improves readability by avoiding confusing characters.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate PINs
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-2 bg-red-50 text-red-700 text-sm text-center rounded-md">
            {error}
          </div>
        )}

        {/* Generated PINs */}
        {pins.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Generated PINs</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaCopy className="mr-2" /> Copy All
                </button>
                <button
                  onClick={downloadPins}
                  className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border max-h-64 overflow-y-auto">
              <ul className="list-disc pl-5 font-mono text-gray-700">
                {pins.map((pin, index) => (
                  <li key={index} className="py-1">{pin}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Store these PINs securely. Ideal for temporary access or authentication.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable PIN length (4-16) and count (1-100)</li>
            <li>Options for letters, special characters, and case sensitivity</li>
            <li>Separators: None, Dash, Space, Dot</li>
            <li>Exclude similar characters for readability</li>
            <li>Copy to clipboard or download as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecurePINGenerator;