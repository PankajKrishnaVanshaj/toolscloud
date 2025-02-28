'use client'
import React, { useState, useRef } from 'react';
import { deserialize } from 'bson';

const BsonToJson = () => {
  const [bsonInput, setBsonInput] = useState(''); // Hex string input
  const [jsonOutput, setJsonOutput] = useState(null); // JSON output
  const [error, setError] = useState('');
  const [isValidBson, setIsValidBson] = useState(false);
  const [history, setHistory] = useState([]); // Conversion history
  const fileInputRef = useRef(null);

  // Validate BSON hex input
  const validateBson = (hex) => {
    if (!hex.trim()) {
      setIsValidBson(false);
      setError('');
      return false;
    }
    if (!/^[0-9A-Fa-f]+$/.test(hex) || hex.length % 2 !== 0) {
      setIsValidBson(false);
      setError('Invalid BSON hex: Must be a valid hexadecimal string with even length');
      return false;
    }
    setIsValidBson(true);
    setError('');
    return true;
  };

  // Convert BSON hex to JSON
  const handleConvertToJson = () => {
    if (!validateBson(bsonInput)) return;
    try {
      const buffer = Buffer.from(bsonInput, 'hex');
      const jsonObject = deserialize(buffer);
      const jsonString = JSON.stringify(jsonObject, null, 2);
      setJsonOutput(jsonString);
      setHistory((prev) => [
        { input: bsonInput, output: jsonString, timestamp: new Date() },
        ...prev.slice(0, 9), // Limit to 10 entries
      ]);
    } catch (err) {
      setError(`BSON parsing failed: ${err.message}`);
      setJsonOutput(null);
    }
  };

  // Handle file upload (BSON binary file)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = new Uint8Array(event.target.result);
        const jsonObject = deserialize(buffer);
        const jsonString = JSON.stringify(jsonObject, null, 2);
        setBsonInput(buffer.toString('hex')); // Display hex in input
        setJsonOutput(jsonString);
        setHistory((prev) => [
          { input: buffer.toString('hex'), output: jsonString, timestamp: new Date() },
          ...prev.slice(0, 9),
        ]);
      } catch (err) {
        setError(`File processing failed: ${err.message}`);
      }
    };
    reader.onerror = () => setError('Error reading file');
    reader.readAsArrayBuffer(file);
  };

  // Copy JSON output to clipboard
  const handleCopy = () => {
    if (jsonOutput) {
      navigator.clipboard.writeText(jsonOutput);
      setError('JSON copied to clipboard!');
      setTimeout(() => setError(''), 2000);
    }
  };

  // Download JSON as file
  const handleDownload = () => {
    if (jsonOutput) {
      const blob = new Blob([jsonOutput], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `data_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset
  const handleReset = () => {
    setBsonInput('');
    setJsonOutput(null);
    setError('');
    setIsValidBson(false);
    fileInputRef.current.value = null;
  };

  // Load from history
  const loadFromHistory = (entry) => {
    setBsonInput(entry.input);
    setJsonOutput(entry.output);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        BSON to JSON Converter
      </h2>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            BSON Input (Hex)
          </label>
          <textarea
            value={bsonInput}
            onChange={(e) => {
              setBsonInput(e.target.value);
              validateBson(e.target.value);
            }}
            placeholder="Enter BSON hex string (e.g., 1e000000026e616d6500050000004a6f686e00...)"
            rows={8}
            className={`w-full p-3 border rounded-lg font-mono text-sm resize-y ${
              bsonInput
                ? isValidBson
                  ? 'border-green-500 shadow-green-200'
                  : 'border-red-500 shadow-red-200'
                : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md`}
          />
          <input
            type="file"
            ref={fileInputRef}
            accept=".bson,application/octet-stream"
            onChange={handleFileUpload}
            className="mt-2 text-sm text-gray-600"
          />
        </div>

        {/* Output Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            JSON Output
          </h3>
          {jsonOutput ? (
            <pre className="w-full p-3 bg-white border border-gray-300 rounded-lg font-mono text-sm overflow-x-auto h-48">
              {jsonOutput}
            </pre>
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500">
              No JSON output yet
            </div>
          )}
          <p className="text-xs text-gray-600 mt-1">
            {jsonOutput ? `Length: ${jsonOutput.length} characters` : 'Awaiting conversion'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleConvertToJson}
          disabled={!isValidBson}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Convert to JSON
        </button>
        <button
          onClick={handleCopy}
          disabled={!jsonOutput}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Copy JSON
        </button>
        <button
          onClick={handleDownload}
          disabled={!jsonOutput}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Download JSON
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div
          className={`mb-4 text-sm p-3 rounded-md ${
            error.includes('copied') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {error}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Conversion History</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((entry, index) => (
              <div
                key={index}
                onClick={() => loadFromHistory(entry)}
                className="p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <p className="text-sm font-medium text-gray-800">
                  BSON to JSON - {entry.timestamp.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  Input: {entry.input.slice(0, 50)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BsonToJson;