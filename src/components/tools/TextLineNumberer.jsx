"use client";
import React, { useState } from "react";

const TextLineNumberer = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    startNumber: 1,
    increment: 1,
    padding: 2,
    separator: ": ",
    alignRight: false,
  });

  // Add line numbers to text
  const numberLines = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to number" };
    }

    const lines = text.split("\n");
    let currentNumber = options.startNumber;

    const numberedLines = lines.map((line, index) => {
      const lineNumber = currentNumber + (index * options.increment);
      const paddedNumber = String(lineNumber).padStart(options.padding, "0");
      const formattedNumber = options.alignRight 
        ? paddedNumber.padStart(Math.max(2, String(lines.length * options.increment).length), " ")
        : paddedNumber;
      return `${formattedNumber}${options.separator}${line}`;
    });

    return {
      original: text,
      numbered: numberedLines.join("\n"),
    };
  };

  const handleNumberLines = async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = numberLines(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setOutputText(result.numbered);
    } catch (err) {
      setError("An error occurred while numbering the lines");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setOutputText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Line Numberer
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Number:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y transition-all"
              placeholder="e.g., First line\nSecond line\nThird line"
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Numbering Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Number:</label>
                <input
                  type="number"
                  value={options.startNumber}
                  onChange={(e) => handleOptionChange("startNumber", parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Increment:</label>
                <input
                  type="number"
                  value={options.increment}
                  onChange={(e) => handleOptionChange("increment", parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Padding (digits):</label>
                <input
                  type="number"
                  value={options.padding}
                  onChange={(e) => handleOptionChange("padding", parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <input
                  type="text"
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength="5"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.alignRight}
                  onChange={() => handleOptionChange("alignRight", !options.alignRight)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Align Numbers Right</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleNumberLines}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Numbering..." : "Number Lines"}
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
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Numbered Text
            </h2>
            <pre className="mt-3 text-gray-700 whitespace-pre-wrap break-all">
              {outputText}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
            >
              Copy to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextLineNumberer;