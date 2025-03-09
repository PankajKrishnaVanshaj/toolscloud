"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaFileExport,
  FaDownload,
  FaHistory,
  FaUndo,
} from "react-icons/fa";

const TextEncoder = () => {
  const [inputText, setInputText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [changes, setChanges] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    encodeType: "base64", // base64, url, hex, html, rot13, binary
    applyToLines: false,
    decode: false,        // Toggle between encode and decode
    trimWhitespace: true, // Trim whitespace before encoding
  });

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const encodeDecodeText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to process" };
    }

    let resultLines = options.applyToLines ? text.split("\n") : [text];
    let processedLines = [];
    const isDecoding = options.decode;

    for (let line of resultLines) {
      let processedLine = options.trimWhitespace ? line.trim() : line;

      try {
        switch (options.encodeType) {
          case "base64":
            processedLine = isDecoding ? atob(processedLine) : btoa(processedLine);
            break;
          case "url":
            processedLine = isDecoding
              ? decodeURIComponent(processedLine)
              : encodeURIComponent(processedLine);
            break;
          case "hex":
            if (isDecoding) {
              processedLine = processedLine.match(/.{1,2}/g)?.map(hex => String.fromCharCode(parseInt(hex, 16))).join("") || "";
            } else {
              processedLine = processedLine.split("").map(char => char.charCodeAt(0).toString(16).padStart(2, "0")).join("");
            }
            break;
          case "html":
            const textarea = document.createElement("textarea");
            if (isDecoding) {
              textarea.innerHTML = processedLine;
              processedLine = textarea.value;
            } else {
              textarea.textContent = processedLine;
              processedLine = textarea.innerHTML;
            }
            break;
          case "rot13":
            processedLine = processedLine.replace(/[a-zA-Z]/g, (char) => {
              const base = char <= "Z" ? 65 : 97;
              return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
            });
            break;
          case "binary":
            if (isDecoding) {
              processedLine = processedLine.split(" ").map(bin => String.fromCharCode(parseInt(bin, 2))).join("");
            } else {
              processedLine = processedLine.split("").map(char => char.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
            }
            break;
          default:
            return { error: "Invalid encode type" };
        }
      } catch (err) {
        return { error: `${isDecoding ? "Decoding" : "Encoding"} failed: ${err.message}` };
      }

      processedLines.push(processedLine);
    }

    const result = processedLines.join("\n");
    return {
      original: text,
      processed: result,
      changes: getChanges(text, result, isDecoding),
    };
  };

  const getChanges = (original, processed, isDecoding) => {
    const changes = [];
    if (original === processed) return ["No changes made"];

    changes.push(`${isDecoding ? "Decoded from" : "Encoded to"} ${options.encodeType}`);
    if (options.applyToLines && original.includes("\n")) {
      changes.push("Applied to each line separately");
    }
    if (options.trimWhitespace) {
      changes.push("Trimmed whitespace");
    }
    return changes;
  };

  const handleProcess = useCallback(async () => {
    setError("");
    setEncodedText("");
    setChanges([]);
    setIsLoading(true);

    try {
      const result = encodeDecodeText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setEncodedText(result.processed);
        setChanges(result.changes);
        setHistory(prev => [...prev, { input: inputText, output: result.processed, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
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
    setOptions({ encodeType: "base64", applyToLines: false, decode: false, trimWhitespace: true });
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

  const exportText = () => {
    const content = `Input: ${inputText}\nOutput (${options.decode ? "Decoded" : "Encoded"}): ${encodedText}\n\nChanges:\n${changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `text_${options.decode ? "decoded" : "encoded"}_${options.encodeType}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const debouncedSetInputText = useCallback(debounce((value) => setInputText(value), 300), []);

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Encoder/Decoder
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label htmlFor="input-text" className="block text-gray-700 font-medium mb-2">
              Enter Text to {options.decode ? "Decode" : "Encode"}:
            </label>
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => debouncedSetInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 resize-y transition-all"
              placeholder={`e.g., ${options.decode ? "SGVsbG8gV29ybGQ=" : "Hello World"}`}
              maxLength={10000}
              aria-describedby="char-count"
            />
            <div id="char-count" className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Processing Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="encode-type" className="block text-sm text-gray-600 mb-1">
                  Format:
                </label>
                <select
                  id="encode-type"
                  value={options.encodeType}
                  onChange={(e) => handleOptionChange("encodeType", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="base64">Base64</option>
                  <option value="url">URL</option>
                  <option value="hex">Hexadecimal</option>
                  <option value="html">HTML Entities</option>
                  <option value="rot13">ROT13</option>
                  <option value="binary">Binary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mode:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOptionChange("decode", false)}
                    className={`flex-1 p-2 rounded ${!options.decode ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  >
                    Encode
                  </button>
                  <button
                    onClick={() => handleOptionChange("decode", true)}
                    className={`flex-1 p-2 rounded ${options.decode ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  >
                    Decode
                  </button>
                </div>
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.applyToLines}
                  onChange={() => handleOptionChange("applyToLines", !options.applyToLines)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Apply to Lines Separately</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.trimWhitespace}
                  onChange={() => handleOptionChange("trimWhitespace", !options.trimWhitespace)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Trim Whitespace</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleProcess}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Processing..." : options.decode ? "Decode Text" : "Encode Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {encodedText && (
              <button
                onClick={exportText}
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
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center" role="alert">
            {error}
          </div>
        )}

        {/* Output Display */}
        {encodedText && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {options.decode ? "Decoded" : "Encoded"} Text ({options.encodeType})
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
                isCopied ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              <FaCopy className="inline mr-2" />
              {isCopied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Operations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.decode ? "Decoded" : "Encoded"} to {entry.options.encodeType}: "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setEncodedText(entry.output);
                      setOptions(entry.options);
                      setChanges(encodeDecodeText(entry.input).changes);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Encode/decode in multiple formats</li>
            <li>Line-by-line processing</li>
            <li>Whitespace trimming option</li>
            <li>Export processed text</li>
            <li>Operation history (last 5)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextEncoder;