"use client";
import React, { useState } from "react";

const TextCleaner = () => {
  const [inputText, setInputText] = useState("");
  const [cleanedText, setCleanedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    removeExtraSpaces: true,   // Collapse multiple spaces/newlines
    removeSpecialChars: false, // Remove non-alphanumeric chars (except basic punctuation)
    removeHTML: false,         // Strip HTML tags
    removeNumbers: false,      // Remove digits
    trim: true,                // Trim leading/trailing spaces
    customRegex: "",           // Custom regex pattern to remove
  });

  // Clean text based on options
  const cleanText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to clean" };
    }

    let result = text;

    // Remove HTML tags
    if (options.removeHTML) {
      result = result.replace(/<[^>]*>/g, "");
    }

    // Remove special characters (keep basic punctuation: .,!?)
    if (options.removeSpecialChars) {
      result = result.replace(/[^a-zA-Z0-9\s.,!?]/g, "");
    }

    // Remove numbers
    if (options.removeNumbers) {
      result = result.replace(/\d+/g, "");
    }

    // Normalize extra spaces
    if (options.removeExtraSpaces) {
      result = result.replace(/\s+/g, " ").replace(/\n+/g, "\n");
    }

    // Apply custom regex
    if (options.customRegex) {
      try {
        const regex = new RegExp(options.customRegex, "g");
        result = result.replace(regex, "");
      } catch (err) {
        return { error: "Invalid custom regex pattern" };
      }
    }

    // Trim
    if (options.trim) {
      result = result.trim();
    }

    return {
      original: text,
      cleaned: result,
      changes: getChanges(text, result),
    };
  };

  // Helper to identify changes made
  const getChanges = (original, cleaned) => {
    const changes = [];
    if (original === cleaned) return ["No changes made"];

    if (options.removeHTML && original.match(/<[^>]*>/)) {
      changes.push("Removed HTML tags");
    }
    if (options.removeSpecialChars && original.match(/[^a-zA-Z0-9\s.,!?]/)) {
      changes.push("Removed special characters");
    }
    if (options.removeNumbers && original.match(/\d/)) {
      changes.push("Removed numbers");
    }
    if (options.removeExtraSpaces && original.match(/\s{2,}|\n{2,}/)) {
      changes.push("Removed extra spaces and newlines");
    }
    if (options.customRegex && original !== cleaned) {
      changes.push(`Applied custom regex: "${options.customRegex}"`);
    }
    if (options.trim && (original.startsWith(" ") || original.endsWith(" ") || original.startsWith("\n") || original.endsWith("\n"))) {
      changes.push("Trimmed leading/trailing spaces");
    }
    return changes.length > 0 ? changes : ["Applied basic cleaning"];
  };

  const handleClean = async () => {
    setError("");
    setCleanedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = cleanText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setCleanedText(result.cleaned);
    } catch (err) {
      setError("An error occurred while cleaning the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setCleanedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Cleaner
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Clean:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-40 resize-y transition-all"
              placeholder="e.g.,  Hello   <b>World!</b>  @#$  123"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Cleaning Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.removeExtraSpaces}
                  onChange={() => handleOptionChange("removeExtraSpaces", !options.removeExtraSpaces)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span>Remove Extra Spaces</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.removeSpecialChars}
                  onChange={() => handleOptionChange("removeSpecialChars", !options.removeSpecialChars)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span>Remove Special Characters</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.removeHTML}
                  onChange={() => handleOptionChange("removeHTML", !options.removeHTML)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span>Remove HTML</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.removeNumbers}
                  onChange={() => handleOptionChange("removeNumbers", !options.removeNumbers)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span>Remove Numbers</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.trim}
                  onChange={() => handleOptionChange("trim", !options.trim)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span>Trim</span>
              </label>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Regex:</label>
                <input
                  type="text"
                  value={options.customRegex}
                  onChange={(e) => handleOptionChange("customRegex", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., [aeiou]"
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleClean}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isLoading ? "Cleaning..." : "Clean Text"}
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
        {cleanedText && (
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Cleaned Text
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap">
              {cleanedText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {cleanText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(cleanedText)}
              className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
            >
              Copy Cleaned Text to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextCleaner;