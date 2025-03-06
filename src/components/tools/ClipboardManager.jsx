// components/ClipboardManager.js
'use client';

import React, { useState, useEffect } from 'react';
import { FaCopy, FaTrash, FaPlus } from 'react-icons/fa';

const ClipboardManager = () => {
  const [clipboardItems, setClipboardItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [error, setError] = useState('');

  // Load initial clipboard content
  useEffect(() => {
    const loadClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && !clipboardItems.includes(text)) {
          setClipboardItems([text]);
        }
      } catch (err) {
        setError('Clipboard access denied initially. You can still add items manually.');
      }
    };
    loadClipboard();
  }, []);

  // Add new item manually
  const addItem = () => {
    if (newItem.trim() && !clipboardItems.includes(newItem.trim())) {
      setClipboardItems(prev => [newItem.trim(), ...prev].slice(0, 15)); // Limit to 15 items
      setNewItem('');
      setError('');
    } else if (!newItem.trim()) {
      setError('Please enter some text to add.');
    }
  };

  // Copy item to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setError('Copied to clipboard!');
      setTimeout(() => setError(''), 2000); // Clear success message after 2s
    } catch (err) {
      setError('Failed to copy to clipboard.');
    }
  };

  // Delete item
  const deleteItem = (index) => {
    setClipboardItems(prev => prev.filter((_, i) => i !== index));
    setError('');
  };

  // Clear all items
  const clearAll = () => {
    setClipboardItems([]);
    setError('');
  };

  // Read current clipboard
  const readClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && !clipboardItems.includes(text)) {
        setClipboardItems(prev => [text, ...prev].slice(0, 15));
      }
      setError('');
    } catch (err) {
      setError('Clipboard access denied. Paste manually below.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Clipboard Manager</h1>

      {/* Add New Item */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Paste or type text here"
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addItem}
            className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            title="Add to clipboard list"
          >
            <FaPlus />
          </button>
          <button
            onClick={readClipboard}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            title="Read from clipboard"
          >
            <FaCopy />
          </button>
        </div>
      </div>

      {/* Clipboard Items */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Clipboard Items</h2>
          {clipboardItems.length > 0 && (
            <button
              onClick={clearAll}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Clear All
            </button>
          )}
        </div>
        
        {clipboardItems.length > 0 ? (
          <ul className="space-y-3 max-h-[400px] overflow-y-auto border p-3 rounded-md bg-gray-50">
            {clipboardItems.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm"
              >
                <span className="text-sm text-gray-700 break-all flex-1 mr-2">
                  {item.length > 100 ? `${item.substring(0, 100)}...` : item}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(item)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Copy to clipboard"
                  >
                    <FaCopy />
                  </button>
                  <button
                    onClick={() => deleteItem(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Delete item"
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No items yet. Add something above!</p>
        )}
      </div>

      {/* Status Message */}
      {error && (
        <p className={`text-sm text-center ${error.includes('Copied') ? 'text-green-600' : 'text-red-600'}`}>
          {error}
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: This manager stores items locally during your session. Browser permissions are required to read the clipboard.
      </p>
    </div>
  );
};

export default ClipboardManager;