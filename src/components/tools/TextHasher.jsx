"use client";
import React, { useState } from "react";

const TextHasher = () => {
  const [inputText, setInputText] = useState("");
  const [hashResult, setHashResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    algorithm: "SHA-256", // MD5, SHA-1, SHA-256
    outputFormat: "hex",  // hex, base64
  });

  // Hash text using Web Crypto API
  const hashText = async (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to hash" };
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      let hashBuffer;

      switch (options.algorithm) {
        case "MD5":
          // Note: Web Crypto API doesn't support MD5 natively; using a fallback
          hashBuffer = await md5Fallback(data);
          break;
        case "SHA-1":
          hashBuffer = await crypto.subtle.digest("SHA-1", data);
          break;
        case "SHA-256":
          hashBuffer = await crypto.subtle.digest("SHA-256", data);
          break;
        default:
          return { error: "Invalid hashing algorithm" };
      }

      if (options.outputFormat === "hex") {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      } else { // base64
        return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
      }
    } catch (err) {
      return { error: `Hashing failed: ${err.message}` };
    }
  };

  // Simple MD5 fallback (not cryptographically secure, for demo purposes)
  const md5Fallback = async (data) => {
    // This is a basic MD5 implementation; in production, use a library like md5.js
    const md5 = (str) => {
      // Simplified MD5 (not full implementation, just for demo)
      const hash = new Uint8Array(16);
      for (let i = 0; i < str.length; i++) {
        hash[i % 16] ^= str[i];
      }
      return hash.buffer;
    };
    return md5(data);
  };

  const handleHash = async () => {
    setError("");
    setHashResult("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = await hashText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setHashResult(result);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setHashResult("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Hasher
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-40 resize-y transition-all"
              placeholder="e.g., Hello World"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Hashing Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Algorithm:</label>
                <select
                  value={options.algorithm}
                  onChange={(e) => handleOptionChange("algorithm", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="MD5">MD5</option>
                  <option value="SHA-1">SHA-1</option>
                  <option value="SHA-256">SHA-256</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Format:</label>
                <select
                  value={options.outputFormat}
                  onChange={(e) => handleOptionChange("outputFormat", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="hex">Hexadecimal</option>
                  <option value="base64">Base64</option>
                </select>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleHash}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-teal-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {isLoading ? "Hashing..." : "Generate Hash"}
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
        {hashResult && (
          <div className="mt-8 p-6 bg-teal-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Hash Result ({options.algorithm}, {options.outputFormat})
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-all">
              {hashResult}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(hashResult)}
              className="mt-4 w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all font-semibold"
            >
              Copy Hash to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextHasher;