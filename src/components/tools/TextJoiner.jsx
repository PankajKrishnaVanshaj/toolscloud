"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaLink,
} from "react-icons/fa";

const TextJoiner = () => {
  const [inputText, setInputText] = useState("");
  const [joinedText, setJoinedText] = useState("");
  const [joinResult, setJoinResult] = useState(null); // New state for full result
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    separator: ", ",       // Default separator
    trimLines: true,
    ignoreEmpty: true,
    customSeparator: "",   // For custom separator input
    joinMethod: "lines",   // lines, custom, words
    prefix: "",            // Add prefix to each segment
    suffix: "",            // Add suffix to each segment
    preserveCase: true,    // Preserve original case
    maxLines: 0,           // Limit number of lines (0 = unlimited)
  });

  const joinText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to join" };
    }

    let segments = [];
    switch (options.joinMethod) {
      case "lines":
        segments = text.split("\n");
        break;
      case "custom":
        if (!options.customSeparator) return { error: "Custom separator cannot be empty" };
        segments = text.split(options.customSeparator);
        break;
      case "words":
        segments = text.split(/\s+/);
        break;
      default:
        return { error: "Invalid join method" };
    }

    // Apply transformations
    if (options.trimLines) {
      segments = segments.map(segment => segment.trim());
    }
    if (options.ignoreEmpty) {
      segments = segments.filter(segment => segment.length > 0);
    }
    if (options.maxLines > 0 && segments.length > options.maxLines) {
      segments = segments.slice(0, options.maxLines);
    }
    if (!options.preserveCase) {
      segments = segments.map(segment => segment.toLowerCase());
    }

    if (segments.length === 0) {
      return { error: "No valid segments to join after filtering" };
    }

    const separator = options.joinMethod === "lines" || options.joinMethod === "words" ? options.separator : options.customSeparator;
    const joinedSegments = segments.map(segment => `${options.prefix}${segment}${options.suffix}`);
    const result = joinedSegments.join(separator);

    return {
      original: text,
      joined: result,
      segmentCount: segments.length,
      changes: getChanges(segments.length),
    };
  };

  const getChanges = (segmentCount) => {
    const changes = [`Joined ${segmentCount} segments using ${options.joinMethod}`];
    const separator = options.joinMethod === "lines" || options.joinMethod === "words" ? options.separator : options.customSeparator;
    changes.push(`Separator: "${separator}"`);
    if (options.trimLines) changes.push("Trimmed segments");
    if (options.ignoreEmpty) changes.push("Ignored empty segments");
    if (!options.preserveCase) changes.push("Converted to lowercase");
    if (options.maxLines > 0) changes.push(`Limited to ${options.maxLines} segments`);
    if (options.prefix) changes.push(`Added prefix "${options.prefix}"`);
    if (options.suffix) changes.push(`Added suffix "${options.suffix}"`);
    return changes;
  };

  const handleJoin = useCallback(async () => {
    setError("");
    setJoinedText("");
    setJoinResult(null);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = joinText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setJoinedText(result.joined);
        setJoinResult(result);
        setHistory(prev => [...prev, { input: inputText, output: result.joined, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setJoinedText("");
    setJoinResult(null);
    setError("");
    setOptions({
      separator: ", ",
      trimLines: true,
      ignoreEmpty: true,
      customSeparator: "",
      joinMethod: "lines",
      prefix: "",
      suffix: "",
      preserveCase: true,
      maxLines: 0,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(0, value) : value,
    }));
  };

  const exportJoinedText = () => {
    const content = `Original Text:\n${inputText}\n\nJoined Text:\n${joinedText}\n\nChanges:\n${joinResult ? joinResult.changes.join("\n") : "No changes available"}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `joined_text_${options.joinMethod}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Joiner
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Join:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-48 resize-y transition-all"
              placeholder="e.g., Apple\nBanana\nOrange"
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Joining Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Join Method:</label>
                <select
                  value={options.joinMethod}
                  onChange={(e) => handleOptionChange("joinMethod", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="lines">Lines (Newline)</option>
                  <option value="custom">Custom Separator</option>
                  <option value="words">Words (Whitespace)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <input
                  type="text"
                  value={options.joinMethod === "lines" || options.joinMethod === "words" ? options.separator : options.customSeparator}
                  onChange={(e) => handleOptionChange(options.joinMethod === "lines" || options.joinMethod === "words" ? "separator" : "customSeparator", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  maxLength="10"
                  placeholder={options.joinMethod === "lines" || options.joinMethod === "words" ? ", " : "Enter separator"}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prefix (optional):</label>
                <input
                  type="text"
                  value={options.prefix}
                  onChange={(e) => handleOptionChange("prefix", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  maxLength="10"
                  placeholder="e.g., ["
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Suffix (optional):</label>
                <input
                  type="text"
                  value={options.suffix}
                  onChange={(e) => handleOptionChange("suffix", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  maxLength="10"
                  placeholder="e.g., ]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Segments (0 = unlimited):</label>
                <input
                  type="number"
                  value={options.maxLines}
                  onChange={(e) => handleOptionChange("maxLines", parseInt(e.target.value) || 0)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                  max="1000"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.trimLines}
                    onChange={() => handleOptionChange("trimLines", !options.trimLines)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Trim Segments</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.ignoreEmpty}
                    onChange={() => handleOptionChange("ignoreEmpty", !options.ignoreEmpty)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Ignore Empty Segments</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveCase}
                    onChange={() => handleOptionChange("preserveCase", !options.preserveCase)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Preserve Case</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleJoin}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-teal-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              <FaLink className="inline mr-2" />
              {isLoading ? "Joining..." : "Join Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {joinedText && (
              <button
                onClick={exportJoinedText}
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
        {joinedText && joinResult && (
          <div className="mt-8 p-6 bg-teal-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Joined Text ({joinResult.segmentCount} segments)
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap max-h-64 overflow-auto">
              {joinedText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {joinResult.changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(joinedText)}
              className="mt-4 w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Joined Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Joins (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.joinMethod}: "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setJoinedText(entry.output);
                      setOptions(entry.options);
                      setJoinResult(joinText(entry.input)); // Restore full result
                    }}
                    className="text-teal-500 hover:text-teal-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-teal-100 rounded-lg border border-teal-300">
          <h3 className="font-semibold text-teal-700">Features</h3>
          <ul className="list-disc list-inside text-teal-600 text-sm">
            <li>Join by lines, custom separator, or words</li>
            <li>Custom prefix, suffix, and separator</li>
            <li>Trim, ignore empty, preserve case, and limit segments</li>
            <li>Export joined text and history tracking</li>
            <li>Supports up to 10000 characters</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextJoiner;