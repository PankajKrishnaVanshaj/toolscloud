"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaLock, FaInfoCircle } from "react-icons/fa";

const FileEncryptionTool = () => {
  const [file, setFile] = useState(null);
  const [key, setKey] = useState("");
  const [encryptedData, setEncryptedData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [algorithm, setAlgorithm] = useState("AES-GCM"); // New: Algorithm selection
  const [keyLength, setKeyLength] = useState(256); // New: Key length option
  const fileInputRef = React.useRef(null);

  // Derive AES key from user-provided string
  const deriveKey = async (keyString) => {
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
        salt: encoder.encode("unique-salt-2025"), // Improved: Unique salt
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: algorithm, length: keyLength },
      true,
      ["encrypt", "decrypt"]
    );
  };

  // Encrypt file
  const encryptFile = useCallback(async () => {
    setLoading(true);
    setError("");
    setEncryptedData(null);

    if (!file) {
      setError("Please select a file to encrypt");
      setLoading(false);
      return;
    }
    if (!key) {
      setError("Please enter an encryption key");
      setLoading(false);
      return;
    }

    try {
      // Read file content as ArrayBuffer
      const reader = new FileReader();
      const fileData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsArrayBuffer(file);
      });

      // Derive AES key
      const aesKey = await deriveKey(key);

      // Generate IV (12 bytes for AES-GCM, 16 bytes for AES-CBC)
      const ivLength = algorithm === "AES-GCM" ? 12 : 16;
      const iv = window.crypto.getRandomValues(new Uint8Array(ivLength));

      // Encrypt the file data
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: algorithm,
          iv: iv,
          ...(algorithm === "AES-GCM" ? { tagLength: 128 } : {}), // Optional for GCM
        },
        aesKey,
        fileData
      );

      // Combine IV and ciphertext
      const encryptedWithIv = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      encryptedWithIv.set(iv, 0);
      encryptedWithIv.set(new Uint8Array(encryptedBuffer), iv.length);

      // Create Blob for download
      const blob = new Blob([encryptedWithIv], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);

      setEncryptedData({
        url,
        size: encryptedWithIv.length,
        blob,
        ivLength,
        algorithm,
      });
    } catch (err) {
      setError("Encryption failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [file, key, algorithm, keyLength]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setEncryptedData(null);
      setError("");
    }
  };

  // Download encrypted file
  const downloadFile = () => {
    if (encryptedData && encryptedData.url) {
      const link = document.createElement("a");
      link.href = encryptedData.url;
      link.download = `encrypted_${file ? file.name : "file"}_${algorithm.toLowerCase()}_${keyLength}.enc`;
      link.click();
    }
  };

  // Reset all
  const reset = () => {
    setFile(null);
    setKey("");
    setEncryptedData(null);
    setError("");
    setAlgorithm("AES-GCM");
    setKeyLength(256);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center">
          <FaLock className="mr-2" /> File Encryption Tool
        </h1>

        {/* Form */}
        <div className="space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File to Encrypt
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Encryption Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a secure key"
              disabled={loading}
            />
          </div>

          {/* Algorithm and Key Length */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Encryption Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="AES-GCM">AES-GCM</option>
                <option value="AES-CBC">AES-CBC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Length (bits)
              </label>
              <select
                value={keyLength}
                onChange={(e) => setKeyLength(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value={128}>128</option>
                <option value={192}>192</option>
                <option value={256}>256</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={encryptFile}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaLock className="mr-2" /> {loading ? "Encrypting..." : "Encrypt File"}
            </button>
            <button
              onClick={downloadFile}
              disabled={!encryptedData || loading}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Encrypted Results */}
        {encryptedData && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h2 className="text-lg font-semibold text-green-700 mb-2">Encrypted Results</h2>
            <div className="space-y-2 text-sm text-green-600">
              <p>
                <strong>File Size:</strong> {(encryptedData.size / 1024).toFixed(2)} KB
              </p>
              <p>
                <strong>Algorithm:</strong> {encryptedData.algorithm} ({keyLength}-bit)
              </p>
              <p>
                <strong>IV Length:</strong> {encryptedData.ivLength} bytes
              </p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports AES-GCM and AES-CBC encryption</li>
            <li>Selectable key lengths: 128, 192, 256 bits</li>
            <li>Secure key derivation with PBKDF2</li>
            <li>Download encrypted file with IV included</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default FileEncryptionTool;