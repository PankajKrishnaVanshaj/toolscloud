"use client";

import React, { useState, useCallback } from "react";
import { AiOutlineClear, AiOutlineSearch, AiOutlineCopy, AiOutlineDownload } from "react-icons/ai";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegexTester = () => {
  const [text, setText] = useState("");
  const [regexPattern, setRegexPattern] = useState("");
  const [matches, setMatches] = useState([]);
  const [regexError, setRegexError] = useState("");
  const [options, setOptions] = useState({
    caseInsensitive: false,
    multiline: false,
    global: true,
    showGroups: false,
  });
  const [showText, setShowText] = useState(true);

  const handleTestRegex = useCallback(() => {
    try {
      const flags = `${options.global ? "g" : ""}${options.caseInsensitive ? "i" : ""}${options.multiline ? "m" : ""}`;
      const regex = new RegExp(regexPattern, flags);
      const foundMatches = [...text.matchAll(regex)];
      setMatches(foundMatches);
      setRegexError("");
    } catch (error) {
      setMatches([]);
      setRegexError(`Invalid Regex Pattern: ${error.message}`);
    }
  }, [regexPattern, text, options]);

  const handleClear = () => {
    setText("");
    setRegexPattern("");
    setMatches([]);
    setRegexError("");
  };

  const handleCopyToClipboard = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
  };

  const handleDownloadResults = () => {
    const content = matches.map((m, i) => `Match ${i}: ${m[0]} (Index: ${m.index})`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `regex-matches-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getHighlightedText = () => {
    if (!text || matches.length === 0) return text;

    let lastIndex = 0;
    const highlighted = [];

    matches.forEach((match, index) => {
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;

      if (lastIndex < startIndex) {
        highlighted.push(
          <span key={`text-${lastIndex}`} className="text-gray-700">{text.slice(lastIndex, startIndex)}</span>
        );
      }

      highlighted.push(
        <span key={`match-${index}`} className="bg-yellow-200 px-1 rounded font-medium">
          {match[0]}
        </span>
      );

      lastIndex = endIndex;
    });

    if (lastIndex < text.length) {
      highlighted.push(
        <span key={`text-end`} className="text-gray-700">{text.slice(lastIndex)}</span>
      );
    }

    return highlighted;
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full bg-white shadow-xl rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Regex Tester</h1>

        {/* Text Input */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Input Text</label>
            <button
              onClick={() => setShowText(!showText)}
              className="text-gray-600 hover:text-gray-800"
            >
              {showText ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {showText && (
            <textarea
              className="w-full h-32 sm:h-48 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
              placeholder="Enter text to test your regex against..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="Input Text"
            />
          )}
        </div>

        {/* Regex Pattern and Options */}
        <div className="mb-6">
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Enter regex pattern (e.g., \d+ for numbers)"
            value={regexPattern}
            onChange={(e) => setRegexPattern(e.target.value)}
            aria-label="Regex Pattern"
          />
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(options).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleTestRegex}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            disabled={!regexPattern || !text}
          >
            <AiOutlineSearch className="mr-2" /> Test Regex
          </button>
          <button
            onClick={handleClear}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <AiOutlineClear className="mr-2" /> Clear
          </button>
          <button
            onClick={handleDownloadResults}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            disabled={matches.length === 0}
          >
            <AiOutlineDownload className="mr-2" /> Download Matches
          </button>
        </div>

        {/* Results */}
        <div className="mb-6">
          {regexError ? (
            <p className="text-red-600 font-medium">{regexError}</p>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Matches Found: {matches.length}
              </h3>
              {matches.length > 0 && (
                <>
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 max-h-40 overflow-auto">
                    {matches.map((match, index) => (
                      <div key={index} className="mb-2 flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
                        <div>
                          <span className="bg-yellow-200 px-2 py-1 rounded">{match[0]}</span>
                          <span className="ml-2 text-gray-600 text-sm">
                            (Index: {match.index}, Length: {match[0].length})
                          </span>
                          {options.showGroups && match.length > 1 && (
                            <div className="mt-1 text-xs text-gray-500">
                              Groups: {match.slice(1).map((g, i) => (
                                <span key={i} className="mx-1">[{i + 1}: {g}]</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleCopyToClipboard(match[0])}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <AiOutlineCopy className="mr-1" /> Copy
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 max-h-40 overflow-auto font-mono text-sm">
                    {getHighlightedText()}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Features List */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time regex testing with highlighting</li>
            <li>Support for global, case-insensitive, and multiline flags</li>
            <li>Display capture groups (optional)</li>
            <li>Copy individual matches to clipboard</li>
            <li>Download all matches as text file</li>
            <li>Toggle input text visibility</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;