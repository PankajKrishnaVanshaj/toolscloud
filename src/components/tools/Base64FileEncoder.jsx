"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const Base64FileEncoder = () => {
  const [inputType, setInputType] = useState("text"); // text, file
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState(null);
  const [includeDataUri, setIncludeDataUri] = useState(false);
  const [encodedData, setEncodedData] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [compression, setCompression] = useState(false); // New: Compression option
  const [outputFormat, setOutputFormat] = useState("raw"); // New: raw, json
  const fileInputRef = useRef(null);

  // Encode text to Base64
  const encodeText = useCallback(() => {
    try {
      if (!textInput) {
        setError("Please enter text to encode");
        return false;
      }
      let result = btoa(textInput);
      if (compression) {
        // Simulated compression (in reality, you'd use a compression library)
        result = btoa("compressed:" + textInput.slice(0, Math.max(textInput.length / 2, 10)));
      }
      const finalResult = includeDataUri ? `data:text/plain;base64,${result}` : result;
      setEncodedData(outputFormat === "json" ? JSON.stringify({ base64: finalResult }) : finalResult);
      return true;
    } catch (err) {
      setError("Text encoding failed: " + err.message);
      return false;
    }
  }, [textInput, includeDataUri, compression, outputFormat]);

  // Encode file to Base64
  const encodeFile = useCallback(async () => {
    if (!file) {
      setError("Please select a file to encode");
      return false;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      const result = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsArrayBuffer(file);
      });

      const byteArray = new Uint8Array(result);
      let base64 = btoa(String.fromCharCode.apply(null, byteArray));
      if (compression) {
        // Simulated compression (actual compression would require a library like pako)
        base64 = btoa("compressed:" + base64.slice(0, Math.max(base64.length / 2, 100)));
      }
      const mimeType = file.type || "application/octet-stream";
      const encoded = includeDataUri ? `data:${mimeType};base64,${base64}` : base64;
      const finalResult = outputFormat === "json" ? JSON.stringify({ base64: encoded, fileName: file.name }) : encoded;
      setEncodedData(finalResult);
      return true;
    } catch (err) {
      setError("File encoding failed: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [file, includeDataUri, compression, outputFormat]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEncodedData("");

    const success = inputType === "text" ? encodeText() : await encodeFile();
    if (!success) {
      setEncodedData("");
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setEncodedData("");
    setError("");
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (encodedData) {
      navigator.clipboard.writeText(encodedData);
    }
  };

  // Download encoded data
  const downloadAsFile = () => {
    if (encodedData) {
      const fileName = file ? file.name.split(".")[0] : "encoded";
      const extension = outputFormat === "json" ? "json" : "txt";
      const blob = new Blob([encodedData], { type: outputFormat === "json" ? "application/json" : "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}_base64.${extension}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset all
  const reset = () => {
    setInputType("text");
    setTextInput("");
    setFile(null);
    setIncludeDataUri(false);
    setCompression(false);
    setOutputFormat("raw");
    setEncodedData("");
    setError("");
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Base64 File Encoder</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Type and Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Type</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="raw">Raw Base64</option>
                <option value="json">JSON Object</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeDataUri}
                  onChange={(e) => setIncludeDataUri(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include Data URI</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={compression}
                  onChange={(e) => setCompression(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Compress Output</span>
              </label>
            </div>
          </div>

          {/* Input */}
          {inputType === "text" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Input</label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Enter text to encode"
                disabled={loading}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Input</label>
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaUpload className="mr-2" /> {loading ? "Encoding..." : "Encode"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Encoded Output */}
        {encodedData && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Base64 Encoded Output</h2>
            <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
              <textarea
                value={encodedData}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 h-40 font-mono text-sm overflow-auto"
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaCopy className="mr-2" /> Copy to Clipboard
                </button>
                <button
                  onClick={downloadAsFile}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Length: {encodedData.length} characters
                {compression && " (Simulated Compression Applied)"}
              </p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Encode text or files to Base64</li>
            <li>Optional Data URI prefix</li>
            <li>Simulated compression option</li>
            <li>Output as raw Base64 or JSON</li>
            <li>Copy to clipboard or download as file</li>
          </ul>
        </div>

        {/* Note */}
        {compression && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-700 text-sm">
              <strong>Note:</strong> Compression is simulated. For real compression, integrate a library like pako.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Base64FileEncoder;