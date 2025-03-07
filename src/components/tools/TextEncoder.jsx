"use client";
import React, { useState, useCallback } from "react";

const TextEncoder = () => {
  const [inputText, setInputText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [changes, setChanges] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [options, setOptions] = useState({
    encodeType: "base64", // base64, url, hex, html
    applyToLines: false,  // Apply encoding to each line separately
  });

  // Debounce function to limit state updates
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Encode text based on options
  const encodeText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to encode" };
    }

    let resultLines = options.applyToLines ? text.split("\n") : [text];
    let encodedLines = [];

    for (let line of resultLines) {
      let encodedLine = line;

      try {
        switch (options.encodeType) {
          case "base64":
            encodedLine = btoa(encodedLine);
            break;
          case "url":
            encodedLine = encodeURIComponent(encodedLine);
            break;
          case "hex":
            encodedLine = line
              .split("")
              .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
              .join("");
            break;
          case "html":
            const textarea = document.createElement("textarea");
            textarea.textContent = encodedLine;
            encodedLine = textarea.innerHTML;
            break;
          default:
            return { error: "Invalid encode type" };
        }
      } catch (err) {
        return { error: `Encoding failed: ${err.message}` };
      }

      encodedLines.push(encodedLine);
    }

    const result = encodedLines.join("\n");
    return {
      original: text,
      encoded: result,
      changes: getChanges(text, result),
    };
  };

  // Helper to identify changes made
  const getChanges = (original, encoded) => {
    const changes = [];
    if (original === encoded) return ["No changes made"];

    changes.push(`Encoded to ${options.encodeType}`);
    if (options.applyToLines && original.includes("\n")) {
      changes.push("Applied to each line separately");
    }
    return changes;
  };

  const handleEncode = useCallback(async () => {
    setError("");
    setEncodedText("");
    setChanges([]);
    setIsLoading(true);

    try {
      const result = encodeText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setEncodedText(result.encoded);
        setChanges(result.changes);
      }
    } catch (err) {
      setError("An unexpected error occurred while encoding the text");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setEncodedText("");
    setChanges([]);
    setError("");
    setIsCopied(false);
  };

  const handleOptionChange = (option, value) => {
    setOptions((prev) => ({ ...prev, [option]: value }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(encodedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  // Debounced input handler
  const debouncedSetInputText = useCallback(
    debounce((value) => setInputText(value), 300),
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Encoder
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="input-text"
              className="block text-gray-700 font-medium mb-2"
            >
              Enter Text to Encode:
            </label>
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => debouncedSetInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-40 resize-y transition-all"
              placeholder="e.g., Hello World"
              maxLength={5000}
              aria-describedby="char-count"
            />
            <div
              id="char-count"
              className="text-right text-sm text-gray-500 mt-1"
            >
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Encoding Options:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="encode-type"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Encode Type:
                </label>
                <select
                  id="encode-type"
                  value={options.encodeType}
                  onChange={(e) =>
                    handleOptionChange("encodeType", e.target.value)
                  }
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="base64">Base64</option>
                  <option value="url">URL Encoding</option>
                  <option value="hex">Hexadecimal</option>
                  <option value="html">HTML Entities</option>
                </select>
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.applyToLines}
                  onChange={() =>
                    handleOptionChange("applyToLines", !options.applyToLines)
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  aria-label="Apply to lines separately"
                />
                <span>Apply to Lines Separately</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleEncode}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              aria-label="Encode text"
            >
              {isLoading ? "Encoding..." : "Encode Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
              aria-label="Reset form"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Output Display */}
        {encodedText && (
          <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Encoded Text ({options.encodeType})
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all">
              {encodedText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleCopy}
              className={`mt-4 w-full py-2 text-white rounded-lg font-semibold transition-all ${
                isCopied
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
              aria-label="Copy encoded text to clipboard"
            >
              {isCopied ? "Copied!" : "Copy Encoded Text to Clipboard"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextEncoder;