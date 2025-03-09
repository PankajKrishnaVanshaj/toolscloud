"use client";

import React, { useState, useCallback } from "react";
import { MD5, SHA1, SHA256, SHA512, HmacMD5, HmacSHA1, HmacSHA256, HmacSHA512 } from "crypto-js";
import { FaCopy, FaTrash, FaHistory, FaUndo } from "react-icons/fa";

const HashGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [hashOutput, setHashOutput] = useState("");
  const [algorithm, setAlgorithm] = useState("sha256");
  const [hmacKey, setHmacKey] = useState("");
  const [outputFormat, setOutputFormat] = useState("hex"); // hex, base64, binary
  const [encoding, setEncoding] = useState("utf8"); // utf8, ascii, base64
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  const hashFunctions = {
    md5: (text) => MD5(text).toString(),
    sha1: (text) => SHA1(text).toString(),
    sha256: (text) => SHA256(text).toString(),
    sha512: (text) => SHA512(text).toString(),
    hmacMd5: (text, key) => HmacMD5(text, key).toString(),
    hmacSha1: (text, key) => HmacSHA1(text, key).toString(),
    hmacSha256: (text, key) => HmacSHA256(text, key).toString(),
    hmacSha512: (text, key) => HmacSHA512(text, key).toString(),
  };

  const formatOutput = (hash) => {
    switch (outputFormat) {
      case "base64":
        return btoa(hash);
      case "binary":
        return hash
          .match(/.{1,2}/g)
          .map((hex) => String.fromCharCode(parseInt(hex, 16)))
          .join("");
      case "hex":
      default:
        return hash;
    }
  };

  // Generate hash
  const generateHash = useCallback(() => {
    try {
      if (!inputText.trim()) {
        setError("Please enter text to hash");
        return;
      }
      if (algorithm.startsWith("hmac") && !hmacKey.trim()) {
        setError("Please enter an HMAC key");
        return;
      }

      let processedInput = inputText;
      if (encoding === "base64") {
        processedInput = atob(inputText); // Decode base64 input
      } else if (encoding === "ascii") {
        processedInput = inputText.split("").map((c) => c.charCodeAt(0) % 128).join("");
      }

      let hash;
      if (algorithm.startsWith("hmac")) {
        hash = hashFunctions[algorithm](processedInput, hmacKey);
      } else {
        hash = hashFunctions[algorithm](processedInput);
      }

      const formattedHash = formatOutput(hash);
      setHashOutput(formattedHash);
      setHistory((prev) => [
        ...prev,
        { input: inputText, hash: formattedHash, algorithm, hmacKey, outputFormat, encoding },
      ].slice(-5));
      setError("");
    } catch (err) {
      setError("Hash generation failed: " + err.message);
    }
  }, [inputText, algorithm, hmacKey, outputFormat, encoding]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateHash();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!hashOutput) return;
    navigator.clipboard
      .writeText(hashOutput)
      .then(() => {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  // Clear all fields
  const clearAll = () => {
    setInputText("");
    setHashOutput("");
    setHmacKey("");
    setError("");
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setInputText(entry.input);
    setHashOutput(entry.hash);
    setAlgorithm(entry.algorithm);
    setHmacKey(entry.hmacKey || "");
    setOutputFormat(entry.outputFormat);
    setEncoding(entry.encoding);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        {/* Alert Notification */}
        {showAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Hash copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Hash Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Algorithm Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hash Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="md5">MD5</option>
              <option value="sha1">SHA-1</option>
              <option value="sha256">SHA-256</option>
              <option value="sha512">SHA-512</option>
              <option value="hmacMd5">HMAC-MD5</option>
              <option value="hmacSha1">HMAC-SHA1</option>
              <option value="hmacSha256">HMAC-SHA256</option>
              <option value="hmacSha512">HMAC-SHA512</option>
            </select>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Format:</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hex">Hexadecimal</option>
                  <option value="base64">Base64</option>
                  <option value="binary">Binary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Input Encoding:</label>
                <select
                  value={encoding}
                  onChange={(e) => setEncoding(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="utf8">UTF-8</option>
                  <option value="ascii">ASCII</option>
                  <option value="base64">Base64</option>
                </select>
              </div>
            </div>
          </div>

          {/* HMAC Key */}
          {algorithm.startsWith("hmac") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HMAC Key
              </label>
              <input
                type="text"
                value={hmacKey}
                onChange={(e) => setHmacKey(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter HMAC secret key"
              />
            </div>
          )}

          {/* Input Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              placeholder="Enter text to hash"
            />
          </div>

          {/* Generated Hash */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generated Hash
            </label>
            <div className="relative">
              <textarea
                value={hashOutput}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 h-32 font-mono text-sm resize-y"
                placeholder="Generated hash will appear here"
              />
              {hashOutput && (
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="absolute right-2 top-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaCopy />
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              Generate Hash
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaTrash className="mr-2" />
              Clear
            </button>
          </div>
        </form>

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
                    {entry.algorithm.toUpperCase()}: {entry.hash.slice(0, 10)}... (from: "{entry.input.slice(0, 10)}...")
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
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
            <li>Support for MD5, SHA-1, SHA-256, SHA-512, and HMAC variants</li>
            <li>Output in Hex, Base64, or Binary</li>
            <li>Input encoding in UTF-8, ASCII, or Base64</li>
            <li>Copy and track recent hashes</li>
          </ul>
        </div>
      </div>

      {/* Tailwind Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default HashGenerator;