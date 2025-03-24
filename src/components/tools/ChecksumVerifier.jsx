"use client";
import React, { useState, useCallback, useRef } from "react";
import { MD5, SHA1, SHA256, SHA512 } from "crypto-js"; // Added SHA-512
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const ChecksumVerifier = () => {
  const [inputType, setInputType] = useState("text"); // text, file
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState(null);
  const [algorithm, setAlgorithm] = useState("sha256");
  const [providedChecksum, setProvidedChecksum] = useState("");
  const [computedChecksum, setComputedChecksum] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false); // New option
  const fileInputRef = useRef(null);

  const hashFunctions = {
    md5: MD5,
    sha1: SHA1,
    sha256: SHA256,
    sha512: SHA512, // Added SHA-512
  };

  // Compute checksum from text
  const computeTextChecksum = useCallback(() => {
    try {
      if (!textInput) {
        setError("Please enter text to compute checksum");
        return false;
      }
      const checksum = hashFunctions[algorithm](textInput).toString();
      setComputedChecksum(checksum);
      return true;
    } catch (err) {
      setError("Checksum computation failed: " + err.message);
      return false;
    }
  }, [textInput, algorithm]);

  // Compute checksum from file
  const computeFileChecksum = useCallback(async () => {
    if (!file) {
      setError("Please select a file");
      return false;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      const result = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsArrayBuffer(file); // Use ArrayBuffer for binary accuracy
      });

      const wordArray = hashFunctions[algorithm].lib.WordArray.create(result);
      const checksum = hashFunctions[algorithm](wordArray).toString();
      setComputedChecksum(checksum);
      return true;
    } catch (err) {
      setError("File checksum computation failed: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [file, algorithm]);

  // Verify checksum
  const verifyChecksum = useCallback(() => {
    if (!providedChecksum || !computedChecksum) {
      setVerificationResult(null);
      return;
    }
    const computed = caseSensitive ? computedChecksum : computedChecksum.toLowerCase();
    const provided = caseSensitive
      ? providedChecksum.trim()
      : providedChecksum.toLowerCase().trim();
    const isValid = computed === provided;
    setVerificationResult(isValid);
  }, [providedChecksum, computedChecksum, caseSensitive]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setComputedChecksum("");
    setVerificationResult(null);

    const success = inputType === "text" ? computeTextChecksum() : await computeFileChecksum();
    if (success) {
      verifyChecksum();
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setComputedChecksum("");
    setVerificationResult(null);
    setError("");
  };

  // Copy computed checksum to clipboard
  const copyToClipboard = () => {
    if (computedChecksum) {
      navigator.clipboard.writeText(computedChecksum);
    }
  };

  // Download checksum as text file
  const downloadChecksum = () => {
    if (computedChecksum) {
      const blob = new Blob([computedChecksum], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${algorithm}-checksum-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all
  const clearAll = () => {
    setTextInput("");
    setFile(null);
    setProvidedChecksum("");
    setComputedChecksum("");
    setVerificationResult(null);
    setError("");
    setCaseSensitive(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Checksum Verifier
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Type and Algorithm Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Type
              </label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="text">Text</option>
                <option value="file">File</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Algorithm
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
              </select>
            </div>
          </div>

          {/* Input */}
          {inputType === "text" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Input
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 h-32 resize-y"
                placeholder="Enter text to compute checksum"
                disabled={loading}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Input
              </label>
              <input
                id="fileInput"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={loading}
              />
              {file && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          )}

          {/* Provided Checksum and Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provided Checksum
              </label>
              <input
                type="text"
                value={providedChecksum}
                onChange={(e) => setProvidedChecksum(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="Enter checksum to verify against"
                disabled={loading}
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="mr-2 accent-blue-500"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">Case Sensitive Verification</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Computing..." : "Compute & Verify"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {computedChecksum && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Checksum Results</h2>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <p className="text-sm break-all">
                  <strong>Computed Checksum:</strong> {computedChecksum}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaCopy className="mr-1" /> Copy
                  </button>
                  <button
                    onClick={downloadChecksum}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaDownload className="mr-1" /> Download
                  </button>
                </div>
              </div>
              {verificationResult !== null && (
                <p
                  className={`text-sm font-medium ${
                    verificationResult ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {verificationResult ? "✓ Checksum matches" : "✗ Checksum does not match"}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for MD5, SHA-1, SHA-256, and SHA-512 algorithms</li>
            <li>Text or file input options</li>
            <li>Case-sensitive verification toggle</li>
            <li>Copy checksum to clipboard</li>
            <li>Download checksum as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChecksumVerifier;