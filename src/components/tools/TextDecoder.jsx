"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaCheckCircle,
} from "react-icons/fa";

const TextDecoder = () => {
  const [inputText, setInputText] = useState("");
  const [decodedText, setDecodedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    decodeType: "base64", // base64, url, hex, html, rot13, binary
    applyToLines: false,
    trimWhitespace: true,
    validateInput: true,  // Validate input format before decoding
  });

  const decodeText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to decode" };
    }

    let resultLines = options.applyToLines ? text.split("\n") : [text];
    let decodedLines = [];

    for (let line of resultLines) {
      let decodedLine = options.trimWhitespace ? line.trim() : line;

      try {
        switch (options.decodeType) {
          case "base64":
            if (options.validateInput && !/^[A-Za-z0-9+/=]+$/.test(decodedLine)) {
              throw new Error("Invalid Base64: Use A-Z, a-z, 0-9, +, /, = only");
            }
            decodedLine = atob(decodedLine);
            break;
          case "url":
            decodedLine = decodeURIComponent(decodedLine);
            break;
          case "hex":
            const cleanHex = decodedLine.replace(/\s+/g, "");
            if (options.validateInput && (!/^[0-9A-Fa-f]+$/.test(cleanHex) || cleanHex.length % 2 !== 0)) {
              throw new Error("Invalid Hex: Use 0-9, A-F, even length only");
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
          case "rot13":
            decodedLine = decodedLine.replace(/[a-zA-Z]/g, (char) => {
              const base = char <= "Z" ? 65 : 97;
              return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
            });
            break;
          case "binary":
            if (options.validateInput && !/^[01 ]+$/.test(decodedLine)) {
              throw new Error("Invalid Binary: Use 0, 1, and spaces only");
            }
            decodedLine = decodedLine.split(" ").map(bin => String.fromCharCode(parseInt(bin, 2))).join("");
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

  const getChanges = (original, decoded) => {
    const changes = [];
    if (original === decoded) return ["No changes made"];

    changes.push(`Decoded from ${options.decodeType}`);
    if (options.applyToLines && original.includes("\n")) {
      changes.push("Applied to each line separately");
    }
    if (options.trimWhitespace) {
      changes.push("Trimmed whitespace");
    }
    if (options.validateInput) {
      changes.push("Input validated");
    }
    return changes;
  };

  const handleDecode = useCallback(async () => {
    setError("");
    setDecodedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = decodeText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setDecodedText(result.decoded);
        setHistory(prev => [...prev, { input: inputText, output: result.decoded, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred while decoding");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setDecodedText("");
    setError("");
    setIsCopied(false);
    setOptions({ decodeType: "base64", applyToLines: false, trimWhitespace: true, validateInput: true });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(decodedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const exportDecodedText = () => {
    const content = `Input: ${inputText}\nDecoded (${options.decodeType}): ${decodedText}\n\nChanges:\n${decodeText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `decoded_text_${options.decodeType}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const debouncedSetInputText = useCallback(debounce((value) => setInputText(value), 300), []);

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Decoder
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Decode:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => debouncedSetInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-48 resize-y transition-all"
              placeholder={`e.g., ${options.decodeType === "base64" ? "SGVsbG8gV29ybGQ=" : "Hello%20World"}`}
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Decoding Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Decode Type:</label>
                <select
                  value={options.decodeType}
                  onChange={(e) => handleOptionChange("decodeType", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="base64">Base64</option>
                  <option value="url">URL</option>
                  <option value="hex">Hexadecimal</option>
                  <option value="html">HTML Entities</option>
                  <option value="rot13">ROT13</option>
                  <option value="binary">Binary</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.applyToLines}
                    onChange={() => handleOptionChange("applyToLines", !options.applyToLines)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Apply to Lines Separately</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.trimWhitespace}
                    onChange={() => handleOptionChange("trimWhitespace", !options.trimWhitespace)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Trim Whitespace</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.validateInput}
                    onChange={() => handleOptionChange("validateInput", !options.validateInput)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Validate Input</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleDecode}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isLoading ? "Decoding..." : "Decode Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {decodedText && (
              <button
                onClick={exportDecodedText}
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
              onClick={handleCopy}
              className={`mt-4 w-full py-2 text-white rounded-lg font-semibold transition-all ${
                isCopied ? "bg-green-500 hover:bg-green-600" : "bg-purple-500 hover:bg-purple-600"
              }`}
            >
              <FaCopy className="inline mr-2" />
              {isCopied ? "Copied!" : "Copy Decoded Text"}
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Decodings (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    Decoded from {entry.options.decodeType}: "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setDecodedText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-purple-100 rounded-lg border border-purple-300">
          <h3 className="font-semibold text-purple-700">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm">
            <li>Decode multiple formats (Base64, URL, Hex, HTML, ROT13, Binary)</li>
            <li>Line-by-line decoding option</li>
            <li>Input validation and whitespace trimming</li>
            <li>Export decoded text to file</li>
            <li>History of last 5 decodings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextDecoder;