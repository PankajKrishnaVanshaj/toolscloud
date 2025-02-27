"use client";
import React, { useState } from "react";

const TextReverser = () => {
  const [inputText, setInputText] = useState("");
  const [reversedText, setReversedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    reverseType: "characters", // characters, words, lines
    applyToLines: true,        // Apply reversal to each line separately
    preserveCase: true,        // Preserve original case
  });

  // Reverse text based on options
  const reverseText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to reverse" };
    }

    let resultLines = options.applyToLines ? text.split("\n") : [text];
    let reversedLines = [];

    for (let line of resultLines) {
      let reversedLine = line;

      switch (options.reverseType) {
        case "characters":
          reversedLine = line.split("").reverse().join("");
          break;
        case "words":
          const words = line.split(/\s+/).filter(w => w.length > 0);
          reversedLine = words.reverse().join(" ");
          break;
        case "lines":
          reversedLine = line; // Lines are reversed at the end if not line-by-line
          break;
        default:
          return { error: "Invalid reverse type" };
      }

      if (!options.preserveCase) {
        reversedLine = reversedLine.toLowerCase();
      }

      reversedLines.push(reversedLine);
    }

    // Reverse lines if type is "lines" and not applying to lines separately
    if (options.reverseType === "lines" && !options.applyToLines) {
      reversedLines = reversedLines.reverse();
    }

    const result = reversedLines.join("\n");

    return {
      original: text,
      reversed: result,
      changes: getChanges(text, result),
    };
  };

  // Helper to identify changes made
  const getChanges = (original, reversed) => {
    const changes = [];
    if (original === reversed) return ["No changes made"];

    changes.push(`Reversed ${options.reverseType}`);
    if (options.applyToLines && original.includes("\n")) {
      changes.push("Applied to each line separately");
    }
    if (!options.preserveCase) {
      changes.push("Converted to lowercase");
    }
    return changes;
  };

  const handleReverse = async () => {
    setError("");
    setReversedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = reverseText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setReversedText(result.reversed);
    } catch (err) {
      setError("An error occurred while reversing the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setReversedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Reverser
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Reverse:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-40 resize-y transition-all"
              placeholder="e.g., Hello World\nThis is a test"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Reversal Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Reverse Type:</label>
                <select
                  value={options.reverseType}
                  onChange={(e) => handleOptionChange("reverseType", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="characters">Characters</option>
                  <option value="words">Words</option>
                  <option value="lines">Lines</option>
                </select>
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.applyToLines}
                  onChange={() => handleOptionChange("applyToLines", !options.applyToLines)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                />
                <span>Apply to Lines Separately</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.preserveCase}
                  onChange={() => handleOptionChange("preserveCase", !options.preserveCase)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                />
                <span>Preserve Case</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleReverse}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {isLoading ? "Reversing..." : "Reverse Text"}
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
        {reversedText && (
          <div className="mt-8 p-6 bg-orange-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Reversed Text
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all">
              {reversedText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {reverseText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(reversedText)}
              className="mt-4 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold"
            >
              Copy Reversed Text to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextReverser;