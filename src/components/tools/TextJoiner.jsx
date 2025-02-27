"use client";
import React, { useState } from "react";

const TextJoiner = () => {
  const [inputText, setInputText] = useState("");
  const [joinedText, setJoinedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    separator: ", ",       // Default separator
    trimLines: true,       // Trim whitespace from each line
    ignoreEmpty: true,     // Ignore empty lines
    customSeparator: "",   // For custom separator input
    joinMethod: "lines",   // lines, custom
  });

  // Join text based on options
  const joinText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to join" };
    }

    let lines = options.joinMethod === "lines" ? text.split("\n") : text.split(options.customSeparator);

    // Apply trimming and empty line filtering
    if (options.trimLines) {
      lines = lines.map(line => line.trim());
    }
    if (options.ignoreEmpty) {
      lines = lines.filter(line => line.length > 0);
    }

    if (lines.length === 0) {
      return { error: "No valid text lines to join after filtering" };
    }

    const separator = options.joinMethod === "lines" ? options.separator : options.customSeparator;
    const result = lines.join(separator);

    return {
      original: text,
      joined: result,
      lineCount: lines.length,
    };
  };

  const handleJoin = async () => {
    setError("");
    setJoinedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = joinText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setJoinedText(result.joined);
    } catch (err) {
      setError("An error occurred while joining the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setJoinedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Joiner
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Join:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-40 resize-y transition-all"
              placeholder="e.g., Apple\nBanana\nOrange"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Joining Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Join Method:</label>
                <select
                  value={options.joinMethod}
                  onChange={(e) => handleOptionChange("joinMethod", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="lines">Lines (Newline)</option>
                  <option value="custom">Custom Separator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <input
                  type="text"
                  value={options.joinMethod === "lines" ? options.separator : options.customSeparator}
                  onChange={(e) => handleOptionChange(options.joinMethod === "lines" ? "separator" : "customSeparator", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  maxLength="10"
                  placeholder={options.joinMethod === "lines" ? ", " : "Enter separator"}
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.trimLines}
                  onChange={() => handleOptionChange("trimLines", !options.trimLines)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span>Trim Lines</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.ignoreEmpty}
                  onChange={() => handleOptionChange("ignoreEmpty", !options.ignoreEmpty)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span>Ignore Empty Lines</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleJoin}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-teal-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {isLoading ? "Joining..." : "Join Text"}
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
        {joinedText && (
          <div className="mt-8 p-6 bg-teal-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Joined Text
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap">
              {joinedText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(joinedText)}
              className="mt-4 w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all font-semibold"
            >
              Copy Joined Text to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextJoiner;