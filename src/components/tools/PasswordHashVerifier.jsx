"use client";
import React, { useState, useCallback } from "react";
import { MD5, SHA1, SHA256, SHA512, SHA3, RIPEMD160 } from "crypto-js";
import { FaEye, FaEyeSlash, FaCopy, FaSync } from "react-icons/fa";

const PasswordHashVerifier = () => {
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState("");
  const [algorithm, setAlgorithm] = useState("sha256");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [showAllHashes, setShowAllHashes] = useState(false);

  const hashFunctions = {
    md5: MD5,
    sha1: SHA1,
    sha256: SHA256,
    sha512: SHA512,
    sha3: SHA3,
    ripemd160: RIPEMD160,
  };

  // Generate hash for a given algorithm
  const generateHash = useCallback(
    (algo) => hashFunctions[algo](password).toString(),
    [password]
  );

  // Verify password against hash
  const verifyHash = useCallback(() => {
    setError("");
    setResults(null);

    if (!password) {
      setError("Please enter a password");
      return;
    }
    if (!hash && !showAllHashes) {
      setError("Please enter a hash to verify or enable 'Show All Hashes'");
      return;
    }

    try {
      const generatedHash = generateHash(algorithm);
      const allHashes = Object.keys(hashFunctions).reduce((acc, algo) => {
        acc[algo] = generateHash(algo);
        return acc;
      }, {});

      if (showAllHashes) {
        setResults({ allHashes });
      } else {
        const isMatch = caseSensitive
          ? generatedHash === hash.trim()
          : generatedHash.toLowerCase() === hash.toLowerCase().trim();
        setResults({
          generatedHash,
          isMatch,
          algorithm,
          allHashes,
        });
      }
    } catch (err) {
      setError("Verification failed: " + err.message);
    }
  }, [password, hash, algorithm, caseSensitive, showAllHashes, generateHash]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    verifyHash();
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Clear all
  const clearAll = () => {
    setPassword("");
    setHash("");
    setAlgorithm("sha256");
    setResults(null);
    setError("");
    setShowPassword(false);
    setCaseSensitive(false);
    setShowAllHashes(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Password Hash Verifier
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
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Hash Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hash to Verify (Optional if showing all hashes)
            </label>
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Enter hash (e.g., SHA-256)"
              disabled={showAllHashes}
            />
          </div>

          {/* Algorithm Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Case Sensitive</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showAllHashes}
                  onChange={(e) => setShowAllHashes(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show All Hashes</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Verify Hash
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

        {/* Verification Results */}
        {results && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Verification Results</h2>
            <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
              {!showAllHashes ? (
                <>
                  <p className={`text-sm ${results.isMatch ? "text-green-600" : "text-red-600"}`}>
                    <strong>Result:</strong>{" "}
                    {results.isMatch ? "✓ Hash matches" : "✗ Hash does not match"}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm break-all">
                      <strong>Generated Hash ({results.algorithm.toUpperCase()}):</strong>{" "}
                      {results.generatedHash}
                    </p>
                    <button
                      onClick={() => copyToClipboard(results.generatedHash)}
                      className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>All Generated Hashes:</strong>
                  </p>
                  {Object.entries(results.allHashes).map(([algo, hashValue]) => (
                    <div
                      key={algo}
                      className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm"
                    >
                      <p className="text-sm break-all">
                        <strong>{algo.toUpperCase()}:</strong> {hashValue}
                      </p>
                      <button
                        onClick={() => copyToClipboard(hashValue)}
                        className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports MD5, SHA-1, SHA-256, SHA-512, SHA-3, and RIPEMD-160</li>
            <li>Toggle password visibility</li>
            <li>Case-sensitive hash verification option</li>
            <li>Show all hashes for the entered password</li>
            <li>Copy hashes to clipboard</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default PasswordHashVerifier;