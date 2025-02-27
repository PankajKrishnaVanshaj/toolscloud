"use client";
import React, { useState } from "react";

const TextExtractor = () => {
  const [inputText, setInputText] = useState("");
  const [extractedText, setExtractedText] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    extractType: "words",    // words, numbers, emails, urls, custom
    customPattern: "",       // Custom regex pattern for extraction
    caseSensitive: false,    // Case sensitivity for matching
    outputFormat: "list",    // list, string, json
    separator: ", ",         // Separator for string output
  });

  // Extract text based on options
  const extractText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to extract from" };
    }

    let matches = [];
    let pattern;

    switch (options.extractType) {
      case "words":
        pattern = options.caseSensitive ? /\b\w+\b/g : /\b\w+\b/gi;
        matches = [...text.matchAll(pattern)].map(match => match[0]);
        break;
      case "numbers":
        pattern = /\d+/g;
        matches = [...text.matchAll(pattern)].map(match => match[0]);
        break;
      case "emails":
        pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        matches = [...text.matchAll(pattern)].map(match => match[0]);
        break;
      case "urls":
        pattern = /https?:\/\/[^\s]+/g;
        matches = [...text.matchAll(pattern)].map(match => match[0]);
        break;
      case "custom":
        if (!options.customPattern) {
          return { error: "Please enter a custom pattern for extraction" };
        }
        try {
          pattern = new RegExp(options.customPattern, options.caseSensitive ? "g" : "gi");
          matches = [...text.matchAll(pattern)].map(match => match[0]);
        } catch (err) {
          return { error: "Invalid custom regex pattern" };
        }
        break;
      default:
        return { error: "Invalid extract type" };
    }

    if (matches.length === 0) {
      return { error: "No matches found for the specified criteria" };
    }

    // Format output based on options
    let output;
    switch (options.outputFormat) {
      case "list":
        output = matches;
        break;
      case "string":
        output = matches.join(options.separator);
        break;
      case "json":
        output = JSON.stringify(matches, null, 2);
        break;
      default:
        output = matches;
    }

    return {
      original: text,
      extracted: output,
      matchCount: matches.length,
    };
  };

  const handleExtract = async () => {
    setError("");
    setExtractedText([]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = extractText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setExtractedText(result.extracted);
    } catch (err) {
      setError("An error occurred while extracting the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setExtractedText([]);
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Extractor
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Extract From:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-40 resize-y transition-all"
              placeholder="e.g., Contact: john@example.com, Phone: 123-456-7890, Site: https://example.com"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Extraction Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Extract Type:</label>
                <select
                  value={options.extractType}
                  onChange={(e) => handleOptionChange("extractType", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="words">Words</option>
                  <option value="numbers">Numbers</option>
                  <option value="emails">Emails</option>
                  <option value="urls">URLs</option>
                  <option value="custom">Custom Pattern</option>
                </select>
              </div>
              {options.extractType === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Pattern (regex):</label>
                  <input
                    type="text"
                    value={options.customPattern}
                    onChange={(e) => handleOptionChange("customPattern", e.target.value)}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., [A-Z]+"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Format:</label>
                <select
                  value={options.outputFormat}
                  onChange={(e) => handleOptionChange("outputFormat", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="list">List</option>
                  <option value="string">String</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              {options.outputFormat === "string" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                  <input
                    type="text"
                    value={options.separator}
                    onChange={(e) => handleOptionChange("separator", e.target.value)}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    maxLength="10"
                    placeholder=", "
                  />
                </div>
              )}
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.caseSensitive}
                  onChange={() => handleOptionChange("caseSensitive", !options.caseSensitive)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                />
                <span>Case Sensitive</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleExtract}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {isLoading ? "Extracting..." : "Extract Text"}
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
        {extractedText.length > 0 && (
          <div className="mt-8 p-6 bg-orange-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Extracted Text ({options.extractType}, {extractedText.length} matches)
            </h2>
            <div className="mt-3 text-lg text-gray-700">
              {options.outputFormat === "list" ? (
                <ul className="list-disc list-inside space-y-1">
                  {extractedText.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <pre className="whitespace-pre-wrap break-all">{extractedText}</pre>
              )}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(
                options.outputFormat === "list" ? extractedText.join("\n") : extractedText
              )}
              className="mt-4 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold"
            >
              Copy Extracted Text to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextExtractor;