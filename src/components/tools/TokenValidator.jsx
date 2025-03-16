"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaEye, FaEyeSlash } from "react-icons/fa";

const TokenValidator = () => {
  const [token, setToken] = useState("");
  const [tokenType, setTokenType] = useState("jwt");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [entropyThreshold, setEntropyThreshold] = useState(3.0); // For custom token entropy check

  // Decode JWT
  const decodeJWT = useCallback((part) => {
    try {
      const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = atob(base64);
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }, []);

  // Calculate Shannon entropy for custom tokens
  const calculateEntropy = (str) => {
    const charCount = {};
    str.split("").forEach((char) => {
      charCount[char] = (charCount[char] || 0) + 1;
    });
    const len = str.length;
    return -Object.values(charCount).reduce(
      (sum, count) => sum + (count / len) * Math.log2(count / len),
      0
    );
  };

  // Validate and analyze token
  const validateToken = useCallback(() => {
    setError("");
    setResults(null);

    if (!token.trim()) {
      setError("Please enter a token to validate");
      return;
    }

    let isValid = false;
    let details = {};

    if (tokenType === "jwt") {
      const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
      isValid = jwtRegex.test(token);

      if (isValid) {
        const [header, payload, signature] = token.split(".");
        const decodedHeader = decodeJWT(header);
        const decodedPayload = decodeJWT(payload);

        if (!decodedHeader || !decodedPayload) {
          setError("Invalid JWT: Unable to decode header or payload");
          return;
        }

        details = {
          header: decodedHeader,
          payload: decodedPayload,
          signatureLength: signature ? signature.length : 0,
          issuedAt: decodedPayload.iat
            ? new Date(decodedPayload.iat * 1000).toLocaleString()
            : null,
        };

        if (decodedPayload.exp) {
          const expirationDate = new Date(decodedPayload.exp * 1000);
          details.isExpired = expirationDate < new Date();
          details.expiration = expirationDate.toLocaleString();
        }
      } else {
        setError("Invalid JWT format. Expected: header.payload.signature");
        return;
      }
    } else if (tokenType === "oauth") {
      const oauthRegex = /^[A-Za-z0-9-_]{20,}$/;
      isValid = oauthRegex.test(token);
      details.length = token.length;
      details.entropy = calculateEntropy(token).toFixed(2);

      if (!isValid) {
        setError("Invalid OAuth token format. Expected: 20+ alphanumeric characters");
        return;
      }
    } else if (tokenType === "custom") {
      isValid = token.length >= 16;
      const entropy = calculateEntropy(token);
      details.length = token.length;
      details.hasVariety = /[A-Za-z]/.test(token) && /\d/.test(token);
      details.entropy = entropy.toFixed(2);
      details.isStrong = entropy >= entropyThreshold;

      if (!isValid) {
        setError("Invalid custom token. Minimum length: 16 characters");
        return;
      }
    }

    setResults({
      type: tokenType,
      isValid,
      details,
    });
  }, [token, tokenType, decodeJWT, entropyThreshold]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    validateToken();
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (results) {
      const text = JSON.stringify(results, null, 2);
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setToken("");
    setTokenType("jwt");
    setResults(null);
    setError("");
    setShowToken(false);
    setEntropyThreshold(3.0);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Token Validator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Type
              </label>
              <select
                value={tokenType}
                onChange={(e) => setTokenType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="jwt">JWT (JSON Web Token)</option>
                <option value="oauth">OAuth-like Token</option>
                <option value="custom">Custom Token</option>
              </select>
            </div>
            {tokenType === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entropy Threshold ({entropyThreshold.toFixed(1)})
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={entropyThreshold}
                  onChange={(e) => setEntropyThreshold(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum entropy for strength (higher = stricter)
                </p>
              </div>
            )}
          </div>

          {/* Token Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
            <div className="relative">
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 h-32 font-mono text-sm resize-y"
                placeholder="Paste your token here"
                type={showToken ? "text" : "password"}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
              >
                {showToken ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Validate Token
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Validation Results */}
        {results && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Validation Results</h2>
              <button
                onClick={copyToClipboard}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaCopy className="mr-2" /> Copy Results
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
              <div className="flex justify-between">
                <p className="text-sm">
                  <strong>Type:</strong> {results.type.toUpperCase()}
                </p>
                <p
                  className={`text-sm font-medium ${
                    results.isValid ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {results.isValid ? "✓ Valid Format" : "✗ Invalid Format"}
                </p>
              </div>

              {results.type === "jwt" && results.isValid && (
                <>
                  <div>
                    <p className="text-sm font-medium">Header:</p>
                    <pre className="text-sm bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(results.details.header, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payload:</p>
                    <pre className="text-sm bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(results.details.payload, null, 2)}
                    </pre>
                  </div>
                  <p className="text-sm">
                    <strong>Signature Length:</strong> {results.details.signatureLength}{" "}
                    characters
                  </p>
                  {results.details.issuedAt && (
                    <p className="text-sm">
                      <strong>Issued At:</strong> {results.details.issuedAt}
                    </p>
                  )}
                  {results.details.expiration && (
                    <p
                      className={`text-sm ${
                        results.details.isExpired ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      <strong>Expiration:</strong> {results.details.expiration}{" "}
                      {results.details.isExpired ? "(Expired)" : "(Valid)"}
                    </p>
                  )}
                </>
              )}

              {results.type === "oauth" && results.isValid && (
                <>
                  <p className="text-sm">
                    <strong>Length:</strong> {results.details.length} characters
                  </p>
                  <p className="text-sm">
                    <strong>Entropy:</strong> {results.details.entropy} bits
                  </p>
                </>
              )}

              {results.type === "custom" && results.isValid && (
                <>
                  <p className="text-sm">
                    <strong>Length:</strong> {results.details.length} characters
                  </p>
                  <p className="text-sm">
                    <strong>Character Variety:</strong>{" "}
                    {results.details.hasVariety
                      ? "Yes (letters + numbers)"
                      : "No (limited diversity)"}
                  </p>
                  <p className="text-sm">
                    <strong>Entropy:</strong> {results.details.entropy} bits
                  </p>
                  <p
                    className={`text-sm ${
                      results.details.isStrong ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    <strong>Strength:</strong>{" "}
                    {results.details.isStrong ? "Strong" : "Weak"} (Threshold:{" "}
                    {entropyThreshold})
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Validate JWT, OAuth-like, and custom tokens</li>
            <li>JWT decoding with expiration check</li>
            <li>Entropy analysis for OAuth and custom tokens</li>
            <li>Toggle token visibility</li>
            <li>Customizable entropy threshold for strength</li>
            <li>Copy results to clipboard</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default TokenValidator;