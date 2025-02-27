"use client";
import React, { useState } from "react";

const TextTokenizer = () => {
  const [inputText, setInputText] = useState("");
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    tokenType: "words",    // words, sentences, custom
    customDelimiter: ",",  // For custom tokenization
    trimTokens: true,      // Trim whitespace from tokens
    ignoreEmpty: true,     // Ignore empty tokens
    outputFormat: "list",  // list, string, json
  });

  // Tokenize text based on options
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
        tokenArray = text.split(options.customDelimiter);
        break;
      default:
        return { error: "Invalid token type" };
    }

    // Apply trimming and empty token filtering
    if (options.trimTokens) {
      tokenArray = tokenArray.map(token => token.trim());
    }
    if (options.ignoreEmpty) {
      tokenArray = tokenArray.filter(token => token.length > 0);
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
      default:
        output = tokenArray;
    }

    return {
      original: text,
      tokens: output,
      tokenCount: tokenArray.length,
    };
  };

  const handleTokenize = async () => {
    setError("");
    setTokens([]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = tokenizeText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setTokens(result.tokens);
    } catch (err) {
      setError("An error occurred while tokenizing the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setTokens([]);
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Tokenizer
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-40 resize-y transition-all"
              placeholder="e.g., Hello world! This is a test."
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Tokenization Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Token Type:</label>
                <select
                  value={options.tokenType}
                  onChange={(e) => handleOptionChange("tokenType", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="words">Words</option>
                  <option value="sentences">Sentences</option>
                  <option value="custom">Custom Delimiter</option>
                </select>
              </div>
              {options.tokenType === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Delimiter:</label>
                  <input
                    type="text"
                    value={options.customDelimiter}
                    onChange={(e) => handleOptionChange("customDelimiter", e.target.value || ",")}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    maxLength="5"
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
                  <option value="string">String (Separated)</option>
                  <option value="json">JSON</option>
                </select>
              </div>
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
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleTokenize}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {isLoading ? "Tokenizing..." : "Tokenize Text"}
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
        {tokens.length > 0 && (
          <div className="mt-8 p-6 bg-orange-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Tokens ({options.tokenType}, {tokens.length} found)
            </h2>
            <div className="mt-3 text-gray-700">
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
            <button
              onClick={() => navigator.clipboard.writeText(
                options.outputFormat === "list" ? tokens.join("\n") : tokens
              )}
              className="mt-4 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold"
            >
              Copy Tokens to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextTokenizer;