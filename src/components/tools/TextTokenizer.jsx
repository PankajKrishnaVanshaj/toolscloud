"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaCut,
} from "react-icons/fa";

const TextTokenizer = () => {
  const [inputText, setInputText] = useState("");
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    tokenType: "words",       // words, sentences, custom, chars, regex
    customDelimiter: ",",     // For custom tokenization
    trimTokens: true,
    ignoreEmpty: true,
    outputFormat: "list",     // list, string, json, csv
    maxTokens: 0,             // Limit token count (0 = unlimited)
    preserveCase: true,       // Preserve original case
    regexPattern: "",         // Custom regex pattern for tokenization
    sortTokens: false,        // Sort tokens alphabetically
  });

  const tokenizeText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to tokenize" };
    }

    let tokenArray = [];

    switch (options.tokenType) {
      case "words":
        tokenArray = text.split(/\s+/);
        break;
      case "sentences":
        tokenArray = text.split(/[.!?]+/).filter(Boolean);
        break;
      case "custom":
        if (!options.customDelimiter) return { error: "Custom delimiter cannot be empty" };
        tokenArray = text.split(options.customDelimiter);
        break;
      case "chars":
        tokenArray = text.split("");
        break;
      case "regex":
        if (!options.regexPattern) return { error: "Regex pattern cannot be empty" };
        try {
          const regex = new RegExp(options.regexPattern, "g");
          tokenArray = text.split(regex).filter(Boolean);
          // If regex is meant to match tokens, use match instead
          const matches = [...text.matchAll(regex)];
          if (matches.length > 0) {
            tokenArray = matches.map(match => match[0]);
          }
        } catch (e) {
          return { error: "Invalid regex pattern" };
        }
        break;
      default:
        return { error: "Invalid token type" };
    }

    // Apply transformations
    if (!options.preserveCase) {
      tokenArray = tokenArray.map(token => token.toLowerCase());
    }
    if (options.trimTokens) {
      tokenArray = tokenArray.map(token => token.trim());
    }
    if (options.ignoreEmpty) {
      tokenArray = tokenArray.filter(token => token.length > 0);
    }
    if (options.maxTokens > 0 && tokenArray.length > options.maxTokens) {
      tokenArray = tokenArray.slice(0, options.maxTokens);
    }
    if (options.sortTokens) {
      tokenArray = tokenArray.sort((a, b) => a.localeCompare(b));
    }

    if (tokenArray.length === 0) {
      return { error: "No tokens found with the specified options" };
    }

    // Format output
    let output;
    switch (options.outputFormat) {
      case "list":
        output = tokenArray;
        break;
      case "string":
        output = tokenArray.join(" | ");
        break;
      case "json":
        output = JSON.stringify(tokenArray, null, 2);
        break;
      case "csv":
        output = tokenArray.map(t => `"${t.replace(/"/g, '""')}"`).join(",");
        break;
      default:
        output = tokenArray;
    }

    return {
      original: text,
      tokens: output,
      tokenCount: tokenArray.length,
      changes: getChanges(tokenArray.length),
    };
  };

  const getChanges = (tokenCount) => {
    const changes = [`Tokenized into ${tokenCount} ${options.tokenType}`];
    if (options.tokenType === "custom") changes.push(`Delimiter: "${options.customDelimiter}"`);
    if (options.tokenType === "regex") changes.push(`Pattern: "${options.regexPattern}"`);
    if (!options.preserveCase) changes.push("Converted to lowercase");
    if (options.trimTokens) changes.push("Trimmed tokens");
    if (options.ignoreEmpty) changes.push("Ignored empty tokens");
    if (options.maxTokens > 0) changes.push(`Limited to ${options.maxTokens} tokens`);
    if (options.sortTokens) changes.push("Sorted tokens");
    changes.push(`Output as ${options.outputFormat}`);
    return changes;
  };

  const handleTokenize = useCallback(async () => {
    setError("");
    setTokens([]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = tokenizeText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setTokens(result.tokens);
        setHistory(prev => [...prev, { input: inputText, output: result.tokens, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setTokens([]);
    setError("");
    setOptions({
      tokenType: "words",
      customDelimiter: ",",
      trimTokens: true,
      ignoreEmpty: true,
      outputFormat: "list",
      maxTokens: 0,
      preserveCase: true,
      regexPattern: "",
      sortTokens: false,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(0, value) : value,
    }));
  };

  const exportTokens = () => {
    const content = `Original Text:\n${inputText}\n\nTokens (${options.tokenType}, ${tokens.length}):\n${options.outputFormat === "list" ? tokens.join("\n") : tokens}\n\nChanges:\n${tokenizeText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tokens_${options.tokenType}_${options.outputFormat}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Tokenizer
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Tokenize:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-48 resize-y transition-all"
              placeholder="e.g., Hello world! This is a test."
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Tokenization Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Token Type:</label>
                <select
                  value={options.tokenType}
                  onChange={(e) => handleOptionChange("tokenType", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="words">Words</option>
                  <option value="sentences">Sentences</option>
                  <option value="custom">Custom Delimiter</option>
                  <option value="chars">Characters</option>
                  <option value="regex">Regex Pattern</option>
                </select>
              </div>
              {options.tokenType === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Delimiter:</label>
                  <input
                    type="text"
                    value={options.customDelimiter}
                    onChange={(e) => handleOptionChange("customDelimiter", e.target.value || ",")}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    maxLength="10"
                  />
                </div>
              )}
              {options.tokenType === "regex" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Regex Pattern:</label>
                  <input
                    type="text"
                    value={options.regexPattern}
                    onChange={(e) => handleOptionChange("regexPattern", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., [a-z]+"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Format:</label>
                <select
                  value={options.outputFormat}
                  onChange={(e) => handleOptionChange("outputFormat", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="list">List</option>
                  <option value="string">String (Separated)</option>
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Tokens (0 = unlimited):</label>
                <input
                  type="number"
                  value={options.maxTokens}
                  onChange={(e) => handleOptionChange("maxTokens", parseInt(e.target.value) || 0)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min="0"
                  max="1000"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.trimTokens}
                    onChange={() => handleOptionChange("trimTokens", !options.trimTokens)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Trim Tokens</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.ignoreEmpty}
                    onChange={() => handleOptionChange("ignoreEmpty", !options.ignoreEmpty)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Ignore Empty Tokens</span>
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
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.sortTokens}
                    onChange={() => handleOptionChange("sortTokens", !options.sortTokens)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Sort Tokens</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleTokenize}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              <FaCut className="inline mr-2" />
              {isLoading ? "Tokenizing..." : "Tokenize Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {tokens.length > 0 && (
              <button
                onClick={exportTokens}
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
        {tokens.length > 0 && (
          <div className="mt-8 p-6 bg-orange-50 rounded-lg max-h-[60vh] overflow-auto">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Tokens ({options.tokenType}, {tokenizeText(inputText).tokenCount} found)
            </h2>
            <div className="mt-4 text-gray-700">
              {options.outputFormat === "list" ? (
                <ul className="list-disc list-inside space-y-1">
                  {tokens.map((token, index) => (
                    <li key={index}>{token}</li>
                  ))}
                </ul>
              ) : (
                <pre className="whitespace-pre-wrap break-all">{tokens}</pre>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {tokenizeText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(
                options.outputFormat === "list" ? tokens.join("\n") : tokens
              )}
              className="mt-4 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Tokens
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Tokenizations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.tokenType}: "{entry.input.slice(0, 30)}{entry.input.length > 30 ? "..." : ""}" ({entry.output.length})
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setTokens(entry.output);
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
            <li>Tokenize by words, sentences, custom, chars, or regex</li>
            <li>Custom delimiter or regex pattern</li>
            <li>Trim, ignore empty, preserve case, sort, and limit tokens</li>
            <li>Output as list, string, JSON, or CSV</li>
            <li>Export tokens and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextTokenizer;