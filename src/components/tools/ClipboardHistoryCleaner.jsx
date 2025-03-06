// components/ClipboardHistoryCleaner.js
'use client';

import React, { useState, useEffect } from 'react';

const ClipboardHistoryCleaner = () => {
  const [clipboardItems, setClipboardItems] = useState([]);
  const [currentClipboard, setCurrentClipboard] = useState('');
  const [error, setError] = useState('');

  // Read clipboard on mount and when requested
  const readClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCurrentClipboard(text);
      if (text && !clipboardItems.includes(text)) {
        setClipboardItems(prev => [text, ...prev].slice(0, 10)); // Keep last 10 items
      }
      setError('');
    } catch (err) {
      setError('Clipboard access denied. Please grant permission or paste manually.');
    }
  };

  // Clear current clipboard
  const clearClipboard = async () => {
    try {
      await navigator.clipboard.writeText('');
      setCurrentClipboard('');
      setError('');
    } catch (err) {
      setError('Failed to clear clipboard.');
    }
  };

  // Clear local history
  const clearHistory = () => {
    setClipboardItems([]);
    setError('');
  };

  // Initial clipboard read
  useEffect(() => {
    readClipboard();
  }, []);

  // Handle manual paste
  const handlePaste = (e) => {
    const text = e.target.value;
    setCurrentClipboard(text);
    if (text && !clipboardItems.includes(text)) {
      setClipboardItems(prev => [text, ...prev].slice(0, 10));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Clipboard History Cleaner</h1>

      <div className="space-y-4">
        {/* Current Clipboard */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Clipboard Content
          </label>
          <textarea
            value={currentClipboard}
            onChange={handlePaste}
            placeholder="Paste content here or grant clipboard permission"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={readClipboard}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Read Clipboard
            </button>
            <button
              onClick={clearClipboard}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Clear Clipboard
            </button>
          </div>
        </div>

        {/* Clipboard History */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Session Clipboard History (Last 10 Items)
            </label>
            {clipboardItems.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                Clear History
              </button>
            )}
          </div>
          {clipboardItems.length > 0 ? (
            <ul className="space-y-2 max-h-[200px] overflow-y-auto border p-2 rounded-md bg-gray-50">
              {clipboardItems.map((item, index) => (
                <li key={index} className="text-sm text-gray-700 break-all">
                  {item.substring(0, 100)}{item.length > 100 ? '...' : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No items in history yet</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Note */}
        <p className="text-xs text-gray-500 mt-4">
          Note: This tool can only access the current clipboard content with your permission
          and maintains a local session history. It cannot access your full system clipboard history
          due to browser security restrictions.
        </p>
      </div>
    </div>
  );
};

export default ClipboardHistoryCleaner;