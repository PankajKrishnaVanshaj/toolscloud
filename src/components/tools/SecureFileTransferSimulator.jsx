"use client";
import React, { useState, useCallback, useRef } from "react";
import { AES, enc } from "crypto-js";
import { FaUpload, FaCopy, FaSync, FaDownload } from "react-icons/fa";

const SecureFileTransferSimulator = () => {
  const [file, setFile] = useState(null);
  const [secretKey, setSecretKey] = useState("");
  const [transferStatus, setTransferStatus] = useState("idle"); // idle, encrypting, transferring, complete, error
  const [progress, setProgress] = useState(0);
  const [encryptedData, setEncryptedData] = useState("");
  const [decryptedData, setDecryptedData] = useState("");
  const [error, setError] = useState("");
  const [transferSpeed, setTransferSpeed] = useState(75); // KB/s
  const [encryptionMode, setEncryptionMode] = useState("text"); // text, binary
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTransferStatus("idle");
      setProgress(0);
      setEncryptedData("");
      setDecryptedData("");
      setError("");
    }
  }, []);

  // Simulate secure file transfer
  const simulateTransfer = useCallback(async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }
    if (!secretKey) {
      setError("Please enter a secret key");
      return;
    }

    try {
      setTransferStatus("encrypting");
      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        const fileContent = encryptionMode === "text" ? e.target.result : e.target.result;
        const contentToEncrypt =
          encryptionMode === "text"
            ? fileContent
            : new Uint8Array(fileContent).toString();

        // Encrypt file content
        const encrypted = AES.encrypt(contentToEncrypt, secretKey).toString();
        setEncryptedData(encrypted);

        // Simulate transfer
        setTransferStatus("transferring");
        const fileSize = file.size / 1024; // Size in KB
        const totalTime = (fileSize / transferSpeed) * 1000; // Time in ms
        const steps = 20;
        const intervalTime = totalTime / steps;

        let currentProgress = 0;
        const progressInterval = setInterval(() => {
          currentProgress += 100 / steps;
          setProgress(Math.min(currentProgress, 100));

          if (currentProgress >= 100) {
            clearInterval(progressInterval);
            setTransferStatus("complete");

            // Simulate decryption
            const decrypted = AES.decrypt(encrypted, secretKey).toString(
              encryptionMode === "text" ? enc.Utf8 : enc.Base64
            );
            setDecryptedData(decrypted);
          }
        }, intervalTime);
      };

      fileReader.onerror = () => {
        setError("Error reading file");
        setTransferStatus("error");
      };

      if (encryptionMode === "text") {
        fileReader.readAsText(file);
      } else {
        fileReader.readAsArrayBuffer(file);
      }
    } catch (err) {
      setError("Transfer simulation failed: " + err.message);
      setTransferStatus("error");
    }
  }, [file, secretKey, transferSpeed, encryptionMode]);

  // Copy to clipboard
  const copyToClipboard = (data) => {
    if (data) {
      navigator.clipboard.writeText(data);
    }
  };

  // Download encrypted data
  const downloadEncrypted = () => {
    if (encryptedData) {
      const blob = new Blob([encryptedData], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name}.encrypted.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset everything
  const reset = () => {
    setFile(null);
    setSecretKey("");
    setTransferStatus("idle");
    setProgress(0);
    setEncryptedData("");
    setDecryptedData("");
    setError("");
    setTransferSpeed(75);
    setEncryptionMode("text");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Secure File Transfer Simulator
        </h1>

        {/* File Upload and Settings */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Encryption Key
              </label>
              <input
                type="text"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a secret key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transfer Speed (KB/s)
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={transferSpeed}
                onChange={(e) => setTransferSpeed(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-sm text-gray-600">{transferSpeed} KB/s</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Encryption Mode
            </label>
            <select
              value={encryptionMode}
              onChange={(e) => setEncryptionMode(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Text (UTF-8)</option>
              <option value="binary">Binary (Base64)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={simulateTransfer}
              disabled={transferStatus === "encrypting" || transferStatus === "transferring"}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaUpload className="mr-2" /> Start Transfer
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Transfer Status */}
        {transferStatus !== "idle" && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">Transfer Status</h2>
            <p className="text-sm">
              <span className="font-medium">Status:</span>{" "}
              {transferStatus === "encrypting" && "Encrypting file..."}
              {transferStatus === "transferring" && "Transferring file..."}
              {transferStatus === "complete" && "Transfer completed"}
              {transferStatus === "error" && "Transfer failed"}
            </p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{Math.round(progress)}% complete</p>
            </div>

            {/* Encrypted and Decrypted Data */}
            {encryptedData && transferStatus === "complete" && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Encrypted Data
                  </label>
                  <div className="relative">
                    <textarea
                      value={encryptedData}
                      readOnly
                      className="w-full p-2 border rounded-md bg-gray-50 h-24 font-mono text-sm"
                    />
                    <div className="absolute right-2 top-2 flex gap-2">
                      <button
                        onClick={() => copyToClipboard(encryptedData)}
                        className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <FaCopy />
                      </button>
                      <button
                        onClick={downloadEncrypted}
                        className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Decrypted Data
                  </label>
                  <div className="relative">
                    <textarea
                      value={decryptedData}
                      readOnly
                      className="w-full p-2 border rounded-md bg-gray-50 h-24 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(decryptedData)}
                      className="absolute right-2 top-2 p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>AES encryption with custom key</li>
            <li>Adjustable transfer speed simulation</li>
            <li>Text and binary encryption modes</li>
            <li>Copy and download encrypted data</li>
            <li>Decryption preview</li>
          </ul>
        </div>

        {/* Note */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> This is a local simulation. No actual network transfer occurs.
            Encryption and decryption are performed in the browser using crypto-js.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecureFileTransferSimulator;