"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaSync, FaCopy, FaLock, FaUnlock } from "react-icons/fa";

const FileDecryptionTool = () => {
  const [file, setFile] = useState(null);
  const [key, setKey] = useState("");
  const [decryptedData, setDecryptedData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [salt, setSalt] = useState("salt"); // Customizable salt
  const [iterations, setIterations] = useState(100000); // PBKDF2 iterations
  const [showKey, setShowKey] = useState(false); // Toggle key visibility
  const fileInputRef = useRef(null);

  // Derive AES key from user-provided string
  const deriveKey = useCallback(
    async (keyString) => {
      const encoder = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(keyString),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
      );
      return window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: encoder.encode(salt),
          iterations: parseInt(iterations),
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
    },
    [salt, iterations]
  );

  // Decrypt file
  const decryptFile = useCallback(async () => {
    setLoading(true);
    setError("");
    setDecryptedData(null);

    if (!file) {
      setError("Please select a file to decrypt");
      setLoading(false);
      return;
    }
    if (!key) {
      setError("Please enter a decryption key");
      setLoading(false);
      return;
    }

    try {
      const reader = new FileReader();
      const encryptedData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsArrayBuffer(file);
      });

      const aesKey = await deriveKey(key);
      const iv = encryptedData.slice(0, 12);
      const ciphertext = encryptedData.slice(12);

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        aesKey,
        ciphertext
      );

      const blob = new Blob([decryptedBuffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);

      let textPreview = null;
      try {
        const decoder = new TextDecoder("utf-8");
        textPreview = decoder.decode(decryptedBuffer.slice(0, 1024));
        if (!/^[ -~\t\n\r]*$/.test(textPreview)) textPreview = null;
      } catch (e) {
        textPreview = null;
      }

      setDecryptedData({ url, size: decryptedBuffer.byteLength, textPreview, blob });
    } catch (err) {
      setError("Decryption failed: " + (err.message || "Invalid key or file format"));
    } finally {
      setLoading(false);
    }
  }, [file, key, deriveKey]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setDecryptedData(null);
      setError("");
    }
  };

  // Download decrypted file
  const downloadFile = () => {
    if (decryptedData?.url) {
      const link = document.createElement("a");
      link.href = decryptedData.url;
      link.download = `decrypted_${file?.name || "file"}`;
      link.click();
    }
  };

  // Copy text preview to clipboard
  const copyToClipboard = () => {
    if (decryptedData?.textPreview) {
      navigator.clipboard.writeText(decryptedData.textPreview);
    }
  };

  // Clear all
  const clearAll = () => {
    setFile(null);
    setKey("");
    setDecryptedData(null);
    setError("");
    setSalt("salt");
    setIterations(100000);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          File Decryption Tool
        </h1>

        <form onSubmit={(e) => { e.preventDefault(); decryptFile(); }} className="space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Encrypted File
            </label>
            <input
              id="fileInput"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Key Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decryption Key
            </label>
            <input
              type={showKey ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="Enter the key used for encryption"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
            >
              {showKey ? <FaUnlock /> : <FaLock />}
            </button>
          </div>

          {/* Advanced Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salt
              </label>
              <input
                type="text"
                value={salt}
                onChange={(e) => setSalt(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Salt for key derivation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PBKDF2 Iterations ({iterations})
              </label>
              <input
                type="range"
                min="1000"
                max="500000"
                step="1000"
                value={iterations}
                onChange={(e) => setIterations(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <FaUnlock className="mr-2" />
              )}
              {loading ? "Decrypting..." : "Decrypt File"}
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

        {/* Decrypted Results */}
        {decryptedData && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h2 className="text-lg font-semibold text-green-700 mb-2">Decrypted Results</h2>
            <div className="space-y-4">
              <p className="text-sm text-green-600">
                <strong>File Size:</strong> {(decryptedData.size / 1024).toFixed(2)} KB
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={downloadFile}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download File
                </button>
                {decryptedData.textPreview && (
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <FaCopy className="mr-2" /> Copy Text Preview
                  </button>
                )}
              </div>
              {decryptedData.textPreview && (
                <div>
                  <p className="text-sm font-medium text-green-700">Text Preview (First 1KB):</p>
                  <textarea
                    value={decryptedData.textPreview}
                    readOnly
                    className="w-full p-2 border rounded-md bg-gray-100 h-32 font-mono text-sm text-gray-800"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>AES-GCM decryption using Web Crypto API</li>
            <li>Customizable salt and PBKDF2 iterations</li>
            <li>Text preview for decrypted text files</li>
            <li>Download decrypted file</li>
            <li>Copy text preview to clipboard</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default FileDecryptionTool;