"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaExchangeAlt } from "react-icons/fa";

const UnicodeToText = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("toText"); // 'toText' or 'toUnicode'
  const [format, setFormat] = useState("U+XXXX"); // 'U+XXXX', 'decimal', 'hex', 'binary'
  const [delimiter, setDelimiter] = useState(" "); // Space, comma, newline, custom
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [error, setError] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false); // For hex input/output
  const [includeNames, setIncludeNames] = useState(false); // Include Unicode names

  const convertToText = useCallback((inputStr) => {
    setError("");
    const values = inputStr.trim().split(getDelimiter());

    try {
      const result = values.map((value) => {
        if (!value) return "";

        let codePoint;
        if (format === "U+XXXX") {
          const match = value.match(/^U\+([0-9A-Fa-f]{4,6})$/i);
          if (!match) throw new Error(`Invalid Unicode format: ${value}`);
          codePoint = parseInt(match[1], 16);
        } else if (format === "decimal") {
          codePoint = parseInt(value, 10);
        } else if (format === "hex") {
          codePoint = parseInt(value, 16);
        } else if (format === "binary") {
          codePoint = parseInt(value, 2);
        }

        if (isNaN(codePoint) || codePoint < 0 || codePoint > 0x10FFFF) {
          throw new Error(`Invalid code point: ${value}`);
        }

        return String.fromCodePoint(codePoint);
      }).join("");
      setOutput(result);
    } catch (err) {
      setError(err.message);
      setOutput("");
    }
  }, [format, delimiter, customDelimiter]);

  const convertToUnicode = useCallback((inputStr) => {
    setError("");
    const chars = inputStr.split("");

    try {
      const result = chars.map((char) => {
        const codePoint = char.codePointAt(0);
        let outputValue;
        if (format === "U+XXXX") {
          outputValue = `U+${codePoint
            .toString(16)
            .toUpperCase()
            .padStart(4, "0")}`;
        } else if (format === "decimal") {
          outputValue = codePoint.toString(10);
        } else if (format === "hex") {
          outputValue = codePoint
            .toString(16)
            [caseSensitive ? "toUpperCase" : "toLowerCase"]();
        } else if (format === "binary") {
          outputValue = codePoint.toString(2);
        }

        if (includeNames) {
          // Basic name mapping (expandable with a full Unicode database)
          const name = char === " " ? "SPACE" : char === "\n" ? "LINE FEED" : `CHAR ${outputValue}`;
          return `${outputValue} (${name})`;
        }
        return outputValue;
      }).join(getDelimiter());
      setOutput(result);
    } catch (err) {
      setError(err.message);
      setOutput("");
    }
  }, [format, delimiter, customDelimiter, caseSensitive, includeNames]);

  const getDelimiter = () => {
    return delimiter === "custom" && customDelimiter
      ? customDelimiter
      : delimiter === "newline"
      ? "\n"
      : delimiter;
  };

  const handleConvert = () => {
    if (!input.trim()) {
      setError("Please enter some input");
      setOutput("");
      return;
    }
    mode === "toText" ? convertToText(input) : convertToUnicode(input);
  };

  const handleSwap = () => {
    setInput(output);
    setOutput("");
    setMode(mode === "toText" ? "toUnicode" : "toText");
    setError("");
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setMode("toText");
    setFormat("U+XXXX");
    setDelimiter(" ");
    setCustomDelimiter("");
    setCaseSensitive(false);
    setIncludeNames(false);
    setError("");
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      alert("Output copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Unicode to Text Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === "toText" ? "Unicode Input" : "Text Input"}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "toText"
                    ? `e.g., ${format === "U+XXXX" ? "U+0041 U+0042" : format === "decimal" ? "65 66" : format === "hex" ? "41 42" : "1000001 1000010"}`
                    : "e.g., AB"
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conversion Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="toText">Unicode to Text</option>
                  <option value="toUnicode">Text to Unicode</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="U+XXXX">U+XXXX (e.g., U+0041)</option>
                  <option value="decimal">Decimal (e.g., 65)</option>
                  <option value="hex">Hex (e.g., 41)</option>
                  <option value="binary">Binary (e.g., 1000001)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delimiter
                </label>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value=" ">Space</option>
                  <option value=",">Comma</option>
                  <option value="newline">Newline</option>
                  <option value="custom">Custom</option>
                </select>
                {delimiter === "custom" && (
                  <input
                    type="text"
                    value={customDelimiter}
                    onChange={(e) => setCustomDelimiter(e.target.value)}
                    placeholder="e.g., |"
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="mr-2 accent-blue-500"
                  disabled={format !== "hex"}
                />
                <span className="text-sm text-gray-700">
                  Uppercase Hex (e.g., 41 → 41 vs 41 → 41)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeNames}
                  onChange={(e) => setIncludeNames(e.target.checked)}
                  className="mr-2 accent-blue-500"
                  disabled={mode === "toText"}
                />
                <span className="text-sm text-gray-700">Include Unicode Names</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleConvert}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Convert
              </button>
              <button
                onClick={handleSwap}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <FaExchangeAlt className="mr-2" /> Swap
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Output Section */}
          {output && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-700">Output:</h2>
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center"
                >
                  <FaCopy className="mr-1" /> Copy
                </button>
              </div>
              <pre className="text-sm whitespace-pre-wrap break-all bg-white p-2 rounded-md border">
                {output}
              </pre>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between Unicode and text</li>
              <li>Supports U+XXXX, decimal, hex, and binary formats</li>
              <li>Customizable delimiters (space, comma, newline, custom)</li>
              <li>Case sensitivity option for hex output</li>
              <li>Optional Unicode character names</li>
              <li>Swap input/output and copy to clipboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnicodeToText;