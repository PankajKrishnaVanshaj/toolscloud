"use client";
import React, { useState, useCallback } from "react";
import AES from "crypto-js/aes";
import UTF8 from "crypto-js/enc-utf8";
import Base64 from "crypto-js/enc-base64";
import Hex from "crypto-js/enc-hex";
import { FaEye, FaEyeSlash, FaCopy, FaDownload, FaSync } from "react-icons/fa";

const DecryptionTool = () => {
  const [encryptedText, setEncryptedText] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [format, setFormat] = useState("aes");
  const [error, setError] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Decryption handlers
  const handleAESDecrypt = useCallback(() => {
    try {
      if (!secretKey) throw new Error("Please enter a secret key");
      if (!encryptedText) throw new Error("Please enter encrypted text");

      const decrypted = AES.decrypt(encryptedText, secretKey).toString(UTF8);
      if (!decrypted) throw new Error("Invalid encrypted text or wrong key");
      setDecryptedText(decrypted);
      setError("");
    } catch (err) {
      setError("AES Decryption failed: " + err.message);
    }
  }, [encryptedText, secretKey]);

  const handleBase64Decode = useCallback(() => {
    try {
      if (!encryptedText) throw new Error("Please enter encoded text");
      const decoded = Base64.parse(encryptedText).toString(UTF8);
      setDecryptedText(decoded);
      setError("");
    } catch (err) {
      setError("Base64 Decoding failed: " + err.message);
    }
  }, [encryptedText]);

  const handleHexDecode = useCallback(() => {
    try {
      if (!encryptedText) throw new Error("Please enter encoded text");
      const decoded = Hex.parse(encryptedText).toString(UTF8);
      setDecryptedText(decoded);
      setError("");
    } catch (err) {
      setError("Hex Decoding failed: " + err.message);
    }
  }, [encryptedText]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      switch (format) {
        case "aes":
          handleAESDecrypt();
          break;
        case "base64":
          handleBase64Decode();
          break;
        case "hex":
          handleHexDecode();
          break;
        default:
          setError("Unsupported format");
      }
      setIsProcessing(false);
    }, 500); // Simulated processing delay
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(decryptedText);
  };

  // Download decrypted text
  const downloadText = () => {
    const blob = new Blob([decryptedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `decrypted-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear all fields
  const clearAll = () => {
    setEncryptedText("");
    setDecryptedText("");
    setSecretKey("");
    setFormat("aes");
    setError("");
    setShowKey(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">
          Decryption Tool
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decryption Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            >
              <option value="aes">AES</option>
              <option value="base64">Base64</option>
              <option value="hex">Hex</option>
            </select>
          </div>

          {/* Secret Key (for AES only) */}
          {format === "aes" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secret Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your secret key"
                  disabled={isProcessing}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isProcessing}
                >
                  {showKey ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          )}

          {/* Encrypted Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {format === "aes" ? "Encrypted Text" : "Encoded Text"}
            </label>
            <textarea
              value={encryptedText}
              onChange={(e) => setEncryptedText(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              placeholder={
                format === "aes"
                  ? "Enter AES encrypted text"
                  : format === "base64"
                  ? "Enter Base64 encoded text"
                  : "Enter Hex encoded text"
              }
              disabled={isProcessing}
            />
          </div>

          {/* Decrypted Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decrypted Result
            </label>
            <div className="relative">
              <textarea
                value={decryptedText}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-50 h-32 resize-y"
                placeholder="Decrypted text will appear here"
              />
              {decryptedText && (
                <div className="absolute right-2 top-2 flex gap-2">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    <FaCopy />
                  </button>
                  <button
                    type="button"
                    onClick={downloadText}
                    className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    title="Download as text file"
                  >
                    <FaDownload />
                  </button>
                </div>
              )}
            </div>
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
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              ) : null}
              {isProcessing ? "Decrypting..." : "Decrypt"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports AES, Base64, and Hex decoding</li>
            <li>Secure key input with show/hide toggle</li>
            <li>Copy decrypted text to clipboard</li>
            <li>Download decrypted text as a file</li>
            <li>Processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DecryptionTool;