"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaCopy, FaSync, FaEye } from "react-icons/fa";

const Base64FileDecoder = () => {
  const [base64Input, setBase64Input] = useState("");
  const [fileName, setFileName] = useState("decoded_file");
  const [mimeType, setMimeType] = useState("");
  const [decodedData, setDecodedData] = useState(null);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState("auto"); // Auto, text, image
  const [autoDetectMime, setAutoDetectMime] = useState(true);

  // Common MIME types for suggestions
  const mimeTypes = [
    "image/png",
    "image/jpeg",
    "text/plain",
    "application/pdf",
    "audio/mpeg",
    "video/mp4",
    "application/octet-stream",
  ];

  // Decode Base64
  const decodeBase64 = useCallback(() => {
    setError("");
    setDecodedData(null);

    if (!base64Input.trim()) {
      setError("Please enter a Base64 string to decode");
      return;
    }

    try {
      let base64String = base64Input;
      let detectedMime = mimeType;

      // Handle data URI prefix and detect MIME type if auto-detect is enabled
      if (autoDetectMime && base64String.startsWith("data:")) {
        const match = base64String.match(/^data:([^;]+);base64,/);
        if (match) {
          detectedMime = match[1];
          base64String = base64String.replace(/^data:[^;]+;base64,/, "");
        }
      } else {
        base64String = base64String.replace(/^data:[^;]+;base64,/, "");
      }

      const binaryString = atob(base64String);
      const byteArray = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }

      const finalMimeType = detectedMime || mimeType || "application/octet-stream";
      const blob = new Blob([byteArray], { type: finalMimeType });
      const url = URL.createObjectURL(blob);

      // Text preview
      let textPreview = null;
      if (previewMode === "text" || (previewMode === "auto" && finalMimeType.startsWith("text"))) {
        try {
          const decoder = new TextDecoder("utf-8");
          textPreview = decoder.decode(byteArray.slice(0, 1024));
          if (!/^[ -~\t\n\r]*$/.test(textPreview)) {
            textPreview = null;
          }
        } catch (e) {
          textPreview = null;
        }
      }

      setDecodedData({
        url,
        size: byteArray.length,
        textPreview,
        blob,
        detectedMime: finalMimeType,
      });
    } catch (err) {
      setError("Decoding failed: Invalid Base64 string or format");
    }
  }, [base64Input, mimeType, previewMode, autoDetectMime]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    decodeBase64();
  };

  // Download file
  const downloadFile = () => {
    if (decodedData && decodedData.url) {
      const link = document.createElement("a");
      link.href = decodedData.url;
      const extension = decodedData.detectedMime.includes("octet-stream")
        ? ".bin"
        : `.${decodedData.detectedMime.split("/")[1] || "bin"}`;
      link.download = `${fileName || "decoded_file"}${extension}`;
      link.click();
    }
  };

  // Copy text preview
  const copyToClipboard = () => {
    if (decodedData && decodedData.textPreview) {
      navigator.clipboard.writeText(decodedData.textPreview);
    }
  };

  // Clear all
  const clearAll = () => {
    setBase64Input("");
    setFileName("decoded_file");
    setMimeType("");
    setDecodedData(null);
    setError("");
    setPreviewMode("auto");
    setAutoDetectMime(true);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Base64 File Decoder
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Base64 Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base64 String
            </label>
            <textarea
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-40 font-mono text-sm resize-y"
              placeholder="Paste Base64-encoded string here (e.g., data:image/png;base64,...)"
            />
          </div>

          {/* File Name and MIME Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output File Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., decoded_file"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MIME Type
              </label>
              <select
                value={mimeType}
                onChange={(e) => setMimeType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={autoDetectMime}
              >
                <option value="">Select or enter custom MIME type</option>
                {mimeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={autoDetectMime}
                  onChange={(e) => setAutoDetectMime(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-600">Auto-detect MIME type</span>
              </label>
            </div>
          </div>

          {/* Preview Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preview Mode
            </label>
            <select
              value={previewMode}
              onChange={(e) => setPreviewMode(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="auto">Auto (Detect Text/Image)</option>
              <option value="text">Text Only</option>
              <option value="image">Image Only</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaEye className="mr-2" /> Decode & Preview
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
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Decoded Results */}
        {decodedData && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Decoded Results</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p className="text-sm">
                  <strong>File Size:</strong> {(decodedData.size / 1024).toFixed(2)} KB
                </p>
                <p className="text-sm">
                  <strong>Detected MIME Type:</strong> {decodedData.detectedMime}
                </p>
              </div>

              {/* Preview */}
              {(previewMode === "image" || (previewMode === "auto" && decodedData.detectedMime.startsWith("image"))) && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                  <img
                    src={decodedData.url}
                    alt="Decoded"
                    className="max-w-full h-auto rounded-md shadow-sm max-h-64 object-contain"
                  />
                </div>
              )}
              {decodedData.textPreview && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Text Preview (First 1KB):
                  </p>
                  <textarea
                    value={decodedData.textPreview}
                    readOnly
                    className="w-full p-2 border rounded-md bg-gray-100 h-24 font-mono text-sm resize-none"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={downloadFile}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download File
                </button>
                {decodedData.textPreview && (
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <FaCopy className="mr-2" /> Copy Text
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Decode Base64 to files with custom or auto-detected MIME types</li>
            <li>Preview images or text content</li>
            <li>Download decoded file with appropriate extension</li>
            <li>Copy text preview to clipboard</li>
            <li>Auto-detection of MIME type from data URI</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Base64FileDecoder;