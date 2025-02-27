"use client";
import React, { useState } from "react";

const TextHighlighter = () => {
  const [inputText, setInputText] = useState("");
  const [highlightedText, setHighlightedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    highlightWords: "",         // Comma-separated words/phrases to highlight
    highlightPattern: "",      // Custom regex pattern to highlight
    caseSensitive: false,      // Case sensitivity for matching
    highlightColor: "#ffff00", // Background color for highlights
    bold: false,               // Apply bold styling
  });

  // Highlight text based on options
  const highlightText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to highlight" };
    }

    let result = text;
    const changes = [];

    // Escape HTML to prevent injection in the output
    const escapeHtml = (str) => {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    // Highlight specific words/phrases
    if (options.highlightWords) {
      const words = options.highlightWords.split(",").map(w => w.trim()).filter(w => w);
      if (words.length > 0) {
        const pattern = new RegExp(`\\b(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|")})\\b`, options.caseSensitive ? "g" : "gi");
        result = result.replace(pattern, match => {
          changes.push(`Highlighted word: "${match}"`);
          return `<span style="background-color: ${options.highlightColor}${options.bold ? '; font-weight: bold' : ''}">${escapeHtml(match)}</span>`;
        });
      }
    }

    // Highlight using custom regex
    if (options.highlightPattern) {
      try {
        const regex = new RegExp(options.highlightPattern, options.caseSensitive ? "g" : "gi");
        result = result.replace(regex, match => {
          changes.push(`Highlighted pattern match: "${match}"`);
          return `<span style="background-color: ${options.highlightColor}${options.bold ? '; font-weight: bold' : ''}">${escapeHtml(match)}</span>`;
        });
      } catch (err) {
        return { error: "Invalid custom regex pattern" };
      }
    }

    return {
      original: text,
      highlighted: result,
      changes: changes.length > 0 ? changes : ["No highlights applied"],
    };
  };

  const handleHighlight = async () => {
    setError("");
    setHighlightedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = highlightText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setHighlightedText(result.highlighted);
    } catch (err) {
      setError("An error occurred while highlighting the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setHighlightedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Highlighter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Highlight:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-40 resize-y transition-all"
              placeholder="e.g., The quick brown fox jumps over the lazy dog."
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Highlighting Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Highlight Words (comma-separated):</label>
                <input
                  type="text"
                  value={options.highlightWords}
                  onChange={(e) => handleOptionChange("highlightWords", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="e.g., quick, fox"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Highlight Pattern (regex):</label>
                <input
                  type="text"
                  value={options.highlightPattern}
                  onChange={(e) => handleOptionChange("highlightPattern", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="e.g., \d+"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Highlight Color:</label>
                <input
                  type="color"
                  value={options.highlightColor}
                  onChange={(e) => handleOptionChange("highlightColor", e.target.value)}
                  className="w-full h-10 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.caseSensitive}
                  onChange={() => handleOptionChange("caseSensitive", !options.caseSensitive)}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                />
                <span>Case Sensitive</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.bold}
                  onChange={() => handleOptionChange("bold", !options.bold)}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                />
                <span>Bold Text</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleHighlight}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-yellow-400 cursor-not-allowed"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              {isLoading ? "Highlighting..." : "Highlight Text"}
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
        {highlightedText && (
          <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Highlighted Text
            </h2>
            <div
              className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: highlightedText }}
            />
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {highlightText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(inputText)} // Copies original text, not HTML
              className="mt-4 w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all font-semibold"
            >
              Copy Original Text to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextHighlighter;