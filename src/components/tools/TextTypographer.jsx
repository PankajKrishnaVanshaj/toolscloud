"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaFont,
} from "react-icons/fa";

const TextTypographer = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    smartQuotes: true,
    properDashes: true,
    ellipsis: true,
    spacing: true,
    ligatures: false,         // Add common ligatures (e.g., fi → ﬁ)
    removeWidows: false,      // Prevent single-word lines
    customSpacingBefore: "",  // Custom spacing before punctuation
    customSpacingAfter: "",   // Custom spacing after punctuation
  });

  const enhanceTypography = useCallback((text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to enhance" };
    }

    let result = text;
    const changes = [];

    // Smart Quotes
    if (options.smartQuotes) {
      result = result
        .replace(/(^|\s)'(\w)/g, "$1‘$2")
        .replace(/(\w)'(\w)/g, "$1’$2")
        .replace(/(^|\s)"(\w)/g, "$1“$2")
        .replace(/(\w)"(\w|$)/g, "$1”$2");
      if (text.match(/['"]/)) changes.push("Converted straight quotes to smart quotes");
    }

    // Proper Dashes
    if (options.properDashes) {
      result = result
        .replace(/\s*--\s*/g, "—")
        .replace(/\s*-\s*/g, " – ");
      if (text.match(/--| - /)) changes.push("Replaced hyphens with proper dashes");
    }

    // Ellipsis
    if (options.ellipsis) {
      result = result.replace(/\.{3,}/g, "…");
      if (text.match(/\.{3,}/)) changes.push("Converted triple dots to ellipsis");
    }

    // Ligatures
    if (options.ligatures) {
      result = result
        .replace(/fi/g, "ﬁ")
        .replace(/fl/g, "ﬂ")
        .replace(/ff/g, "ﬀ")
        .replace(/ffi/g, "ﬃ")
        .replace(/ffl/g, "ﬄ");
      if (text.match(/fi|fl|ff|ffi|ffl/)) changes.push("Added common ligatures");
    }

    // Custom Spacing
    if (options.spacing) {
      result = result
        .replace(/\s+/g, " ")
        .replace(/\s+([.!?])/g, "$1")
        .trim();
      if (text.match(/\s{2,}|\s[.!?]/)) changes.push("Fixed spacing issues");
    }
    if (options.customSpacingBefore) {
      const spacing = " ".repeat(Math.min(5, parseInt(options.customSpacingBefore) || 0));
      result = result.replace(/([.!?])/g, `${spacing}$1`);
      changes.push(`Added ${options.customSpacingBefore} spaces before punctuation`);
    }
    if (options.customSpacingAfter) {
      const spacing = " ".repeat(Math.min(5, parseInt(options.customSpacingAfter) || 0));
      result = result.replace(/([.!?])/g, `$1${spacing}`);
      changes.push(`Added ${options.customSpacingAfter} spaces after punctuation`);
    }

    // Remove Widows
    if (options.removeWidows) {
      const sentences = result.split(/(?<=[.!?])\s+/);
      result = sentences.map(sentence => {
        const words = sentence.trim().split(" ");
        if (words.length > 1 && words[words.length - 1].length <= 3) {
          words[words.length - 2] += "\u00A0" + words.pop(); // Non-breaking space
          changes.push(`Prevented widow in: "${sentence.trim()}"`);
        }
        return words.join(" ");
      }).join(" ");
    }

    return {
      original: text,
      enhanced: result,
      changes: changes.length > 0 ? changes : ["No significant changes made"],
    };
  }, [options]);

  const handleEnhance = async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = enhanceTypography(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setOutputText(result.enhanced);
        setHistory(prev => [...prev, { input: inputText, output: result.enhanced, changes: result.changes, options: { ...options } }].slice(-5));
      }
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
    setOptions({
      smartQuotes: true,
      properDashes: true,
      ellipsis: true,
      spacing: true,
      ligatures: false,
      removeWidows: false,
      customSpacingBefore: "",
      customSpacingAfter: "",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "string" ? value : !prev[option],
    }));
  };

  const exportEnhancedText = () => {
    const result = enhanceTypography(inputText);
    const content = `Original Text:\n${result.original}\n\nEnhanced Text:\n${result.enhanced}\n\nChanges Applied:\n${result.changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `enhanced_typography_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Typographer
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-40 sm:h-48 resize-y transition-all"
              placeholder='e.g., He said -- "Hello world..."'
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Typography Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(options).map(([key, value]) => (
                key.startsWith("customSpacing") ? (
                  <div key={key}>
                    <label className="block text-sm text-gray-600 mb-1">
                      {key.replace(/([A-Z])/g, " $1").trim()} (0-5):
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleOptionChange(key, Math.min(5, Math.max(0, parseInt(e.target.value) || 0)).toString())}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      max="5"
                    />
                  </div>
                ) : (
                  <label key={key} className="flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleOptionChange(key)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <span>{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  </label>
                )
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleEnhance}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <FaFont className="inline mr-2" />
              {isLoading ? "Processing..." : "Enhance"}
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
                onClick={exportEnhancedText}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
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
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Enhanced Text</h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap max-h-64 overflow-y-auto">
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
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
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
              <FaHistory className="mr-2" /> Recent Enhancements (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>"{entry.input.slice(0, 20)}..." → "{entry.output.slice(0, 20)}..."</span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setOutputText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-green-500 hover:text-green-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-300">
          <h3 className="font-semibold text-green-700">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm">
            <li>Smart quotes, proper dashes, and ellipsis conversion</li>
            <li>Ligature support (fi, fl, ff, etc.)</li>
            <li>Widow prevention with non-breaking spaces</li>
            <li>Customizable spacing before/after punctuation</li>
            <li>Export results and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextTypographer;