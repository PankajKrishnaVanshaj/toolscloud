'use client'
import React, { useState, useEffect, useRef } from 'react';
import { serialize, deserialize } from 'bson';

const JsonToBson = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [bsonOutput, setBsonOutput] = useState(null);
  const [error, setError] = useState('');
  const [isValidJson, setIsValidJson] = useState(false);
  const [history, setHistory] = useState([]); // Conversion history
  const [livePreview, setLivePreview] = useState(false); // Toggle live preview
  const fileInputRef = useRef(null);

  // Real-time JSON validation and live preview
  useEffect(() => {
    if (!jsonInput.trim()) {
      setIsValidJson(false);
      setError('');
      setBsonOutput(null);
      return;
    }
    try {
      const jsonObject = JSON.parse(jsonInput);
      setIsValidJson(true);
      setError('');
      if (livePreview) {
        const bsonResult = serialize(jsonObject);
        setBsonOutput(bsonResult);
      }
    } catch (err) {
      setIsValidJson(false);
      setError(`Invalid JSON at ${err.message}`);
      setBsonOutput(null);
    }
  }, [jsonInput, livePreview]);

  // Convert JSON to BSON (manual trigger)
  const handleConvertToBson = () => {
    try {
      const jsonObject = JSON.parse(jsonInput);
      const bsonResult = serialize(jsonObject);
      setBsonOutput(bsonResult);
      setHistory((prev) => [
        { type: 'JSON to BSON', input: jsonInput, output: bsonResult.toString('hex'), timestamp: new Date() },
        ...prev.slice(0, 9), // Limit to 10 entries
      ]);
    } catch (err) {
      setError('Conversion failed: ' + err.message);
    }
  };

  // Convert BSON back to JSON
  const handleConvertToJson = () => {
    try {
      if (!bsonOutput) throw new Error('No BSON data available');
      const jsonObject = deserialize(bsonOutput);
      const jsonString = JSON.stringify(jsonObject, null, 2);
      setJsonInput(jsonString);
      setBsonOutput(null);
      setHistory((prev) => [
        { type: 'BSON to JSON', input: bsonOutput.toString('hex'), output: jsonString, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError('BSON parsing failed: ' + err.message);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (file.type === 'application/json') {
          const jsonString = event.target.result;
          setJsonInput(jsonString);
        } else {
          const buffer = new Uint8Array(event.target.result);
          const jsonObject = deserialize(buffer);
          setJsonInput(JSON.stringify(jsonObject, null, 2));
          setBsonOutput(buffer);
        }
      } catch (err) {
        setError(`File processing failed: ${err.message}`);
      }
    };
    reader.onerror = () => setError('Error reading file');
    file.type === 'application/json' ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
  };

  // Copy to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setError('Copied to clipboard!');
    setTimeout(() => setError(''), 2000);
  };

  // Download BSON
  const handleDownload = () => {
    if (bsonOutput) {
      const blob = new Blob([bsonOutput], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `data_${Date.now()}.bson`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset
  const handleReset = () => {
    setJsonInput('');
    setBsonOutput(null);
    setError('');
    fileInputRef.current.value = null;
  };

  // Load from history
  const loadFromHistory = (entry) => {
    if (entry.type === 'JSON to BSON') {
      setJsonInput(entry.input);
      setBsonOutput(Buffer.from(entry.output, 'hex'));
    } else {
      setJsonInput(entry.output);
      setBsonOutput(Buffer.from(entry.input, 'hex'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        Advanced JSON ↔ BSON Converter
      </h2>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            JSON Input
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Enter JSON or upload a file'
            rows={8}
            className={`w-full p-3 border rounded-lg font-mono text-sm resize-y ${
              jsonInput
                ? isValidJson
                  ? 'border-green-500 shadow-green-200'
                  : 'border-red-500 shadow-red-200'
                : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md`}
          />
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/octet-stream"
            onChange={handleFileUpload}
            className="mt-2 text-sm text-gray-600"
          />
        </div>

        {/* Output Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            BSON Output (Hex)
          </h3>
          {bsonOutput ? (
            <pre className="w-full p-3 bg-white border border-gray-300 rounded-lg font-mono text-sm overflow-x-auto h-48">
              {bsonOutput.toString('hex')}
            </pre>
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500">
              No BSON output yet
            </div>
          )}
          <p className="text-xs text-gray-600 mt-1">
            {bsonOutput ? `Size: ${bsonOutput.length} bytes` : 'Awaiting conversion'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleConvertToBson}
          disabled={!isValidJson || livePreview}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Convert to BSON
        </button>
        <button
          onClick={handleConvertToJson}
          disabled={!bsonOutput}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Convert to JSON
        </button>
        <button
          onClick={() => handleCopy(bsonOutput?.toString('hex') || '')}
          disabled={!bsonOutput}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Copy Hex
        </button>
        <button
          onClick={handleDownload}
          disabled={!bsonOutput}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Download BSON
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Reset
        </button>
        <label className="flex items-center text-sm text-gray-700">
          <input
            type="checkbox"
            checked={livePreview}
            onChange={() => setLivePreview(!livePreview)}
            className="mr-2"
          />
          Live Preview
        </label>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div
          className={`mb-4 text-sm p-3 rounded-md ${
            error.includes('Copied') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
                  {entry.type} - {entry.timestamp.toLocaleString()}
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

export default JsonToBson;