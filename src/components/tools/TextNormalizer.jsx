"use client";
import React, { useState } from "react";

const TextNormalizer = () => {
  const [inputText, setInputText] = useState("");
  const [normalizedText, setNormalizedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    case: "none",           // none, lower, upper, title
    normalizeSpaces: true,  // Collapse multiple spaces/newlines
    trim: true,            // Remove leading/trailing spaces
    removeSpecialChars: false, // Remove non-alphanumeric chars
    normalizeUnicode: false, // Normalize Unicode (e.g., accents)
  });

  // Normalize text based on options
  const normalizeText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to normalize" };
    }

    let result = text;

    // Normalize Unicode (e.g., é → e)
    if (options.normalizeUnicode) {
      result = result.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }

    // Case conversion
    switch (options.case) {
      case "lower":
        result = result.toLowerCase();
        break;
      case "upper":
        result = result.toUpperCase();
        break;
      case "title":
        result = result.replace(/\b\w/g, char => char.toUpperCase());
        break;
      default:
        // "none" keeps original case
        break;
    }

    // Remove special characters
    if (options.removeSpecialChars) {
      result = result.replace(/[^a-zA-Z0-9\s]/g, "");
    }

    // Normalize spaces
    if (options.normalizeSpaces) {
      result = result.replace(/\s+/g, " ").replace(/\n+/g, "\n");
    }

    // Trim
    if (options.trim) {
      result = result.trim();
    }

    return {
      original: text,
      normalized: result,
      changes: getChanges(text, result),
    };
  };

  // Helper to identify changes made
  const getChanges = (original, normalized) => {
    const changes = [];
    if (original === normalized) return ["No changes made"];

    if (options.case !== "none" && original !== normalized.toLowerCase() && original !== normalized.toUpperCase()) {
      changes.push(`Converted case to ${options.case}`);
    }
    if (options.normalizeUnicode && original.match(/[\u00C0-\u017F]/)) {
      changes.push("Normalized Unicode characters");
    }
    if (options.removeSpecialChars && original.match(/[^a-zA-Z0-9\s]/)) {
      changes.push("Removed special characters");
    }
    if (options.normalizeSpaces && original.match(/\s{2,}|\n{2,}/)) {
      changes.push("Normalized multiple spaces and newlines");
    }
    if (options.trim && (original.startsWith(" ") || original.endsWith(" ") || original.startsWith("\n") || original.endsWith("\n"))) {
      changes.push("Trimmed leading/trailing spaces");
    }
    return changes.length > 0 ? changes : ["Applied basic normalization"];
  };

  const handleNormalize = async () => {
    setError("");
    setNormalizedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = normalizeText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setNormalizedText(result.normalized);
    } catch (err) {
      setError("An error occurred while normalizing the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setNormalizedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Normalizer
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Normalize:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-40 resize-y transition-all"
              placeholder="e.g.,  Héllo   Wôrld!  \n\n  Test  "
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Normalization Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Case:</label>
                <select
                  value={options.case}
                  onChange={(e) => handleOptionChange("case", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="none">Keep Original</option>
                  <option value="lower">Lowercase</option>
                  <option value="upper">Uppercase</option>
                  <option value="title">Title Case</option>
                </select>
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.normalizeSpaces}
                  onChange={() => handleOptionChange("normalizeSpaces", !options.normalizeSpaces)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span>Normalize Spaces</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.trim}
                  onChange={() => handleOptionChange("trim", !options.trim)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span>Trim</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.removeSpecialChars}
                  onChange={() => handleOptionChange("removeSpecialChars", !options.removeSpecialChars)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span>Remove Special Characters</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.normalizeUnicode}
                  onChange={() => handleOptionChange("normalizeUnicode", !options.normalizeUnicode)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span>Normalize Unicode</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleNormalize}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-teal-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {isLoading ? "Normalizing..." : "Normalize Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Output Display */}
        {normalizedText && (
          <div className="mt-8 p-6 bg-teal-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Normalized Text
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap">
              {normalizedText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {normalizeText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(normalizedText)}
              className="mt-4 w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all font-semibold"
            >
              Copy Normalized Text to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextNormalizer;