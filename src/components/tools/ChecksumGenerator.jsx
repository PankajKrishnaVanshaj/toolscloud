"use client";
import React, { useState, useCallback, useRef } from "react";
import { MD5, SHA1, SHA256, SHA512, RIPEMD160 } from "crypto-js";
import { FaCopy, FaSync, FaDownload, FaFileUpload } from "react-icons/fa";

const ChecksumGenerator = () => {
  const [inputType, setInputType] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState(null);
  const [algorithm, setAlgorithm] = useState("sha256");
  const [outputFormat, setOutputFormat] = useState("hex");
  const [caseFormat, setCaseFormat] = useState("lower"); // lower, upper
  const [checksum, setChecksum] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const hashFunctions = {
    md5: MD5,
    sha1: SHA1,
    sha256: SHA256,
    sha512: SHA512,
    ripemd160: RIPEMD160,
  };

  // Compute checksum from text
  const computeTextChecksum = useCallback(() => {
    try {
      if (!textInput) {
        setError("Please enter text to compute checksum");
        return false;
      }
      const hash = hashFunctions[algorithm](textInput);
      let result =
        outputFormat === "base64"
          ? hash.toString(CryptoJS.enc.Base64)
          : hash.toString();
      result = caseFormat === "upper" ? result.toUpperCase() : result.toLowerCase();
      setChecksum(result);
      return true;
    } catch (err) {
      setError("Checksum computation failed: " + err.message);
      return false;
    }
  }, [textInput, algorithm, outputFormat, caseFormat]);

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

      const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(result));
      const hash = hashFunctions[algorithm](wordArray);
      let checksumResult =
        outputFormat === "base64"
          ? hash.toString(CryptoJS.enc.Base64)
          : hash.toString();
      checksumResult =
        caseFormat === "upper"
          ? checksumResult.toUpperCase()
          : checksumResult.toLowerCase();
      setChecksum(checksumResult);
      return true;
    } catch (err) {
      setError("File checksum computation failed: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [file, algorithm, outputFormat, caseFormat]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setChecksum("");

    const success =
      inputType === "text" ? computeTextChecksum() : await computeFileChecksum();
    if (!success) {
      setChecksum("");
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setChecksum("");
    setError("");
  };

  // Copy checksum to clipboard
  const copyToClipboard = () => {
    if (checksum) {
      navigator.clipboard.writeText(checksum);
    }
  };

  // Download checksum as text file
  const downloadChecksum = () => {
    if (checksum) {
      const blob = new Blob([checksum], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${algorithm}-checksum-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all inputs
  const clearAll = () => {
    setTextInput("");
    setFile(null);
    setChecksum("");
    setError("");
    setInputType("text");
    setAlgorithm("sha256");
    setOutputFormat("hex");
    setCaseFormat("lower");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Checksum Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <option value="ripemd160">RIPEMD-160</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case
              </label>
              <select
                value={caseFormat}
                onChange={(e) => setCaseFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="lower">Lowercase</option>
                <option value="upper">Uppercase</option>
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
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <span className="animate-pulse">Computing...</span>
              ) : (
                <>
                  <FaFileUpload className="mr-2" /> Generate Checksum
                </>
              )}
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
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Generated Checksum */}
        {checksum && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Generated Checksum
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="font-mono text-sm break-all text-gray-700">{checksum}</p>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="py-1 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaCopy className="mr-1" /> Copy
                </button>
                <button
                  onClick={downloadChecksum}
                  className="py-1 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-1" /> Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for MD5, SHA-1, SHA-256, SHA-512, and RIPEMD-160</li>
            <li>Text or file input options</li>
            <li>Hexadecimal or Base64 output formats</li>
            <li>Uppercase or lowercase output</li>
            <li>Copy to clipboard and download as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChecksumGenerator;