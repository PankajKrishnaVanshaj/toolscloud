"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaEyeSlash,
} from "react-icons/fa";

const TextRedactor = () => {
  const [inputText, setInputText] = useState("");
  const [redactedText, setRedactedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    redactionChar: "*",
    redactWords: "",
    redactPattern: "",
    caseSensitive: false,
    redactNumbers: false,
    redactEmails: false,
    preserveLength: true,
    redactPhones: false,       // Redact phone numbers
    redactURLs: false,         // Redact URLs
    redactWholeWords: true,    // Match whole words only
    redactLines: false,        // Redact entire lines containing matches
    customReplacement: "",     // Custom string to replace matches
  });

  const redactText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to redact" };
    }

    let result = text;
    const changes = [];
    const lines = text.split("\n");

    const redactMatch = (match) => {
      changes.push(`Redacted: "${match}"`);
      return options.customReplacement
        ? options.customReplacement
        : options.preserveLength
        ? options.redactionChar.repeat(match.length)
        : options.redactionChar;
    };

    const applyRedaction = (pattern, description) => {
      if (options.redactLines) {
        result = lines.map(line => {
          if (pattern.test(line)) {
            changes.push(`${description}: "${line.trim()}"`);
            return options.customReplacement
              ? options.customReplacement
              : options.preserveLength
              ? options.redactionChar.repeat(line.length)
              : options.redactionChar;
          }
          return line;
        }).join("\n");
      } else {
        result = result.replace(pattern, redactMatch);
      }
    };

    // Redact specific words/phrases
    if (options.redactWords) {
      const words = options.redactWords.split(",").map(w => w.trim()).filter(w => w);
      if (words.length > 0) {
        let patternStr = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|");
        if (options.redactWholeWords) patternStr = `\\b(${patternStr})\\b`;
        const pattern = new RegExp(patternStr, options.caseSensitive ? "g" : "gi");
        applyRedaction(pattern, "Redacted word");
      }
    }

    // Redact numbers
    if (options.redactNumbers) {
      const pattern = /\d+/g;
      applyRedaction(pattern, "Redacted number");
    }

    // Redact email addresses
    if (options.redactEmails) {
      const pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      applyRedaction(pattern, "Redacted email");
    }

    // Redact phone numbers
    if (options.redactPhones) {
      const pattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
      applyRedaction(pattern, "Redacted phone number");
    }

    // Redact URLs
    if (options.redactURLs) {
      const pattern = /https?:\/\/[^\s]+/g;
      applyRedaction(pattern, "Redacted URL");
    }

    // Redact using custom regex
    if (options.redactPattern) {
      try {
        let patternStr = options.redactPattern;
        if (options.redactWholeWords) patternStr = `\\b${patternStr}\\b`;
        const regex = new RegExp(patternStr, options.caseSensitive ? "g" : "gi");
        applyRedaction(regex, "Redacted custom pattern match");
      } catch (err) {
        return { error: `Invalid regex pattern: ${err.message}` };
      }
    }

    return {
      original: text,
      redacted: result,
      changes: changes.length > 0 ? changes : ["No redactions applied"],
    };
  };

  const handleRedact = useCallback(async () => {
    setError("");
    setRedactedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = redactText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setRedactedText(result.redacted);
        setHistory(prev => [...prev, { input: inputText, output: result.redacted, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setRedactedText("");
    setError("");
    setOptions({
      redactionChar: "*",
      redactWords: "",
      redactPattern: "",
      caseSensitive: false,
      redactNumbers: false,
      redactEmails: false,
      preserveLength: true,
      redactPhones: false,
      redactURLs: false,
      redactWholeWords: true,
      redactLines: false,
      customReplacement: "",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const exportRedactedText = () => {
    const content = `Original Text:\n${inputText}\n\nRedacted Text:\n${redactedText}\n\nChanges:\n${redactText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "redacted_text.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Redactor
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Redact:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-48 resize-y transition-all"
              placeholder="e.g., John Doe, email: john.doe@example.com, phone: 123-456-7890, https://example.com"
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Redaction Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Redaction Character:</label>
                <input
                  type="text"
                  value={options.redactionChar}
                  onChange={(e) => handleOptionChange("redactionChar", e.target.value || "*")}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  maxLength="10"
                  placeholder="*"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Replacement (optional):</label>
                <input
                  type="text"
                  value={options.customReplacement}
                  onChange={(e) => handleOptionChange("customReplacement", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  maxLength="20"
                  placeholder="e.g., [REDACTED]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Redact Words (comma-separated):</label>
                <input
                  type="text"
                  value={options.redactWords}
                  onChange={(e) => handleOptionChange("redactWords", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., John, Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Regex:</label>
                <input
                  type="text"
                  value={options.redactPattern}
                  onChange={(e) => handleOptionChange("redactPattern", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., \d{3}"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.caseSensitive}
                    onChange={() => handleOptionChange("caseSensitive", !options.caseSensitive)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span>Case Sensitive</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.redactNumbers}
                    onChange={() => handleOptionChange("redactNumbers", !options.redactNumbers)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span>Redact Numbers</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.redactEmails}
                    onChange={() => handleOptionChange("redactEmails", !options.redactEmails)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span>Redact Emails</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.redactPhones}
                    onChange={() => handleOptionChange("redactPhones", !options.redactPhones)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span>Redact Phone Numbers</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.redactURLs}
                    onChange={() => handleOptionChange("redactURLs", !options.redactURLs)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span>Redact URLs</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveLength}
                    onChange={() => handleOptionChange("preserveLength", !options.preserveLength)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span>Preserve Length</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.redactWholeWords}
                    onChange={() => handleOptionChange("redactWholeWords", !options.redactWholeWords)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span>Whole Words Only</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.redactLines}
                    onChange={() => handleOptionChange("redactLines", !options.redactLines)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span>Redact Entire Lines</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleRedact}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <FaEyeSlash className="inline mr-2" />
              {isLoading ? "Redacting..." : "Redact Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {redactedText && (
              <button
                onClick={exportRedactedText}
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
        {redactedText && (
          <div className="mt-8 p-6 bg-red-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Redacted Text
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap max-h-64 overflow-auto">
              {redactedText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {redactText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(redactedText)}
              className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Redacted Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Redactions (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setRedactedText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-red-100 rounded-lg border border-red-300">
          <h3 className="font-semibold text-red-700">Features</h3>
          <ul className="list-disc list-inside text-red-600 text-sm">
            <li>Redact words, numbers, emails, phones, URLs, and custom patterns</li>
            <li>Custom redaction character or string</li>
            <li>Preserve length, whole words, and line-based redaction</li>
            <li>Case sensitivity and detailed change tracking</li>
            <li>Export redacted text and history functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextRedactor;