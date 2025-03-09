"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaLock,
} from "react-icons/fa";

// Simulated MD5 implementation (in production, use a library like md5.js or js-md5)
const md5 = (message) => {
  // This is a placeholder; real MD5 would require a proper library
  // For demo purposes, we'll simulate a hash-like output
  const hash = new Uint8Array(16);
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  for (let i = 0; i < data.length; i++) {
    hash[i % 16] ^= data[i];
  }
  return Array.from(hash).map(b => b.toString(16).padStart(2, "0")).join("");
};

const TextHasher = () => {
  const [inputText, setInputText] = useState("");
  const [hashResult, setHashResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    algorithm: "SHA-256", // MD5, SHA-1, SHA-256, SHA-384, SHA-512
    outputFormat: "hex",
    useSalt: false,       // Add salt to input
    salt: "",             // Custom salt value
    iterations: 1,        // Number of hashing iterations
  });

  const hashText = async (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to hash" };
    }

    let dataText = text;
    if (options.useSalt) {
      if (!options.salt.trim()) {
        return { error: "Please provide a salt value when using salt" };
      }
      dataText += options.salt;
    }

    const encoder = new TextEncoder();
    let data = encoder.encode(dataText);
    let hashBuffer;

    try {
      for (let i = 0; i < Math.max(1, options.iterations); i++) {
        switch (options.algorithm) {
          case "MD5":
            // Using simulated MD5 (replace with real library in production)
            const hex = md5(new TextDecoder().decode(data));
            hashBuffer = encoder.encode(hex).buffer;
            break;
          case "SHA-1":
            hashBuffer = await crypto.subtle.digest("SHA-1", data);
            break;
          case "SHA-256":
            hashBuffer = await crypto.subtle.digest("SHA-256", data);
            break;
          case "SHA-384":
            hashBuffer = await crypto.subtle.digest("SHA-384", data);
            break;
          case "SHA-512":
            hashBuffer = await crypto.subtle.digest("SHA-512", data);
            break;
          default:
            return { error: "Invalid hashing algorithm" };
        }
        data = new Uint8Array(hashBuffer);
      }

      if (options.outputFormat === "hex") {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      } else {
        return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
      }
    } catch (err) {
      return { error: `Hashing failed: ${err.message}` };
    }
  };

  const handleHash = useCallback(async () => {
    setError("");
    setHashResult("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = await hashText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setHashResult(result);
        setHistory(prev => [...prev, { input: inputText, output: result, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setHashResult("");
    setError("");
    setOptions({
      algorithm: "SHA-256",
      outputFormat: "hex",
      useSalt: false,
      salt: "",
      iterations: 1,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const exportHashResult = () => {
    const content = `Input Text: ${inputText}\nAlgorithm: ${options.algorithm}\nOutput Format: ${options.outputFormat}${options.useSalt ? `\nSalt: ${options.salt}` : ""}\nIterations: ${options.iterations}\n\nHash Result:\n${hashResult}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `hash_${options.algorithm}_${options.outputFormat}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Hasher
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Hash:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-48 resize-y transition-all"
              placeholder="e.g., Hello World"
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Hashing Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Algorithm:</label>
                <select
                  value={options.algorithm}
                  onChange={(e) => handleOptionChange("algorithm", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="MD5">MD5 (Simulated)</option>
                  <option value="SHA-1">SHA-1</option>
                  <option value="SHA-256">SHA-256</option>
                  <option value="SHA-384">SHA-384</option>
                  <option value="SHA-512">SHA-512</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Format:</label>
                <select
                  value={options.outputFormat}
                  onChange={(e) => handleOptionChange("outputFormat", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="hex">Hexadecimal</option>
                  <option value="base64">Base64</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Iterations (1-10):</label>
                <input
                  type="number"
                  value={options.iterations}
                  onChange={(e) => handleOptionChange("iterations", Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="1"
                  max="10"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.useSalt}
                    onChange={() => handleOptionChange("useSalt", !options.useSalt)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Use Salt</span>
                </label>
                {options.useSalt && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Salt:</label>
                    <input
                      type="text"
                      value={options.salt}
                      onChange={(e) => handleOptionChange("salt", e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter salt value"
                      maxLength={100}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleHash}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-teal-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              <FaLock className="inline mr-2" />
              {isLoading ? "Hashing..." : "Generate Hash"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {hashResult && (
              <button
                onClick={exportHashResult}
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
        {hashResult && (
          <div className="mt-8 p-6 bg-teal-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Hash Result ({options.algorithm}, {options.outputFormat})
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-all">
              {hashResult}
            </p>
            {options.useSalt && (
              <p className="mt-2 text-sm text-gray-600">Salt: {options.salt}</p>
            )}
            {options.iterations > 1 && (
              <p className="mt-2 text-sm text-gray-600">Iterations: {options.iterations}</p>
            )}
            <button
              onClick={() => navigator.clipboard.writeText(hashResult)}
              className="mt-4 w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Hash
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Hashes (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.algorithm} ({entry.options.outputFormat}): "{entry.output.slice(0, 20)}..."
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setHashResult(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-teal-500 hover:text-teal-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-teal-100 rounded-lg border border-teal-300">
          <h3 className="font-semibold text-teal-700">Features</h3>
          <ul className="list-disc list-inside text-teal-600 text-sm">
            <li>Multiple algorithms (MD5, SHA-1, SHA-256, SHA-384, SHA-512)</li>
            <li>Hex or Base64 output formats</li>
            <li>Optional salt and multiple iterations</li>
            <li>Export hash results</li>
            <li>History of last 5 hashes</li>
          </ul>
          <p className="mt-2 text-xs text-teal-600">Note: MD5 is simulated for demo purposes; use a library in production.</p>
        </div>
      </div>
    </div>
  );
};

export default TextHasher;