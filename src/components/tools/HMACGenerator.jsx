"use client";
import React, { useState, useCallback } from "react";
import { HmacMD5, HmacSHA1, HmacSHA256, HmacSHA512 } from "crypto-js";
import { FaCopy, FaSync, FaLock, FaUnlock } from "react-icons/fa";

const HMACGenerator = () => {
  const [message, setMessage] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [algorithm, setAlgorithm] = useState("sha256");
  const [outputFormat, setOutputFormat] = useState("hex");
  const [generatedHmac, setGeneratedHmac] = useState("");
  const [error, setError] = useState("");
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [uppercaseOutput, setUppercaseOutput] = useState(false);

  const hmacFunctions = {
    md5: HmacMD5,
    sha1: HmacSHA1,
    sha256: HmacSHA256,
    sha512: HmacSHA512,
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
      let output =
        outputFormat === "base64"
          ? hmac.toString(CryptoJS.enc.Base64)
          : hmac.toString();
      output = uppercaseOutput ? output.toUpperCase() : output.toLowerCase();
      setGeneratedHmac(output);
      setError("");
    } catch (err) {
      setError("HMAC generation failed: " + err.message);
    }
  }, [message, secretKey, algorithm, outputFormat, uppercaseOutput]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateHmac();
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
    setGeneratedHmac("");
    setError("");
    setAlgorithm("sha256");
    setOutputFormat("hex");
    setUppercaseOutput(false);
    setIsKeyVisible(false);
  };

  // Generate random secret key
  const generateRandomKey = () => {
    const randomKey = CryptoJS.lib.WordArray.random(16).toString();
    setSecretKey(randomKey);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          HMAC Generator
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
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 h-32 resize-y"
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
                type={isKeyVisible ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 pr-20"
                placeholder="Enter your secret key"
              />
              <button
                type="button"
                onClick={() => setIsKeyVisible(!isKeyVisible)}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
              >
                {isKeyVisible ? <FaUnlock /> : <FaLock />}
              </button>
              <button
                type="button"
                onClick={generateRandomKey}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Random
              </button>
            </div>
          </div>

          {/* Output Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={uppercaseOutput}
                onChange={(e) => setUppercaseOutput(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Uppercase Output</span>
            </label>
          </div>

          {/* Generated HMAC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Generated HMAC
            </label>
            <div className="relative">
              <textarea
                value={generatedHmac}
                readOnly
                className="w-full p-3 border rounded-md bg-gray-50 h-32 font-mono text-sm resize-y"
                placeholder="Generated HMAC will appear here"
              />
              {generatedHmac && (
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="absolute right-2 top-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                >
                  <FaCopy /> Copy
                </button>
              )}
            </div>
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
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate HMAC
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
            <li>Supports HMAC-MD5, SHA1, SHA256, and SHA512</li>
            <li>Output in Hex or Base64 format</li>
            <li>Random secret key generation</li>
            <li>Toggle key visibility</li>
            <li>Uppercase/lowercase output option</li>
            <li>Copy to clipboard functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HMACGenerator;