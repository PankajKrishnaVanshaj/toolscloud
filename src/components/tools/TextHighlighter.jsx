"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaHighlighter,
} from "react-icons/fa";

const TextHighlighter = () => {
  const [inputText, setInputText] = useState("");
  const [highlightedText, setHighlightedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    highlightWords: "",
    highlightPattern: "",
    caseSensitive: false,
    highlightColor: "#ffff00",
    bold: false,
    italic: false,             // Apply italic styling
    underline: false,          // Apply underline styling
    matchWholeWords: true,     // Match whole words only for words/pattern
    highlightMultiple: false,  // Allow multiple highlight colors
    secondaryColor: "#ffcc00", // Secondary highlight color for multiple highlights
  });

  const highlightText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to highlight" };
    }

    let result = text;
    const changes = [];
    const escapeHtml = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const getStyle = (color) => {
      let style = `background-color: ${color}`;
      if (options.bold) style += "; font-weight: bold";
      if (options.italic) style += "; font-style: italic";
      if (options.underline) style += "; text-decoration: underline";
      return style;
    };

    // Highlight specific words/phrases
    if (options.highlightWords) {
      const words = options.highlightWords.split(",").map(w => w.trim()).filter(w => w);
      if (words.length > 0) {
        let patternStr = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|");
        if (options.matchWholeWords) patternStr = `\\b(${patternStr})\\b`;
        const pattern = new RegExp(patternStr, options.caseSensitive ? "g" : "gi");
        let matchIndex = 0;
        result = result.replace(pattern, match => {
          const color = options.highlightMultiple && matchIndex % 2 === 1 ? options.secondaryColor : options.highlightColor;
          changes.push(`Highlighted word: "${match}" with ${color}`);
          matchIndex++;
          return `<span style="${getStyle(color)}">${escapeHtml(match)}</span>`;
        });
      }
    }

    // Highlight using custom regex
    if (options.highlightPattern) {
      try {
        let patternStr = options.highlightPattern;
        if (options.matchWholeWords) patternStr = `\\b${patternStr}\\b`;
        const regex = new RegExp(patternStr, options.caseSensitive ? "g" : "gi");
        let matchIndex = 0;
        result = result.replace(regex, match => {
          const color = options.highlightMultiple && matchIndex % 2 === 1 ? options.secondaryColor : options.highlightColor;
          changes.push(`Highlighted pattern match: "${match}" with ${color}`);
          matchIndex++;
          return `<span style="${getStyle(color)}">${escapeHtml(match)}</span>`;
        });
      } catch (err) {
        return { error: `Invalid regex pattern: ${err.message}` };
      }
    }

    return {
      original: text,
      highlighted: result,
      changes: changes.length > 0 ? changes : ["No highlights applied"],
    };
  };

  const handleHighlight = useCallback(async () => {
    setError("");
    setHighlightedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = highlightText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setHighlightedText(result.highlighted);
        setHistory(prev => [...prev, { input: inputText, output: result.highlighted, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setHighlightedText("");
    setError("");
    setOptions({
      highlightWords: "",
      highlightPattern: "",
      caseSensitive: false,
      highlightColor: "#ffff00",
      bold: false,
      italic: false,
      underline: false,
      matchWholeWords: true,
      highlightMultiple: false,
      secondaryColor: "#ffcc00",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const exportHighlightedText = () => {
    const content = `Input Text:\n${inputText}\n\nHighlighted Text (HTML):\n${highlightedText}\n\nChanges:\n${highlightText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "highlighted_text.html";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Highlighter
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
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-48 resize-y transition-all"
              placeholder="e.g., The quick brown fox jumps over the lazy dog."
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Highlighting Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Highlight Words (comma-separated):</label>
                <input
                  type="text"
                  value={options.highlightWords}
                  onChange={(e) => handleOptionChange("highlightWords", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="e.g., quick, fox"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Highlight Pattern (regex):</label>
                <input
                  type="text"
                  value={options.highlightPattern}
                  onChange={(e) => handleOptionChange("highlightPattern", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="e.g., \d+"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Primary Highlight Color:</label>
                <input
                  type="color"
                  value={options.highlightColor}
                  onChange={(e) => handleOptionChange("highlightColor", e.target.value)}
                  className="w-full h-10 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              {options.highlightMultiple && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Secondary Highlight Color:</label>
                  <input
                    type="color"
                    value={options.secondaryColor}
                    onChange={(e) => handleOptionChange("secondaryColor", e.target.value)}
                    className="w-full h-10 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
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
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.italic}
                    onChange={() => handleOptionChange("italic", !options.italic)}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span>Italic Text</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.underline}
                    onChange={() => handleOptionChange("underline", !options.underline)}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span>Underline Text</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.matchWholeWords}
                    onChange={() => handleOptionChange("matchWholeWords", !options.matchWholeWords)}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span>Match Whole Words</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.highlightMultiple}
                    onChange={() => handleOptionChange("highlightMultiple", !options.highlightMultiple)}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span>Alternate Colors</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleHighlight}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-yellow-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              <FaHighlighter className="inline mr-2" />
              {isLoading ? "Highlighting..." : "Highlight Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {highlightedText && (
              <button
                onClick={exportHighlightedText}
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
        {highlightedText && (
          <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Highlighted Text
            </h2>
            <div
              className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-words max-h-64 overflow-auto"
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
              onClick={() => navigator.clipboard.writeText(inputText)}
              className="mt-4 w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Original Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Highlights (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    "{entry.input.slice(0, 30)}{entry.input.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setHighlightedText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-yellow-500 hover:text-yellow-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
          <h3 className="font-semibold text-yellow-700">Features</h3>
          <ul className="list-disc list-inside text-yellow-600 text-sm">
            <li>Highlight specific words or regex patterns</li>
            <li>Customizable colors with alternating option</li>
            <li>Bold, italic, and underline styling</li>
            <li>Whole word matching and case sensitivity</li>
            <li>Export highlighted HTML and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextHighlighter;