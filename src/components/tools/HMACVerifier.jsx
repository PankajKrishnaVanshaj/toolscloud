"use client";
import React, { useState, useCallback } from "react";
import { HmacMD5, HmacSHA1, HmacSHA256, HmacSHA512, enc } from "crypto-js";
import { FaCopy, FaSync, FaEye, FaEyeSlash } from "react-icons/fa";

const HMACVerifier = () => {
  const [message, setMessage] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [algorithm, setAlgorithm] = useState("sha256");
  const [outputFormat, setOutputFormat] = useState("hex");
  const [providedHmac, setProvidedHmac] = useState("");
  const [generatedHmac, setGeneratedHmac] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);

  const hmacFunctions = {
    md5: HmacMD5,
    sha1: HmacSHA1,
    sha256: HmacSHA256,
    sha512: HmacSHA512,
  };

  const encoders = {
    hex: enc.Hex,
    base64: enc.Base64,
    utf8: enc.Utf8,
  };

  // Generate HMAC
  const generateHmac = useCallback(() => {
    try {
      if (!message) {
        setError("Please enter a message");
        return;
      }
      if (!secretKey) {
        setError("Please enter a secret key");
        return;
      }

      const hmac = hmacFunctions[algorithm](message, secretKey);
      const formattedHmac = encoders[outputFormat].stringify(hmac);
      setGeneratedHmac(formattedHmac);
      setError("");
      verifyHmac(formattedHmac);
    } catch (err) {
      setError("HMAC generation failed: " + err.message);
    }
  }, [message, secretKey, algorithm, outputFormat]);

  // Verify provided HMAC against generated HMAC
  const verifyHmac = (generated = generatedHmac) => {
    if (!providedHmac) {
      setVerificationResult(null);
      return;
    }
    const isValid = generated.toLowerCase() === providedHmac.toLowerCase();
    setVerificationResult(isValid);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateHmac();
  };

  // Handle provided HMAC change
  const handleProvidedHmacChange = (value) => {
    setProvidedHmac(value);
    if (generatedHmac) {
      verifyHmac();
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (generatedHmac) {
      navigator.clipboard.writeText(generatedHmac);
    }
  };

  // Clear all fields
  const clearAll = () => {
    setMessage("");
    setSecretKey("");
    setProvidedHmac("");
    setGeneratedHmac("");
    setVerificationResult(null);
    setError("");
    setAlgorithm("sha256");
    setOutputFormat("hex");
    setShowSecretKey(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          HMAC Verifier
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Algorithm and Output Format */}
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
                <option value="md5">HMAC-MD5</option>
                <option value="sha1">HMAC-SHA1</option>
                <option value="sha256">HMAC-SHA256</option>
                <option value="sha512">HMAC-SHA512</option>
              </select>
            </div>
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
                <option value="utf8">UTF-8</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 h-28 resize-y"
              placeholder="Enter the message to authenticate"
            />
          </div>

          {/* Secret Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secret Key
            </label>
            <div className="relative">
              <input
                type={showSecretKey ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Enter your secret key"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showSecretKey ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Generated HMAC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Generated HMAC
            </label>
            <div className="relative">
              <input
                type="text"
                value={generatedHmac}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-50 font-mono text-sm pr-20"
                placeholder="Generated HMAC will appear here"
              />
              {generatedHmac && (
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                >
                  <FaCopy /> Copy
                </button>
              )}
            </div>
          </div>

          {/* Provided HMAC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HMAC to Verify
            </label>
            <input
              type="text"
              value={providedHmac}
              onChange={(e) => handleProvidedHmacChange(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Enter HMAC to verify"
            />
            {verificationResult !== null && (
              <p
                className={`mt-2 text-sm ${
                  verificationResult ? "text-green-600" : "text-red-600"
                }`}
              >
                {verificationResult ? "✓ HMAC matches" : "✗ HMAC does not match"}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate & Verify
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for HMAC-MD5, SHA1, SHA256, and SHA512</li>
            <li>Multiple output formats: Hex, Base64, UTF-8</li>
            <li>Secret key visibility toggle</li>
            <li>Copy generated HMAC to clipboard</li>
            <li>Real-time verification of provided HMAC</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HMACVerifier;