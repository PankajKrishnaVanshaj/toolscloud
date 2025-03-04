// components/Base64FileEncoder.js
'use client';

import React, { useState } from 'react';

const Base64FileEncoder = () => {
  const [inputType, setInputType] = useState('text'); // text, file
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState(null);
  const [includeDataUri, setIncludeDataUri] = useState(false);
  const [encodedData, setEncodedData] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Encode text to Base64
  const encodeText = () => {
    try {
      if (!textInput) {
        setError('Please enter text to encode');
        return false;
      }
      const base64 = btoa(textInput);
      const result = includeDataUri ? `data:text/plain;base64,${base64}` : base64;
      setEncodedData(result);
      return true;
    } catch (err) {
      setError('Text encoding failed: ' + err.message);
      return false;
    }
  };

  // Encode file to Base64
  const encodeFile = async () => {
    if (!file) {
      setError('Please select a file to encode');
      return false;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      const result = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file); // Read as binary for accurate encoding
      });

      const byteArray = new Uint8Array(result);
      const binaryString = String.fromCharCode.apply(null, byteArray);
      const base64 = btoa(binaryString);
      const mimeType = file.type || 'application/octet-stream';
      const encoded = includeDataUri ? `data:${mimeType};base64,${base64}` : base64;

      setEncodedData(encoded);
      return true;
    } catch (err) {
      setError('File encoding failed: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEncodedData('');

    const success = inputType === 'text' ? encodeText() : await encodeFile();
    if (!success) {
      setEncodedData('');
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setEncodedData('');
    setError('');
  };

  // Copy encoded data to clipboard
  const copyToClipboard = () => {
    if (encodedData) {
      navigator.clipboard.writeText(encodedData);
    }
  };

  // Download encoded data as a text file
  const downloadAsFile = () => {
    if (encodedData) {
      const blob = new Blob([encodedData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file ? file.name.split('.')[0] : 'encoded'}_base64.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all
  const clearAll = () => {
    setInputType('text');
    setTextInput('');
    setFile(null);
    setIncludeDataUri(false);
    setEncodedData('');
    setError('');
    if (document.getElementById('fileInput')) {
      document.getElementById('fileInput').value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6">Base64 File Encoder</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Type
            </label>
            <select
              value={inputType}
              onChange={(e) => setInputType(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            >
              <option value="text">Text</option>
              <option value="file">File</option>
            </select>
          </div>

          {/* Input */}
          {inputType === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Input
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-24"
                placeholder="Enter text to encode"
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
                onChange={handleFileChange}
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          )}

          {/* Include Data URI */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={includeDataUri}
                onChange={(e) => setIncludeDataUri(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
              />
              Include Data URI Prefix
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Adds "data:[mime-type];base64," prefix for direct use (e.g., in HTML)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Encoding...' : 'Encode'}
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

        {/* Encoded Output */}
        {encodedData && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Base64 Encoded Output</h2>
            <div className="bg-gray-50 p-4 rounded border space-y-4">
              <textarea
                value={encodedData}
                readOnly
                className="w-full p-2 border rounded bg-gray-100 h-32 font-mono text-sm"
              />
              <div className="flex gap-4">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={downloadAsFile}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Download as File
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Length: {encodedData.length} characters
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Base64FileEncoder;