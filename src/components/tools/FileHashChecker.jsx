"use client";

import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaCheck, FaTimes } from "react-icons/fa";

const FileHashChecker = () => {
  const [file, setFile] = useState(null);
  const [hashType, setHashType] = useState("SHA-256");
  const [expectedHash, setExpectedHash] = useState("");
  const [calculatedHash, setCalculatedHash] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  const hashAlgorithms = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"];

  const calculateHash = useCallback(async (fileData, algorithm) => {
    try {
      setLoading(true);
      setError(null);
      setCalculatedHash("");
      setCopied(false);

      const arrayBuffer = await fileData.arrayBuffer();

      let hash;
      if (algorithm === "MD5") {
        const md5Module = await import("md5");
        hash = md5Module.default(arrayBuffer);
      } else {
        const hashBuffer = await crypto.subtle.digest(algorithm, arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      }

      setHistory((prev) => [
        ...prev,
        { fileName: fileData.name, hashType: algorithm, hash, timestamp: new Date() },
      ].slice(-5)); // Keep last 5 entries

      return hash;
    } catch (err) {
      setError(`Error calculating hash: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const hash = await calculateHash(selectedFile, hashType);
    if (hash) setCalculatedHash(hash);
  };

  const handleHashTypeChange = async (newHashType) => {
    setHashType(newHashType);
    if (file) {
      const hash = await calculateHash(file, newHashType);
      if (hash) setCalculatedHash(hash);
    }
  };

  const handleCopy = () => {
    if (calculatedHash) {
      navigator.clipboard.writeText(calculatedHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (calculatedHash) {
      const content = `File: ${file?.name}\nAlgorithm: ${hashType}\nHash: ${calculatedHash}\nTimestamp: ${new Date().toLocaleString()}`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hash-${file?.name}-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setFile(null);
    setCalculatedHash("");
    setExpectedHash("");
    setError(null);
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const verifyHash = () => {
    if (!calculatedHash || !expectedHash) return null;
    return calculatedHash.toLowerCase() === expectedHash.trim().toLowerCase();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">File Hash Checker</h2>

        {/* File Upload and Options */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={loading}
            />
            {file && <p className="mt-2 text-sm text-gray-600">Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hash Algorithm</label>
              <select
                value={hashType}
                onChange={(e) => handleHashTypeChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={loading}
              >
                {hashAlgorithms.map((alg) => (
                  <option key={alg} value={alg}>{alg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Hash (Optional)</label>
              <input
                type="text"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Enter hash to verify"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center disabled:bg-gray-400"
            disabled={loading}
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center disabled:bg-gray-400"
            disabled={!calculatedHash || loading}
          >
            <FaDownload className="mr-2" /> Download Hash
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* Hash Result */}
        {calculatedHash && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">Calculated Hash</h3>
                <button
                  onClick={handleCopy}
                  className={`py-1 px-3 text-sm rounded transition-colors flex items-center ${
                    copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  disabled={loading}
                >
                  <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                {loading ? "Calculating..." : calculatedHash}
              </pre>
            </div>

            {expectedHash && (
              <div className={`p-4 rounded-md border ${verifyHash() ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <h3 className="font-semibold text-gray-700 mb-2">Verification</h3>
                <p className={`text-lg flex items-center ${verifyHash() ? "text-green-700" : "text-red-700"}`}>
                  {verifyHash() ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                  {verifyHash() ? "Hash matches!" : "Hash does not match"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-3">Recent Hashes (Last 5)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex flex-col sm:flex-row justify-between">
                  <span>{entry.fileName} ({entry.hashType})</span>
                  <span className="font-mono truncate max-w-xs">{entry.hash.slice(0, 20)}...</span>
                  <span>{entry.timestamp.toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
          <ul className="list-disc pl-5 text-sm text-blue-600 space-y-1">
            <li>Supports MD5, SHA-1, SHA-256, SHA-384, SHA-512</li>
            <li>MD5 uses fallback; others use Web Crypto API</li>
            <li>Copy hash to clipboard</li>
            <li>Download hash with file details</li>
            <li>Track recent hash calculations</li>
            <li>Case-insensitive hash verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileHashChecker;