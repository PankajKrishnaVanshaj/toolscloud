"use client";
import React, { useState, useCallback } from "react";
import AES from "crypto-js/aes";
import TripleDES from "crypto-js/tripledes";
import Rabbit from "crypto-js/rabbit";
import UTF8 from "crypto-js/enc-utf8";
import { FaCopy, FaSync, FaLock, FaUnlock } from "react-icons/fa";

const EncryptionTool = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [mode, setMode] = useState("encrypt"); // 'encrypt' or 'decrypt'
  const [algorithm, setAlgorithm] = useState("aes"); // AES, TripleDES, Rabbit
  const [error, setError] = useState("");
  const [showKey, setShowKey] = useState(false); // Toggle key visibility
  const [keySize, setKeySize] = useState(128); // For AES key size
  const [isProcessing, setIsProcessing] = useState(false);

  // Encryption handler
  const handleEncrypt = useCallback(() => {
    try {
      if (!secretKey) throw new Error("Please enter a secret key");
      if (!inputText) throw new Error("Please enter text to encrypt");

      setIsProcessing(true);
      let encrypted;
      switch (algorithm) {
        case "aes":
          encrypted = AES.encrypt(inputText, secretKey).toString();
          break;
        case "tripledes":
          encrypted = TripleDES.encrypt(inputText, secretKey).toString();
          break;
        case "rabbit":
          encrypted = Rabbit.encrypt(inputText, secretKey).toString();
          break;
        default:
          throw new Error("Unsupported algorithm");
      }
      setOutputText(encrypted);
      setError("");
    } catch (err) {
      setError(`Encryption failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, secretKey, algorithm]);

  // Decryption handler
  const handleDecrypt = useCallback(() => {
    try {
      if (!secretKey) throw new Error("Please enter a secret key");
      if (!inputText) throw new Error("Please enter text to decrypt");

      setIsProcessing(true);
      let decrypted;
      switch (algorithm) {
        case "aes":
          decrypted = AES.decrypt(inputText, secretKey).toString(UTF8);
          break;
        case "tripledes":
          decrypted = TripleDES.decrypt(inputText, secretKey).toString(UTF8);
          break;
        case "rabbit":
          decrypted = Rabbit.decrypt(inputText, secretKey).toString(UTF8);
          break;
        default:
          throw new Error("Unsupported algorithm");
      }
      if (!decrypted) throw new Error("Invalid encrypted text or wrong key");
      setOutputText(decrypted);
      setError("");
    } catch (err) {
      setError(`Decryption failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, secretKey, algorithm]);

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    mode === "encrypt" ? handleEncrypt() : handleDecrypt();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
  };

  // Clear all fields
  const clearAll = () => {
    setInputText("");
    setOutputText("");
    setSecretKey("");
    setError("");
    setMode("encrypt");
    setAlgorithm("aes");
    setKeySize(128);
    setShowKey(false);
  };

  // Generate random key (for demo purposes)
  const generateRandomKey = () => {
    const length = keySize / 8; // Convert bits to bytes
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    const key = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
    setSecretKey(key.slice(0, length)); // Trim to exact length
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Encryption Tool
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mode Selection */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => setMode("encrypt")}
              className={`flex-1 py-2 px-4 rounded-md ${
                mode === "encrypt"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors flex items-center justify-center`}
              disabled={isProcessing}
            >
              <FaLock className="mr-2" /> Encrypt
            </button>
            <button
              type="button"
              onClick={() => setMode("decrypt")}
              className={`flex-1 py-2 px-4 rounded-md ${
                mode === "decrypt"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors flex items-center justify-center`}
              disabled={isProcessing}
            >
              <FaUnlock className="mr-2" /> Decrypt
            </button>
          </div>

          {/* Algorithm and Key Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                <option value="aes">AES</option>
                <option value="tripledes">Triple DES</option>
                <option value="rabbit">Rabbit</option>
              </select>
            </div>
            {algorithm === "aes" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Size (bits)
                </label>
                <select
                  value={keySize}
                  onChange={(e) => setKeySize(parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value={128}>128</option>
                  <option value={192}>192</option>
                  <option value={256}>256</option>
                </select>
              </div>
            )}
          </div>

          {/* Secret Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secret Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 pr-20"
                placeholder="Enter your secret key"
                disabled={isProcessing}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-12 top-1/2 -translate-y-1/2 px-2 py-1 text-gray-600 hover:text-gray-800"
              >
                {showKey ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={generateRandomKey}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-blue-600 hover:text-blue-800"
                disabled={isProcessing}
              >
                Generate
              </button>
            </div>
          </div>

          {/* Input Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === "encrypt" ? "Plain Text" : "Encrypted Text"}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              placeholder={
                mode === "encrypt"
                  ? "Enter text to encrypt"
                  : "Enter text to decrypt"
              }
              disabled={isProcessing}
            />
          </div>

          {/* Output Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Result
            </label>
            <div className="relative">
              <textarea
                value={outputText}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-50 h-32 resize-y"
                placeholder="Result will appear here"
              />
              {outputText && (
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="absolute right-2 top-2 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <FaCopy className="mr-1" /> Copy
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : mode === "encrypt"
                ? "Encrypt"
                : "Decrypt"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              disabled={isProcessing}
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple algorithms: AES, Triple DES, Rabbit</li>
            <li>AES key size options: 128, 192, 256 bits</li>
            <li>Random key generation</li>
            <li>Show/hide secret key</li>
            <li>Copy result to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EncryptionTool;