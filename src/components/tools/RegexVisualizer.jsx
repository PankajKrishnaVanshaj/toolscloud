"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaPlay } from "react-icons/fa";

const RegexVisualizer = () => {
  const [regexInput, setRegexInput] = useState("");
  const [testText, setTestText] = useState("");
  const [flags, setFlags] = useState("g");
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [replaceText, setReplaceText] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const inputRef = useRef(null);

  const analyzeRegex = useCallback(() => {
    setError(null);
    setMatches([]);

    if (!regexInput.trim()) return;

    try {
      const regex = new RegExp(regexInput, flags);
      const text = testText || "";
      const matchResults = [];
      let match;

      regex.lastIndex = 0;
      while ((match = regex.exec(text)) !== null) {
        matchResults.push({
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          groups: match.slice(1),
        });
        if (match[0].length === 0) regex.lastIndex++;
      }

      setMatches(matchResults);
      setHistory((prev) => [...prev.slice(-4), { regex: regexInput, flags, timestamp: new Date() }].slice(-5));
    } catch (err) {
      setError("Invalid regex: " + err.message);
    }
  }, [regexInput, flags, testText]);

  // Debounced analysis
  const debouncedAnalyze = useCallback(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const timeout = setTimeout(analyzeRegex, 300);
    setDebounceTimeout(timeout);
  }, [analyzeRegex, debounceTimeout]);

  useEffect(() => {
    debouncedAnalyze();
    return () => clearTimeout(debounceTimeout);
  }, [regexInput, testText, flags, debouncedAnalyze]);

  const highlightMatches = () => {
    if (!testText || matches.length === 0) return testText || "No text provided";

    let result = [];
    let lastIndex = 0;

    matches.forEach((match, index) => {
      if (match.start > lastIndex) {
        result.push(testText.slice(lastIndex, match.start));
      }
      result.push(
        <span
          key={index}
          className="bg-yellow-200 px-1 rounded transition-all duration-200 hover:bg-yellow-300"
          title={`Match ${index + 1}: ${match.start}-${match.end}`}
        >
          {match.text}
        </span>
      );
      lastIndex = match.end;
    });

    if (lastIndex < testText.length) {
      result.push(testText.slice(lastIndex));
    }
    return result;
  };

  const handleFlagChange = (flag) => {
    setFlags(flags.includes(flag) ? flags.replace(flag, "") : flags + flag);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(regexInput);
    alert("Regex copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([`/${regexInput}/${flags}\n\nTest Text:\n${testText}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `regex-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReplace = () => {
    try {
      const regex = new RegExp(regexInput, flags);
      const replacedText = testText.replace(regex, replaceText);
      setTestText(replacedText);
      setShowReplace(false);
    } catch (err) {
      setError("Invalid regex for replacement: " + err.message);
    }
  };

  const loadHistoryItem = (item) => {
    setRegexInput(item.regex);
    setFlags(item.flags);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Regex Visualizer</h2>

        {/* Regex Input */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Regular Expression</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                ref={inputRef}
                type="text"
                value={regexInput}
                onChange={(e) => setRegexInput(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="/[a-z]+/"
              />
              <button
                onClick={handleCopy}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Copy Regex"
              >
                <FaCopy />
              </button>
              <button
                onClick={handleDownload}
                className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Download"
              >
                <FaDownload />
              </button>
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-4">
            {["g", "i", "m", "u", "y"].map((flag) => (
              <label key={flag} className="flex items-center">
                <input
                  type="checkbox"
                  checked={flags.includes(flag)}
                  onChange={() => handleFlagChange(flag)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{flag} ({flag === "g" ? "global" : flag === "i" ? "ignore case" : flag === "m" ? "multiline" : flag === "u" ? "unicode" : "sticky"})</span>
              </label>
            ))}
          </div>

          {/* Test Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Test Text</label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full h-32 sm:h-48 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter text to test your regex against"
            />
          </div>

          {/* Replace Feature */}
          <div>
            <button
              onClick={() => setShowReplace(!showReplace)}
              className="w-full sm:w-auto py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaPlay className="mr-2" /> {showReplace ? "Hide Replace" : "Show Replace"}
            </button>
            {showReplace && (
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Replacement text (supports $1, $2, etc. for groups)"
                />
                <button
                  onClick={handleReplace}
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Replace
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Visualization */}
        {(regexInput || testText) && (
          <div className="mt-6 space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Matches Visualization</h3>
              <div className="text-sm text-gray-800 whitespace-pre-wrap min-h-[2rem]">{highlightMatches()}</div>
              {matches.length === 0 && testText && (
                <p className="text-gray-600 italic mt-2">No matches found</p>
              )}
            </div>

            {matches.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Match Details</h3>
                <ul className="space-y-3 text-sm">
                  {matches.map((match, index) => (
                    <li key={index} className="border-b pb-2 last:border-b-0">
                      <span className="font-mono bg-gray-100 px-1 rounded">"{match.text}"</span>
                      <span className="text-gray-600"> (at {match.start}-{match.end})</span>
                      {match.groups.length > 0 && (
                        <ul className="ml-6 mt-1 list-disc text-gray-700">
                          {match.groups.map((group, gIndex) => (
                            <li key={gIndex}>
                              Group {gIndex + 1}: <span className="font-mono">"{group}"</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Recent Regex Patterns</h3>
            <ul className="space-y-2 text-sm">
              {history.slice().reverse().map((item, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="font-mono truncate max-w-[70%]">/{item.regex}/{item.flags}</span>
                  <button
                    onClick={() => loadHistoryItem(item)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Load
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time regex matching</li>
            <li>Support for all standard flags (g, i, m, u, y)</li>
            <li>Visual highlighting of matches</li>
            <li>Detailed match information with groups</li>
            <li>Replace functionality with capture group support</li>
            <li>History of recent patterns</li>
            <li>Copy and download options</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegexVisualizer;