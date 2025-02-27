"use client";
import React, { useState } from "react";

const TextDecoder = () => {
  const [inputText, setInputText] = useState("");
  const [decodedText, setDecodedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    decodeType: "base64", // base64, url, hex, html
    applyToLines: false,  // Apply decoding to each line separately
  });

  // Decode text based on options
  const decodeText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to decode" };
    }

    let resultLines = options.applyToLines ? text.split("\n") : [text];
    let decodedLines = [];

    for (let line of resultLines) {
      let decodedLine = line.trim();

      try {
        switch (options.decodeType) {
          case "base64":
            decodedLine = atob(decodedLine);
            break;
          case "url":
            decodedLine = decodeURIComponent(decodedLine);
            break;
          case "hex":
            const cleanHex = decodedLine.replace(/\s+/g, "");
            if (!/^[0-9A-Fa-f]+$/.test(cleanHex) || cleanHex.length % 2 !== 0) {
              throw new Error("Invalid hex input: Use only 0-9, A-F, and ensure even length");
            }
            decodedLine = "";
            for (let i = 0; i < cleanHex.length; i += 2) {
              decodedLine += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
            }
            break;
          case "html":
            const textarea = document.createElement("textarea");
            textarea.innerHTML = decodedLine;
            decodedLine = textarea.value;
            break;
          default:
            return { error: "Invalid decode type" };
        }
      } catch (err) {
        return { error: `Decoding failed: ${err.message}` };
      }

      decodedLines.push(decodedLine);
    }

    const result = decodedLines.join("\n");

    return {
      original: text,
      decoded: result,
      changes: getChanges(text, result),
    };
  };

  // Helper to identify changes made
  const getChanges = (original, decoded) => {
    const changes = [];
    if (original === decoded) return ["No changes made"];

    changes.push(`Decoded from ${options.decodeType}`);
    if (options.applyToLines && original.includes("\n")) {
      changes.push("Applied to each line separately");
    }
    return changes;
  };

  const handleDecode = async () => {
    setError("");
    setDecodedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = decodeText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setDecodedText(result.decoded);
    } catch (err) {
      setError("An error occurred while decoding the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setDecodedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Decoder
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Decode:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-40 resize-y transition-all"
              placeholder="e.g., SGVsbG8gV29ybGQ="
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Decoding Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Decode Type:</label>
                <select
                  value={options.decodeType}
                  onChange={(e) => handleOptionChange("decodeType", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  onChange={() => handleOptionChange("applyToLines", !options.applyToLines)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <span>Apply to Lines Separately</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleDecode}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isLoading ? "Decoding..." : "Decode Text"}
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
        {decodedText && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Decoded Text ({options.decodeType})
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all">
              {decodedText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {decodeText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(decodedText)}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
            >
              Copy Decoded Text to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextDecoder;