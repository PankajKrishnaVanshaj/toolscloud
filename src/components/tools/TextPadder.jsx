"use client";
import React, { useState } from "react";

const TextPadder = () => {
  const [inputText, setInputText] = useState("");
  const [paddedText, setPaddedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    padDirection: "right",    // left, right
    padChar: " ",             // Single character to use for padding
    targetLength: 10,         // Desired length of each line
    padLinesSeparately: true, // Pad each line or entire text
  });

  // Pad text based on options
  const padText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to pad" };
    }

    if (options.padChar.length !== 1) {
      return { error: "Padding character must be a single character" };
    }

    if (options.targetLength < 1) {
      return { error: "Target length must be at least 1" };
    }

    let result;
    if (options.padLinesSeparately) {
      const lines = text.split("\n");
      result = lines.map(line => {
        if (line.length >= options.targetLength) return line;
        const padLength = options.targetLength - line.length;
        const padding = options.padChar.repeat(padLength);
        return options.padDirection === "left" ? padding + line : line + padding;
      }).join("\n");
    } else {
      const totalLength = text.length;
      if (totalLength >= options.targetLength) return text;
      const padLength = options.targetLength - totalLength;
      const padding = options.padChar.repeat(padLength);
      result = options.padDirection === "left" ? padding + text : text + padding;
    }

    return {
      original: text,
      padded: result,
    };
  };

  const handlePad = async () => {
    setError("");
    setPaddedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = padText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setPaddedText(result.padded);
    } catch (err) {
      setError("An error occurred while padding the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setPaddedText("");
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
          Text Padder
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Pad:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-40 resize-y transition-all"
              placeholder="e.g., Hello\nWorld"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Padding Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Pad Direction:</label>
                <select
                  value={options.padDirection}
                  onChange={(e) => handleOptionChange("padDirection", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Pad Character:</label>
                <input
                  type="text"
                  value={options.padChar}
                  onChange={(e) => handleOptionChange("padChar", e.target.value.slice(0, 1))}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength="1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Target Length:</label>
                <input
                  type="number"
                  value={options.targetLength}
                  onChange={(e) => handleOptionChange("targetLength", parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="1000"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.padLinesSeparately}
                  onChange={() => handleOptionChange("padLinesSeparately", !options.padLinesSeparately)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <span>Pad Lines Separately</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handlePad}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isLoading ? "Padding..." : "Pad Text"}
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
        {paddedText && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Padded Text
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all">
              {paddedText}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(paddedText)}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
            >
              Copy Padded Text to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextPadder;