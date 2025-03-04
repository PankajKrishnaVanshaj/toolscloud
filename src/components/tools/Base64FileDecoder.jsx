// components/Base64FileDecoder.js
'use client';

import React, { useState } from 'react';

const Base64FileDecoder = () => {
  const [base64Input, setBase64Input] = useState('');
  const [fileName, setFileName] = useState('decoded_file');
  const [mimeType, setMimeType] = useState(''); // Optional user-specified MIME type
  const [decodedData, setDecodedData] = useState(null);
  const [error, setError] = useState('');

  // Decode Base64 and process
  const decodeBase64 = () => {
    setError('');
    setDecodedData(null);

    if (!base64Input.trim()) {
      setError('Please enter a Base64 string to decode');
      return;
    }

    try {
      // Remove any data URI prefix if present (e.g., "data:image/png;base64,")
      const base64String = base64Input.replace(/^data:[^;]+;base64,/, '');
      const binaryString = atob(base64String);
      const byteArray = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }

      // Create Blob with optional MIME type
      const blob = new Blob([byteArray], { type: mimeType || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      // Attempt to detect if it's text for preview
      let textPreview = null;
      try {
        const decoder = new TextDecoder('utf-8');
        textPreview = decoder.decode(byteArray.slice(0, 1024)); // Limit preview to 1KB
        if (!/^[ -~\t\n\r]*$/.test(textPreview)) { // Check if printable ASCII
          textPreview = null; // Not text
        }
      } catch (e) {
        textPreview = null;
      }

      setDecodedData({
        url,
        size: byteArray.length,
        textPreview,
        blob
      });
    } catch (err) {
      setError('Decoding failed: Invalid Base64 string');
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    decodeBase64();
  };

  // Download decoded file
  const downloadFile = () => {
    if (decodedData && decodedData.url) {
      const link = document.createElement('a');
      link.href = decodedData.url;
      link.download = `${fileName || 'decoded_file'}${mimeType ? '' : '.bin'}`;
      link.click();
    }
  };

  // Copy text preview to clipboard
  const copyToClipboard = () => {
    if (decodedData && decodedData.textPreview) {
      navigator.clipboard.writeText(decodedData.textPreview);
    }
  };

  // Clear all
  const clearAll = () => {
    setBase64Input('');
    setFileName('decoded_file');
    setMimeType('');
    setDecodedData(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6">Base64 File Decoder</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Base64 Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base64 String
            </label>
            <textarea
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-32 font-mono text-sm"
              placeholder="Paste Base64-encoded string here"
            />
          </div>

          {/* File Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output File Name (Optional)
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              placeholder="e.g., decoded_file"
            />
          </div>

          {/* MIME Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MIME Type (Optional)
            </label>
            <input
              type="text"
              value={mimeType}
              onChange={(e) => setMimeType(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              placeholder="e.g., image/png, text/plain"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank for generic binary file (.bin)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Decode
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mt-4">{error}</div>
        )}

        {/* Decoded Results */}
        {decodedData && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Decoded Results</h2>
            <div className="bg-gray-50 p-4 rounded border space-y-4">
              <p className="text-sm">
                <strong>File Size:</strong> {(decodedData.size / 1024).toFixed(2)} KB
              </p>
              <div className="flex gap-4">
                <button
                  onClick={downloadFile}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Download File
                </button>
                {decodedData.textPreview && (
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Copy Text Preview
                  </button>
                )}
              </div>
              {decodedData.textPreview && (
                <div>
                  <p className="text-sm font-medium">Text Preview (First 1KB):</p>
                  <textarea
                    value={decodedData.textPreview}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100 h-24 font-mono text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> Decodes Base64 to a file or text preview (if applicable). Specify MIME type for correct file handling (e.g., image/png). Text preview shows up to 1KB if content is readable.
        </p>
      </div>
    </div>
  );
};

export default Base64FileDecoder;