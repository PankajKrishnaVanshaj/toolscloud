"use client";
import React, { useState } from "react";

const TextAligner = () => {
  const [inputText, setInputText] = useState("");
  const [alignedText, setAlignedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    alignment: "left",     // left, right, center
    width: 20,             // Fixed width for alignment
    alignChar: " ",        // Character used for padding
    trim: true,            // Trim whitespace before aligning
    alignLinesSeparately: true, // Align each line individually
  });

  // Align text based on options
  const alignText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to align" };
    }

    if (options.width < 1) {
      return { error: "Width must be at least 1" };
    }

    if (options.alignChar.length !== 1) {
      return { error: "Alignment character must be a single character" };
    }

    let result;
    if (options.alignLinesSeparately) {
      const lines = text.split("\n").map(line => {
        let cleanedLine = options.trim ? line.trim() : line;
        if (cleanedLine.length >= options.width) return cleanedLine;

        const paddingLength = options.width - cleanedLine.length;
        const padding = options.alignChar.repeat(paddingLength);

        switch (options.alignment) {
          case "left":
            return cleanedLine + padding;
          case "right":
            return padding + cleanedLine;
          case "center":
            const leftPadding = options.alignChar.repeat(Math.floor(paddingLength / 2));
            const rightPadding = options.alignChar.repeat(paddingLength - leftPadding.length);
            return leftPadding + cleanedLine + rightPadding;
          default:
            return cleanedLine;
        }
      });
      result = lines.join("\n");
    } else {
      let cleanedText = options.trim ? text.replace(/\s+/g, " ").trim() : text;
      if (cleanedText.length >= options.width) return cleanedText;

      const paddingLength = options.width - cleanedText.length;
      const padding = options.alignChar.repeat(paddingLength);

      switch (options.alignment) {
        case "left":
          result = cleanedText + padding;
          break;
        case "right":
          result = padding + cleanedText;
          break;
        case "center":
          const leftPadding = options.alignChar.repeat(Math.floor(paddingLength / 2));
          const rightPadding = options.alignChar.repeat(paddingLength - leftPadding.length);
          result = leftPadding + cleanedText + rightPadding;
          break;
        default:
          result = cleanedText;
      }
    }

    return {
      original: text,
      aligned: result,
      changes: getChanges(text, result),
    };
  };

  // Helper to identify changes made
  const getChanges = (original, aligned) => {
    const changes = [];
    if (original === aligned) return ["No changes made"];

    if (options.trim && (original !== original.trim() || (options.alignLinesSeparately && original.split("\n").some(line => line !== line.trim())))) {
      changes.push("Trimmed whitespace");
    }
    changes.push(`Aligned ${options.alignment} with width ${options.width} using "${options.alignChar}"`);
    if (!options.alignLinesSeparately) {
      changes.push("Processed as single block");
    }
    return changes;
  };

  const handleAlign = async () => {
    setError("");
    setAlignedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = alignText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setAlignedText(result.aligned);
    } catch (err) {
      setError("An error occurred while aligning the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setAlignedText("");
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
          Text Aligner
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Align:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-40 resize-y transition-all"
              placeholder="e.g., Hello\nWorld"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Alignment Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Alignment:</label>
                <select
                  value={options.alignment}
                  onChange={(e) => handleOptionChange("alignment", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="center">Center</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Width:</label>
                <input
                  type="number"
                  value={options.width}
                  onChange={(e) => handleOptionChange("width", parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Align Character:</label>
                <input
                  type="text"
                  value={options.alignChar}
                  onChange={(e) => handleOptionChange("alignChar", e.target.value.slice(0, 1))}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  maxLength="1"
                  placeholder=" "
                />
              </div>
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
                  checked={options.alignLinesSeparately}
                  onChange={() => handleOptionChange("alignLinesSeparately", !options.alignLinesSeparately)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span>Align Lines Separately</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleAlign}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-teal-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {isLoading ? "Aligning..." : "Align Text"}
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
        {alignedText && (
          <div className="mt-8 p-6 bg-teal-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Aligned Text
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all">
              {alignedText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {alignText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(alignedText)}
              className="mt-4 w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all font-semibold"
            >
              Copy Aligned Text to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextAligner;