"use client";

import React, { useState, useCallback } from "react";
import { MD5, SHA1, SHA256, SHA512, SHA3, RIPEMD160 } from "crypto-js";
import { FaCopy, FaSync, FaFileUpload, FaDownload } from "react-icons/fa";

const HashVerifier = () => {
  const [inputText, setInputText] = useState("");
  const [hashOutput, setHashOutput] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [algorithm, setAlgorithm] = useState("md5");
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = React.useRef(null);

  const hashFunctions = {
    md5: MD5,
    sha1: SHA1,
    sha256: SHA256,
    sha512: SHA512,
    sha3: SHA3,
    ripemd160: RIPEMD160,
  };

  // Generate hash
  const generateHash = useCallback(() => {
    try {
      if (!inputText) {
        setError("Please enter text or upload a file to hash");
        return;
      }
      const hash = hashFunctions[algorithm](inputText).toString();
      setHashOutput(hash);
      setError("");
      verifyHash && verifyHashValue(hash);
    } catch (err) {
      setError("Hash generation failed: " + err.message);
    }
  }, [inputText, algorithm, verifyHash]);

  // Verify hash
  const verifyHashValue = useCallback(
    (generatedHash = hashOutput) => {
      if (!verifyHash) {
        setVerificationResult(null);
        return;
      }
      const isValid = caseSensitive
        ? generatedHash === verifyHash
        : generatedHash.toLowerCase() === verifyHash.toLowerCase();
      setVerificationResult(isValid);
    },
    [hashOutput, verifyHash, caseSensitive]
  );

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputText(event.target.result);
        setError("");
      };
      reader.onerror = () => setError("Failed to read file");
      reader.readAsText(file);
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(hashOutput);
  };

  // Download hash as text file
  const downloadHash = () => {
    if (!hashOutput) return;
    const blob = new Blob([hashOutput], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${algorithm}-hash-${Date.now()}.txt`;
    link.click();
  };

  // Clear all fields
  const clearAll = () => {
    setInputText("");
    setHashOutput("");
    setVerifyHash("");
    setVerificationResult(null);
    setError("");
    setFileName("");
    setCaseSensitive(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Hash Verifier
        </h1>

        <form onSubmit={(e) => { e.preventDefault(); generateHash(); }} className="space-y-6">
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
              <option value="sha3">SHA-3</option>
              <option value="ripemd160">RIPEMD-160</option>
            </select>
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Text or File
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Enter text to hash"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="mt-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {fileName && <p className="text-sm text-gray-600 mt-1">File: {fileName}</p>}
            </div>

            {/* Generated Hash */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Generated Hash
              </label>
              <div className="relative">
                <textarea
                  value={hashOutput}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-50 h-32 font-mono text-sm"
                  placeholder="Generated hash will appear here"
                />
                {hashOutput && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      title="Copy to Clipboard"
                    >
                      <FaCopy />
                    </button>
                    <button
                      type="button"
                      onClick={downloadHash}
                      className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                      title="Download Hash"
                    >
                      <FaDownload />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hash to Verify
            </label>
            <input
              type="text"
              value={verifyHash}
              onChange={(e) => {
                setVerifyHash(e.target.value);
                hashOutput && verifyHashValue();
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="Enter hash to verify against"
            />
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => {
                  setCaseSensitive(e.target.checked);
                  hashOutput && verifyHash && verifyHashValue();
                }}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Case Sensitive Verification</span>
            </label>
            {verificationResult !== null && (
              <p
                className={`mt-2 text-sm ${
                  verificationResult ? "text-green-600" : "text-red-600"
                }`}
              >
                {verificationResult ? "✓ Hash matches" : "✗ Hash does not match"}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaFileUpload className="mr-2" /> Generate Hash
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear All
            </button>
          </div>
        </form>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for MD5, SHA-1, SHA-256, SHA-512, SHA-3, RIPEMD-160</li>
            <li>File upload for hashing</li>
            <li>Copy hash to clipboard</li>
            <li>Download hash as text file</li>
            <li>Case-sensitive hash verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HashVerifier;