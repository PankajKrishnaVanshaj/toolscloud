"use client";
import React, { useState } from "react";

const TextTypographer = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    smartQuotes: true,
    properDashes: true,
    ellipsis: true,
    spacing: true,
  });

  // Typography enhancement function
  const enhanceTypography = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to enhance" };
    }

    let result = text;

    // Apply selected typographic enhancements
    if (options.smartQuotes) {
      result = result
        .replace(/(^|\s)'(\w)/g, "$1‘$2") // Opening single quote
        .replace(/(\w)'(\w)/g, "$1’$2")   // Closing single quote
        .replace(/(^|\s)"(\w)/g, "$1“$2") // Opening double quote
        .replace(/(\w)"(\w|$)/g, "$1”$2"); // Closing double quote
    }

    if (options.properDashes) {
      result = result
        .replace(/\s*--\s*/g, "—")     // Em dash
        .replace(/\s*-\s*/g, " – ");    // En dash with spaces
    }

    if (options.ellipsis) {
      result = result.replace(/\.{3,}/g, "…"); // Replace three+ dots with ellipsis
    }

    if (options.spacing) {
      result = result
        .replace(/\s+/g, " ")           // Collapse multiple spaces
        .replace(/\s+([.!?])/g, "$1")   // Remove space before punctuation
        .trim();                        // Trim leading/trailing spaces
    }

    return {
      original: text,
      enhanced: result,
      changes: getChanges(text, result),
    };
  };

  // Helper to identify changes made
  const getChanges = (original, enhanced) => {
    const changes = [];
    if (original === enhanced) return ["No changes made"];

    if (options.smartQuotes && original.match(/['"]/)) {
      changes.push("Converted straight quotes to smart quotes");
    }
    if (options.properDashes && original.match(/--| - /)) {
      changes.push("Replaced hyphens with proper dashes");
    }
    if (options.ellipsis && original.match(/\.{3,}/)) {
      changes.push("Converted triple dots to ellipsis");
    }
    if (options.spacing && original.match(/\s{2,}|\s[.!?]/)) {
      changes.push("Fixed spacing issues");
    }
    return changes.length > 0 ? changes : ["Minor formatting applied"];
  };

  const handleEnhance = async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = enhanceTypography(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setOutputText(result.enhanced);
    } catch (err) {
      setError("An error occurred while processing the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setOutputText("");
    setError("");
  };

  const handleOptionChange = (option) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Typographer
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Enhance:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-40 resize-y transition-all"
              placeholder='e.g., He said -- "Hello world..."'
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Typography Options:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(options).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleOptionChange(key)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>{key.replace(/([A-Z])/g, " $1").trim()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleEnhance}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isLoading ? "Processing..." : "Enhance"}
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
        {outputText && (
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Enhanced Text
            </h2>
            <p className="mt-3 text-lg text-center text-gray-700 break-words">
              {outputText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {enhanceTypography(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextTypographer;