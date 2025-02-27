"use client";
import React, { useState } from "react";

const TextUnformatter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    removeHTML: true,
    removeSpecialChars: true,
    normalizeSpaces: true,
    removeLineBreaks: false,
    trim: true,
  });

  // Unformat text based on options
  const unformatText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to unformat" };
    }

    let result = text;

    // Remove HTML tags
    if (options.removeHTML) {
      result = result.replace(/<[^>]*>/g, "");
    }

    // Remove special characters
    if (options.removeSpecialChars) {
      result = result.replace(/[^a-zA-Z0-9\s\n.,!?]/g, "");
    }

    // Normalize spaces
    if (options.normalizeSpaces) {
      result = result.replace(/\s+/g, " ");
    }

    // Remove line breaks
    if (options.removeLineBreaks) {
      result = result.replace(/[\r\n]+/g, " ");
    }

    // Trim leading/trailing spaces
    if (options.trim) {
      result = result.trim();
    }

    return {
      original: text,
      unformatted: result,
      changes: getChanges(text, result),
    };
  };

  // Helper to identify changes made
  const getChanges = (original, unformatted) => {
    const changes = [];
    if (original === unformatted) return ["No changes made"];

    if (options.removeHTML && original.match(/<[^>]*>/)) {
      changes.push("Removed HTML tags");
    }
    if (options.removeSpecialChars && original.match(/[^a-zA-Z0-9\s\n.,!?]/)) {
      changes.push("Removed special characters");
    }
    if (options.normalizeSpaces && original.match(/\s{2,}/)) {
      changes.push("Normalized multiple spaces to single spaces");
    }
    if (options.removeLineBreaks && original.match(/[\r\n]/)) {
      changes.push("Removed line breaks");
    }
    if (options.trim && (original.startsWith(" ") || original.endsWith(" "))) {
      changes.push("Trimmed leading/trailing spaces");
    }
    return changes.length > 0 ? changes : ["Applied basic cleanup"];
  };

  const handleUnformat = async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = unformatText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setOutputText(result.unformatted);
    } catch (err) {
      setError("An error occurred while unformatting the text");
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
          Text Unformatter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Unformat:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-40 resize-y transition-all"
              placeholder="e.g., <p>Hello   World!</p>  @#$%"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Unformatting Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(options).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleOptionChange(key)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>{key.replace(/([A-Z])/g, " $1").trim()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleUnformat}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {isLoading ? "Unformatting..." : "Unformat Text"}
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
          <div className="mt-8 p-6 bg-orange-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Unformatted Text
            </h2>
            <p className="mt-3 text-lg text-center text-gray-700 break-words whitespace-pre-wrap">
              {outputText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {unformatText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              className="mt-4 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold"
            >
              Copy to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextUnformatter;