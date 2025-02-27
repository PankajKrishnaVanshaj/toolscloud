"use client";
import React, { useState } from "react";

const TextCamelCaseConverter = () => {
  const [inputText, setInputText] = useState("");
  const [camelText, setCamelText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    removeSpecialChars: true,
    trim: true,
    preserveNumbers: true,
    maxLength: 100,
  });

  // Convert text to camelCase
  const toCamelCase = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to convert" };
    }

    let result = text;

    // Split by spaces, snake_case, kebab-case, etc.
    result = result
      .replace(/[-_]+/g, " ")     // Replace underscores/hyphens with spaces
      .split(/\s+/)
      .filter(Boolean)
      .map((word, index) => {
        word = word.toLowerCase();
        if (index > 0) {
          return word.charAt(0).toUpperCase() + word.slice(1); // Fixed: Removed incorrect ternary
        }
        return word;
      });

    // Apply options
    if (options.removeSpecialChars) {
      result = result.map(word => 
        options.preserveNumbers 
          ? word.replace(/[^a-z0-9]/gi, "") 
          : word.replace(/[^a-z]/gi, "")
      );
    }

    // Join words
    result = result.filter(word => word.length > 0).join("");

    if (options.trim) {
      result = result.replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores (if any)
    }

    // Enforce max length
    if (options.maxLength > 0 && result.length > options.maxLength) {
      result = result.substring(0, options.maxLength);
    }

    if (!result) {
      return { error: "Resulting camelCase text is empty after processing" };
    }

    return {
      original: text,
      camel: result,
      changes: getChanges(text, result),
    };
  };

  // Helper to identify changes made
  const getChanges = (original, camel) => {
    const changes = [];
    if (original === camel) return ["No changes made"];

    if (original.match(/\s+|-|_/)) {
      changes.push("Removed separators and combined words");
    }
    if (original.match(/[A-Z]/)) {
      changes.push("Adjusted capitalization for camelCase");
    }
    if (options.removeSpecialChars && original.match(/[^a-zA-Z0-9\s-_]/)) {
      changes.push("Removed special characters");
    }
    if (options.trim && (original.startsWith(" ") || original.endsWith(" "))) {
      changes.push("Trimmed leading/trailing spaces");
    }
    if (options.maxLength > 0 && original.length > options.maxLength) {
      changes.push(`Truncated to ${options.maxLength} characters`);
    }
    return changes.length > 0 ? changes : ["Applied camelCase formatting"];
  };

  const handleConvert = async () => {
    setError("");
    setCamelText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = toCamelCase(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setCamelText(result.camel);
    } catch (err) {
      setError("An error occurred while converting the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setCamelText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Camel Case Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Convert:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 h-40 resize-y transition-all"
              placeholder="e.g., Hello World, snake_case, kebab-case"
              maxLength={1000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/1000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Conversion Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(options).map(([key, value]) => (
                key === "maxLength" ? (
                  <div key={key} className="flex items-center space-x-2 text-sm text-gray-600">
                    <label>Max Length:</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleOptionChange(key, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                      min="0"
                      max="200"
                    />
                  </div>
                ) : (
                  <label key={key} className="flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleOptionChange(key, !value)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                    />
                    <span>{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  </label>
                )
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-amber-400 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {isLoading ? "Converting..." : "Convert to Camel Case"}
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
        {camelText && (
          <div className="mt-8 p-6 bg-amber-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Camel Case Result
            </h2>
            <p className="mt-3 text-lg text-center text-gray-700 break-all">
              {camelText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {toCamelCase(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(camelText)}
              className="mt-4 w-full py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all font-semibold"
            >
              Copy to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextCamelCaseConverter;