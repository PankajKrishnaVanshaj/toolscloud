"use client";

import React, { useState, useCallback } from "react";
import { MD5, SHA1, SHA256, SHA512 } from "crypto-js";
import { FaCopy, FaDownload, FaSync, FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordHashGenerator = () => {
  const [password, setPassword] = useState("");
  const [algorithm, setAlgorithm] = useState("sha256");
  const [outputFormat, setOutputFormat] = useState("hex");
  const [salt, setSalt] = useState(""); // New: Optional salt
  const [iterations, setIterations] = useState(1); // New: Iteration count
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSalt, setShowSalt] = useState(false);

  const hashFunctions = {
    md5: MD5,
    sha1: SHA1,
    sha256: SHA256,
    sha512: SHA512,
  };

  // Generate random salt
  const generateSalt = () => {
    const randomSalt = Math.random().toString(36).substring(2, 10);
    setSalt(randomSalt);
  };

  // Generate hash with optional salt and iterations
  const generateHash = useCallback(() => {
    setError("");
    setHash("");

    if (!password) {
      setError("Please enter a password to hash");
      return;
    }

    try {
      let hashObj = password;
      if (salt) hashObj += salt; // Append salt if provided
      for (let i = 0; i < iterations; i++) {
        hashObj = hashFunctions[algorithm](hashObj);
      }
      const hashString =
        outputFormat === "base64"
          ? hashObj.toString(CryptoJS.enc.Base64)
          : hashObj.toString();
      setHash(hashString);
    } catch (err) {
      setError("Hash generation failed: " + err.message);
    }
  }, [password, algorithm, outputFormat, salt, iterations]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateHash();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (hash) {
      navigator.clipboard.writeText(hash);
    }
  };

  // Download hash as file
  const downloadAsFile = () => {
    if (hash) {
      const content = salt
        ? `Hash: ${hash}\nSalt: ${salt}\nAlgorithm: ${algorithm.toUpperCase()}\nFormat: ${
            outputFormat === "hex" ? "Hexadecimal" : "Base64"
          }\nIterations: ${iterations}`
        : `Hash: ${hash}\nAlgorithm: ${algorithm.toUpperCase()}\nFormat: ${
            outputFormat === "hex" ? "Hexadecimal" : "Base64"
          }\nIterations: ${iterations}`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hash_${algorithm}_${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all fields
  const clearAll = () => {
    setPassword("");
    setAlgorithm("sha256");
    setOutputFormat("hex");
    setSalt("");
    setIterations(1);
    setHash("");
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Password Hash Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password to hash"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Salt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salt (Optional)
            </label>
            <div className="relative flex gap-2">
              <input
                type={showSalt ? "text" : "password"}
                value={salt}
                onChange={(e) => setSalt(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter salt or generate one"
              />
              <button
                type="button"
                onClick={() => setShowSalt(!showSalt)}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showSalt ? <FaEyeSlash /> : <FaEye />}
              </button>
              <button
                type="button"
                onClick={generateSalt}
                className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Generate
              </button>
            </div>
          </div>

          {/* Algorithm Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hash Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="md5">MD5</option>
              <option value="sha1">SHA-1</option>
              <option value="sha256">SHA-256</option>
              <option value="sha512">SHA-512</option>
            </select>
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output Format
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="hex">Hexadecimal</option>
              <option value="base64">Base64</option>
            </select>
          </div>

          {/* Iterations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Iterations ({iterations})
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={iterations}
              onChange={(e) => setIterations(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of times to apply the hash function
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate Hash
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear All
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Generated Hash */}
        {hash && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Generated Hash</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadAsFile}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <textarea
              value={hash}
              readOnly
              className="w-full p-2 border rounded-md bg-white font-mono text-sm h-24 resize-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-600 mt-2">
              Algorithm: {algorithm.toUpperCase()} | Format:{" "}
              {outputFormat === "hex" ? "Hexadecimal" : "Base64"} | Iterations: {iterations}
              {salt && ` | Salt: ${salt}`}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for MD5, SHA-1, SHA-256, and SHA-512</li>
            <li>Optional salt with random generation</li>
            <li>Configurable iterations (1-10)</li>
            <li>Hexadecimal or Base64 output</li>
            <li>Copy to clipboard and download as file</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default PasswordHashGenerator;