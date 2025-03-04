// components/SessionIDGenerator.js
'use client';

import React, { useState } from 'react';
import { generate } from 'randomstring';
import { v4 as uuidv4 } from 'uuid';

const SessionIDGenerator = () => {
  const [length, setLength] = useState(32);
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState('alphanumeric'); // alphanumeric, numeric, hex, uuid
  const [prefix, setPrefix] = useState('');
  const [sessionIds, setSessionIds] = useState([]);
  const [error, setError] = useState('');

  // Generate session IDs
  const generateSessionIds = () => {
    setError('');
    setSessionIds([]);

    if (format !== 'uuid' && (length < 16 || length > 128)) {
      setError('Length must be between 16 and 128 characters (except for UUID)');
      return;
    }
    if (count < 1 || count > 50) {
      setError('Number of IDs must be between 1 and 50');
      return;
    }

    const newSessionIds = Array.from({ length: count }, () => {
      let id;
      switch (format) {
        case 'uuid':
          id = uuidv4(); // UUID v4 is 36 characters including hyphens
          break;
        case 'hex':
          id = generate({ length, charset: 'hex' });
          break;
        case 'numeric':
          id = generate({ length, charset: 'numeric' });
          break;
        case 'alphanumeric':
        default:
          id = generate({ length, charset: 'alphanumeric', capitalization: 'uppercase' });
          break;
      }
      return prefix ? `${prefix}${id}` : id;
    });

    setSessionIds(newSessionIds);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateSessionIds();
  };

  // Copy session IDs to clipboard
  const copyToClipboard = () => {
    if (sessionIds.length > 0) {
      const text = sessionIds.join('\n');
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setSessionIds([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Session ID Generator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Length (16-128) {format === 'uuid' && '(Ignored for UUID)'}
            </label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              min={16}
              max={128}
              disabled={format === 'uuid'}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 disabled:bg-gray-100"
            />
          </div>

          {/* Number of IDs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of IDs (1-50)
            </label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              min={1}
              max={50}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            >
              <option value="alphanumeric">Alphanumeric (A-Z, 0-9)</option>
              <option value="numeric">Numeric (0-9)</option>
              <option value="hex">Hexadecimal (0-9, A-F)</option>
              <option value="uuid">UUID v4</option>
            </select>
          </div>

          {/* Prefix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prefix (Optional)
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              placeholder="e.g., SID_"
              maxLength={10}
            />
            <p className="text-xs text-gray-500 mt-1">Max 10 characters</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Generate IDs
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

        {/* Generated Session IDs */}
        {sessionIds.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Generated Session IDs</h2>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Copy All
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded border max-h-64 overflow-y-auto">
              <ul className="list-disc pl-5 font-mono text-sm">
                {sessionIds.map((id, index) => (
                  <li key={index} className="py-1 break-all">{id}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              These IDs are randomly generated and should be stored securely for session management.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionIDGenerator;