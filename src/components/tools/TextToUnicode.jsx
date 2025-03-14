"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const TextToUnicode = () => {
  const [inputText, setInputText] = useState("");
  const [outputFormat, setOutputFormat] = useState("decimal");
  const [delimiter, setDelimiter] = useState("space");
  const [caseSensitivity, setCaseSensitivity] = useState(false); // New feature
  const [includeCharPreview, setIncludeCharPreview] = useState(true); // New feature
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Convert text to Unicode codes
  const textToUnicode = useCallback((text) => {
    return text.split("").map((char) => char.charCodeAt(0));
  }, []);

  // Convert Unicode codes back to text
  const unicodeToText = useCallback((codes) => {
    try {
      const codeArray = codes.split(/[\s,]+/).map((code) => {
        const num = parseInt(code, outputFormat === "hex" ? 16 : 10);
        if (isNaN(num) || num < 0 || num > 0x10FFFF) throw new Error("Invalid Unicode code");
        return String.fromCharCode(num);
      });
      return codeArray.join("");
    } catch (err) {
      setError(`Invalid Unicode input: ${err.message}`);
      return "";
    }
  }, [outputFormat]);

  // Format Unicode codes based on selected format
  const formatUnicode = useCallback(
    (codes) => {
      switch (outputFormat) {
        case "decimal":
          return codes.map((code) => code.toString(10));
        case "hex":
          return codes.map((code) =>
            `U+${code.toString(16).toUpperCase().padStart(4, "0")}`
          );
        case "html":
          return codes.map((code) => `&#${code};`);
        case "unicode":
          return codes.map((code) =>
            `\\u${code.toString(16).toUpperCase().padStart(4, "0")}`
          );
        case "binary":
          return codes.map((code) => code.toString(2).padStart(16, "0"));
        default:
          return codes.map((code) => code.toString(10));
      }
    },
    [outputFormat]
  );

  // Join formatted output with selected delimiter
  const joinOutput = useCallback(
    (formatted) => {
      switch (delimiter) {
        case "space":
          return formatted.join(" ");
        case "comma":
          return formatted.join(", ");
        case "semicolon":
          return formatted.join("; ");
        case "none":
          return formatted.join("");
        default:
          return formatted.join(" ");
      }
    },
    [delimiter]
  );

  // Handle text input
  const handleTextInput = useCallback(
    (text) => {
      setInputText(caseSensitivity ? text : text.toLowerCase());
      setError("");
      if (text.trim() === "") {
        setResult(null);
        return;
      }

      const codes = textToUnicode(text);
      const formatted = formatUnicode(codes);
      const output = joinOutput(formatted);

      setResult({
        text: text,
        codes: codes,
        formatted: output,
        characters: text.split("").map((char, i) => ({
          char,
          decimal: codes[i],
          hex: codes[i].toString(16).toUpperCase().padStart(4, "0"),
          html: `&#${codes[i]};`,
          unicode: `\\u${codes[i].toString(16).toUpperCase().padStart(4, "0")}`,
          binary: codes[i].toString(2).padStart(16, "0"),
        })),
      });
    },
    [caseSensitivity, textToUnicode, formatUnicode, joinOutput]
  );

  // Handle Unicode input
  const handleUnicodeInput = useCallback(
    (codes) => {
      setError("");
      const text = unicodeToText(codes);
      setInputText(text);
      if (text) {
        handleTextInput(text);
      } else {
        setResult(null);
      }
    },
    [unicodeToText, handleTextInput]
  );

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Download result as text file
  const downloadResult = () => {
    if (result) {
      const blob = new Blob([result.formatted], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `unicode-output-${Date.now()}.txt`;
      link.click();
    }
  };

  // Reset all inputs
  const reset = () => {
    setInputText("");
    setOutputFormat("decimal");
    setDelimiter("space");
    setCaseSensitivity(false);
    setIncludeCharPreview(true);
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Text to Unicode Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => handleTextInput(e.target.value)}
                placeholder="Enter text to convert to Unicode"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unicode Codes
              </label>
              <textarea
                value={result?.formatted || ""}
                onChange={(e) => handleUnicodeInput(e.target.value)}
                placeholder="Enter Unicode codes to convert to text (e.g., 72 101 108 108 111)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => {
                  setOutputFormat(e.target.value);
                  if (inputText) handleTextInput(inputText);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="decimal">Decimal (e.g., 72)</option>
                <option value="hex">Hex (e.g., U+0048)</option>
                <option value="html">HTML Entity (e.g., &#72;)</option>
                <option value="unicode">Unicode Escape (e.g., \u0048)</option>
                <option value="binary">Binary (e.g., 01001000)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delimiter
              </label>
              <select
                value={delimiter}
                onChange={(e) => {
                  setDelimiter(e.target.value);
                  if (inputText) handleTextInput(inputText);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="space">Space</option>
                <option value="comma">Comma</option>
                <option value="semicolon">Semicolon</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={caseSensitivity}
                  onChange={(e) => {
                    setCaseSensitivity(e.target.checked);
                    if (inputText) handleTextInput(inputText);
                  }}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Case Sensitive</span>
              </label>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeCharPreview}
                  onChange={(e) => setIncludeCharPreview(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Char Preview</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => copyToClipboard(result?.formatted || "")}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy Output
            </button>
            <button
              onClick={downloadResult}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Conversion Results</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-700">Formatted Output:</p>
                  <p className="break-all text-gray-600">{result.formatted}</p>
                </div>
                {includeCharPreview && (
                  <div className="overflow-x-auto">
                    <p className="font-medium text-gray-700 mb-2">Character Breakdown:</p>
                    <table className="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border">Char</th>
                          <th className="p-2 border">Decimal</th>
                          <th className="p-2 border">Hex</th>
                          <th className="p-2 border">HTML</th>
                          <th className="p-2 border">Unicode</th>
                          <th className="p-2 border">Binary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.characters.map((charData, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-2 border">{charData.char}</td>
                            <td className="p-2 border">{charData.decimal}</td>
                            <td className="p-2 border">U+{charData.hex}</td>
                            <td className="p-2 border">{charData.html}</td>
                            <td className="p-2 border">{charData.unicode}</td>
                            <td className="p-2 border">{charData.binary}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert text to Unicode and back</li>
              <li>Output formats: Decimal, Hex, HTML, Unicode, Binary</li>
              <li>Delimiters: Space, Comma, Semicolon, None</li>
              <li>Case sensitivity option</li>
              <li>Toggle character preview</li>
              <li>Copy to clipboard and download as text file</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToUnicode;