"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaEraser,
} from "react-icons/fa";

const TextUnformatter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    removeHTML: true,
    removeSpecialChars: true,
    normalizeSpaces: true,
    removeLineBreaks: false,
    trim: true,
    removeNumbers: false,        // Remove all numbers
    removePunctuation: false,    // Remove punctuation marks
    normalizeUnicode: false,     // Normalize Unicode (e.g., accents)
    customRemovePattern: "",     // Custom regex pattern to remove
    preserveCase: false,         // Keep original case (disable case changes)
  });

  const unformatText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to unformat" };
    }

    let result = text;

    // Normalize Unicode first (e.g., é → e)
    if (options.normalizeUnicode) {
      result = result.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }

    // Remove custom pattern
    if (options.customRemovePattern) {
      try {
        const regex = new RegExp(options.customRemovePattern, "g");
        result = result.replace(regex, "");
      } catch (err) {
        return { error: "Invalid custom regex pattern" };
      }
    }

    // Remove HTML tags
    if (options.removeHTML) {
      result = result.replace(/<[^>]*>/g, "");
    }

    // Remove special characters (excluding punctuation if separate option is off)
    if (options.removeSpecialChars) {
      result = result.replace(/[^a-zA-Z0-9\s\n.,!?]/g, "");
    }

    // Remove punctuation
    if (options.removePunctuation) {
      result = result.replace(/[.,!?;:"'()[\]{}\-]/g, "");
    }

    // Remove numbers
    if (options.removeNumbers) {
      result = result.replace(/\d+/g, "");
    }

    // Normalize spaces
    if (options.normalizeSpaces) {
      result = result.replace(/\s+/g, " ");
    }

    // Remove line breaks
    if (options.removeLineBreaks) {
      result = result.replace(/[\r\n]+/g, " ");
    }

    // Trim
    if (options.trim) {
      result = result.trim();
    }

    return {
      original: text,
      unformatted: result,
      changes: getChanges(text, result),
    };
  };

  const getChanges = (original, unformatted) => {
    const changes = [];
    if (original === unformatted) return ["No changes made"];

    if (options.normalizeUnicode && original.match(/[\u00C0-\u017F]/)) {
      changes.push("Normalized Unicode characters");
    }
    if (options.customRemovePattern && original.match(new RegExp(options.customRemovePattern))) {
      changes.push(`Removed custom pattern: "${options.customRemovePattern}"`);
    }
    if (options.removeHTML && original.match(/<[^>]*>/)) {
      changes.push("Removed HTML tags");
    }
    if (options.removeSpecialChars && original.match(/[^a-zA-Z0-9\s\n.,!?]/)) {
      changes.push("Removed special characters");
    }
    if (options.removePunctuation && original.match(/[.,!?;:"'()[\]{}\-]/)) {
      changes.push("Removed punctuation");
    }
    if (options.removeNumbers && original.match(/\d/)) {
      changes.push("Removed numbers");
    }
    if (options.normalizeSpaces && original.match(/\s{2,}/)) {
      changes.push("Normalized multiple spaces");
    }
    if (options.removeLineBreaks && original.match(/[\r\n]/)) {
      changes.push("Removed line breaks");
    }
    if (options.trim && (original.startsWith(" ") || original.endsWith(" "))) {
      changes.push("Trimmed leading/trailing spaces");
    }
    return changes.length > 0 ? changes : ["Applied basic cleanup"];
  };

  const handleUnformat = useCallback(async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = unformatText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setOutputText(result.unformatted);
        setHistory(prev => [...prev, { input: inputText, output: result.unformatted, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setOutputText("");
    setError("");
    setOptions({
      removeHTML: true,
      removeSpecialChars: true,
      normalizeSpaces: true,
      removeLineBreaks: false,
      trim: true,
      removeNumbers: false,
      removePunctuation: false,
      normalizeUnicode: false,
      customRemovePattern: "",
      preserveCase: false,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value !== undefined ? value : !prev[option] }));
  };

  const exportUnformattedText = () => {
    const content = `Original Text:\n${inputText}\n\nUnformatted Text:\n${outputText}\n\nChanges Applied:\n${unformatText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `unformatted_text_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Unformatter
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-40 sm:h-48 resize-y transition-all"
              placeholder="e.g., <p>Héllo   Wôrld! 123</p> @#$%\n\nTest"
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Unformatting Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                {Object.entries(options).filter(([key]) => key !== "customRemovePattern").map(([key, value]) => (
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
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Remove Pattern (regex):</label>
                <input
                  type="text"
                  value={options.customRemovePattern}
                  onChange={(e) => handleOptionChange("customRemovePattern", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., [xyz]+"
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleUnformat}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              <FaEraser className="inline mr-2" />
              {isLoading ? "Unformatting..." : "Unformat Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {outputText && (
              <button
                onClick={exportUnformattedText}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
              >
                <FaDownload className="inline mr-2" />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Output Display */}
        {outputText && (
          <div className="mt-8 p-6 bg-orange-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Unformatted Text</h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap max-h-64 overflow-y-auto">
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
              <FaCopy className="inline mr-2" />
              Copy to Clipboard
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Unformatting (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>"{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"</span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setOutputText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-orange-500 hover:text-orange-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-orange-100 rounded-lg border border-orange-300">
          <h3 className="font-semibold text-orange-700">Features</h3>
          <ul className="list-disc list-inside text-orange-600 text-sm">
            <li>Remove HTML, special chars, punctuation, and numbers</li>
            <li>Normalize spaces and Unicode characters</li>
            <li>Custom regex pattern removal</li>
            <li>Preserve case option</li>
            <li>Export results and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextUnformatter;