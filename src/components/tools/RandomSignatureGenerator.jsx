"use client";

import React, { useState, useCallback } from "react";
import { faker } from "@faker-js/faker";
import crypto from "crypto";
import { FaCopy, FaDownload, FaTrash, FaHistory, FaUndo } from "react-icons/fa";

const RandomSignatureGenerator = () => {
  const [signature, setSignature] = useState("");
  const [type, setType] = useState("hash");
  const [length, setLength] = useState(32);
  const [options, setOptions] = useState({
    hashAlgorithm: "sha256", // sha256, sha512, md5
    includeSpecialChars: false, // For stylized
    prefix: "", // Add prefix to signature
    separator: "-", // For stylized
  });
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  // Generate random signature based on type
  const generateSignature = useCallback(() => {
    let newSignature = "";
    try {
      switch (type) {
        case "hash":
          const randomData = faker.string.alphanumeric({ length: 20 });
          newSignature = crypto
            .createHash(options.hashAlgorithm)
            .update(randomData + (options.prefix || ""))
            .digest("hex")
            .slice(0, length);
          break;
        case "uuid":
          newSignature = options.prefix
            ? `${options.prefix}-${faker.string.uuid()}`
            : faker.string.uuid();
          break;
        case "stylized":
          const chars = options.includeSpecialChars
            ? "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
            : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          newSignature = faker.string
            .fromCharacters(chars, length)
            .replace(new RegExp(`(.{4})`, "g"), `$1${options.separator}`)
            .slice(0, length + Math.floor(length / 4)) // Adjust for separators
            .toUpperCase();
          if (options.prefix) newSignature = `${options.prefix}${options.separator}${newSignature}`;
          break;
        case "timestamp":
          newSignature = options.prefix
            ? `${options.prefix}-${Date.now().toString(36)}-${faker.string.alphanumeric(8)}`
            : `${Date.now().toString(36)}-${faker.string.alphanumeric(8)}`;
          break;
        default:
          throw new Error("Invalid signature type");
      }
      setSignature(newSignature);
      setHistory((prev) => [
        { value: newSignature, type, options: { length, ...options }, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);
      setError("");
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    }
  }, [type, length, options]);

  // Copy signature to clipboard
  const handleCopy = () => {
    if (!signature) return;
    navigator.clipboard
      .writeText(signature)
      .then(() => {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
      })
      .catch((err) => setError(`Copy failed: ${err.message}`));
  };

  // Download signature as text file
  const handleDownload = () => {
    if (!signature) return;
    const blob = new Blob([signature], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `signature_${type}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset fields
  const handleReset = () => {
    setSignature("");
    setError("");
  };

  // Load from history
  const loadFromHistory = (entry) => {
    setSignature(entry.value);
    setType(entry.type);
    setLength(entry.options.length);
    setOptions(entry.options);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full ">
        {/* Alert Notification */}
        {showAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Signature copied!
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Advanced Random Signature Generator
        </h2>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hash">Cryptographic Hash</option>
                <option value="uuid">UUID</option>
                <option value="stylized">Stylized String</option>
                <option value="timestamp">Timestamp-Based</option>
              </select>
            </div>
            {(type === "hash" || type === "stylized") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length (4-64)
                </label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(Math.min(64, Math.max(4, Number(e.target.value) || 4)))}
                  min={4}
                  max={64}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Customization Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {type === "hash" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Hash Algorithm:</label>
                  <select
                    value={options.hashAlgorithm}
                    onChange={(e) => setOptions((prev) => ({ ...prev, hashAlgorithm: e.target.value }))}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="md5">MD5</option>
                    <option value="sha256">SHA-256</option>
                    <option value="sha512">SHA-512</option>
                  </select>
                </div>
              )}
              {type === "stylized" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                  <select
                    value={options.separator}
                    onChange={(e) => setOptions((prev) => ({ ...prev, separator: e.target.value }))}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="-">Hyphen (-)</option>
                    <option value="_">Underscore (_)</option>
                    <option value=".">Dot (.)</option>
                    <option value="">None</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prefix:</label>
                <input
                  type="text"
                  value={options.prefix}
                  onChange={(e) => setOptions((prev) => ({ ...prev, prefix: e.target.value }))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., sig"
                />
              </div>
              {type === "stylized" && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.includeSpecialChars}
                    onChange={() => setOptions((prev) => ({ ...prev, includeSpecialChars: !prev.includeSpecialChars }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-600">Include Special Chars</label>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateSignature}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              Generate Signature
            </button>
            <button
              onClick={handleCopy}
              disabled={!signature}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              <FaCopy className="mr-2" />
              Copy
            </button>
            <button
              onClick={handleDownload}
              disabled={!signature}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              Download
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaTrash className="mr-2" />
              Reset
            </button>
          </div>
        </div>

        {/* Output */}
        {signature && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Generated Signature
            </h3>
            <pre className="w-full p-3 bg-white border border-gray-300 rounded-lg font-mono text-sm overflow-x-auto">
              {signature}
            </pre>
            <p className="text-xs text-gray-600 mt-1">
              Length: {signature.length} characters | Type: {type}
            </p>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div
            className={`mt-4 text-sm p-3 rounded-md ${
              error.includes("copied") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Generation History (Last 10)
            </h3>
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
              {history.map((entry, index) => (
                <div
                  key={index}
                  onClick={() => loadFromHistory(entry)}
                  className="p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {entry.type} - {entry.timestamp.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {entry.value.slice(0, 50)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Generate Hash (MD5, SHA-256, SHA-512), UUID, Stylized, or Timestamp signatures</li>
            <li>Custom length, prefix, and separators</li>
            <li>Optional special characters for stylized signatures</li>
            <li>Copy, download, and track history</li>
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

export default RandomSignatureGenerator;