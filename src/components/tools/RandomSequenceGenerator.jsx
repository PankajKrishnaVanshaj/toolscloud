"use client";

import React, { useState, useCallback } from "react";
import { faker } from "@faker-js/faker";
import { FaCopy, FaDownload, FaTrash, FaHistory, FaUndo } from "react-icons/fa";

const RandomSequenceGenerator = () => {
  const [sequenceType, setSequenceType] = useState("numeric");
  const [sequenceLength, setSequenceLength] = useState(10);
  const [batchSize, setBatchSize] = useState(5);
  const [customPattern, setCustomPattern] = useState("");
  const [sequences, setSequences] = useState([]);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    prefix: "",
    suffix: "",
    separator: "\n", // Output separator
    unique: false,  // Ensure unique sequences
    case: "mixed",  // For alpha: mixed, upper, lower
  });
  const [showAlert, setShowAlert] = useState(false);

  // Generate a single sequence based on type
  const generateSequence = useCallback(() => {
    try {
      let sequence;
      const casing = options.case === "upper" ? "upper" : options.case === "lower" ? "lower" : undefined;

      switch (sequenceType) {
        case "numeric":
          sequence = faker.string.numeric({ length: sequenceLength });
          break;
        case "alpha":
          sequence = faker.string.alpha({ length: sequenceLength, casing });
          break;
        case "alphanumeric":
          sequence = faker.string.alphanumeric({ length: sequenceLength, casing });
          break;
        case "hex":
          sequence = faker.string.hexadecimal({ length: sequenceLength, casing: options.case });
          break;
        case "uuid":
          sequence = faker.string.uuid();
          break;
        case "custom":
          if (!customPattern) throw new Error("Custom pattern is required");
          sequence = generateCustomSequence(customPattern);
          break;
        default:
          throw new Error("Invalid sequence type");
      }

      return `${options.prefix}${sequence}${options.suffix}`;
    } catch (err) {
      throw new Error(`Sequence generation failed: ${err.message}`);
    }
  }, [sequenceType, sequenceLength, customPattern, options]);

  // Generate sequence from custom pattern
  const generateCustomSequence = (pattern) => {
    let result = "";
    for (const char of pattern) {
      if (char === "#") {
        result += faker.string.numeric({ length: 1 });
      } else if (char === "A") {
        result += faker.string.alpha({ length: 1, casing: "upper" });
      } else if (char === "a") {
        result += faker.string.alpha({ length: 1, casing: "lower" });
      } else if (char === "X") {
        result += faker.string.hexadecimal({ length: 1, casing: "upper" }).slice(2);
      } else {
        result += char; // Literal character
      }
    }
    return result;
  };

  // Generate a batch of sequences
  const generateBatch = useCallback(() => {
    try {
      const sequenceSet = new Set();
      const maxAttempts = batchSize * 2; // Prevent infinite loop
      let attempts = 0;

      while (sequenceSet.size < batchSize && attempts < maxAttempts) {
        const sequence = generateSequence();
        if (!options.unique || !sequenceSet.has(sequence)) {
          sequenceSet.add(sequence);
        }
        attempts++;
      }

      const newSequences = Array.from(sequenceSet);
      if (newSequences.length < batchSize) {
        setError("Could not generate enough unique sequences");
      }

      setSequences(newSequences);
      setHistory((prev) => [
        { sequences: newSequences, type: sequenceType, pattern: customPattern, options, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);
      setError("");
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    }
  }, [batchSize, generateSequence, options]);

  // Copy sequences to clipboard
  const handleCopy = () => {
    if (sequences.length > 0) {
      navigator.clipboard.writeText(sequences.join(options.separator)).then(() => {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
      });
    }
  };

  // Download sequences as file
  const handleDownload = (format) => {
    if (sequences.length > 0) {
      const content = format === "csv" ? `Sequence\n${sequences.join("\n")}` : sequences.join(options.separator);
      const type = format === "csv" ? "text/csv" : "text/plain";
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sequences_${sequenceType}_${Date.now()}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset
  const handleReset = () => {
    setSequences([]);
    setError("");
  };

  // Load from history
  const loadFromHistory = (entry) => {
    setSequences(entry.sequences);
    setSequenceType(entry.type);
    setCustomPattern(entry.pattern || "");
    setOptions(entry.options);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        {/* Alert Notification */}
        {showAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Sequences copied to clipboard!
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Random Sequence Generator
        </h2>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sequence Type
              </label>
              <select
                value={sequenceType}
                onChange={(e) => setSequenceType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="numeric">Numeric</option>
                <option value="alpha">Alphabetic</option>
                <option value="alphanumeric">Alphanumeric</option>
                <option value="hex">Hexadecimal</option>
                <option value="uuid">UUID</option>
                <option value="custom">Custom Pattern</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Size (1-100)
              </label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {sequenceType !== "custom" && sequenceType !== "uuid" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sequence Length (1-50)
                </label>
                <input
                  type="number"
                  value={sequenceLength}
                  onChange={(e) => setSequenceLength(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {sequenceType === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Pattern (#=num, A=upper, a=lower, X=hex)
                </label>
                <input
                  type="text"
                  value={customPattern}
                  onChange={(e) => setCustomPattern(e.target.value)}
                  placeholder="e.g., A###-Xaa"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prefix:</label>
                <input
                  type="text"
                  value={options.prefix}
                  onChange={(e) => setOptions((prev) => ({ ...prev, prefix: e.target.value }))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., SEQ-"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Suffix:</label>
                <input
                  type="text"
                  value={options.suffix}
                  onChange={(e) => setOptions((prev) => ({ ...prev, suffix: e.target.value }))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., -END"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Separator:</label>
                <select
                  value={options.separator}
                  onChange={(e) => setOptions((prev) => ({ ...prev, separator: e.target.value }))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="\n">Newline</option>
                  <option value=", ">Comma</option>
                  <option value=" ">Space</option>
                  <option value="; ">Semicolon</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Case (Alpha/Hex):</label>
                <select
                  value={options.case}
                  onChange={(e) => setOptions((prev) => ({ ...prev, case: e.target.value }))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mixed">Mixed</option>
                  <option value="upper">Uppercase</option>
                  <option value="lower">Lowercase</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.unique}
                  onChange={() => setOptions((prev) => ({ ...prev, unique: !prev.unique }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Unique Sequences</label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateBatch}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              Generate Batch
            </button>
            <button
              onClick={handleCopy}
              disabled={sequences.length === 0}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              <FaCopy className="mr-2" />
              Copy
            </button>
            <button
              onClick={() => handleDownload("txt")}
              disabled={sequences.length === 0}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              TXT
            </button>
            <button
              onClick={() => handleDownload("csv")}
              disabled={sequences.length === 0}
              className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              CSV
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaTrash className="mr-2" />
              Reset
            </button>
          </div>
        </div>

        {/* Output */}
        {sequences.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Generated Sequences ({sequences.length})
            </h3>
            <div className="w-full p-3 bg-white border border-gray-300 rounded-lg font-mono text-sm overflow-y-auto max-h-64 whitespace-pre-wrap break-all">
              {sequences.join(options.separator)}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-sm p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Batch History (Last 10)
            </h3>
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
              {history.map((entry, index) => (
                <div
                  key={index}
                  onClick={() => loadFromHistory(entry)}
                  className="p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {entry.type} Batch ({entry.sequences.length}) - {entry.timestamp.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {entry.sequences[0]}{entry.type === "custom" ? ` (Pattern: ${entry.pattern})` : ""}
                    </p>
                  </div>
                  <FaUndo className="text-blue-500 hover:text-blue-700" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Generate numeric, alpha, alphanumeric, hex, UUID, or custom sequences</li>
            <li>Custom prefixes, suffixes, and output separators</li>
            <li>Ensure unique sequences and control case</li>
            <li>Download as TXT or CSV, copy, and track history</li>
          </ul>
        </div>
      </div>

      {/* Tailwind Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default RandomSequenceGenerator;