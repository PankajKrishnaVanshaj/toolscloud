"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaCopy, FaTrash, FaPlus, FaDownload, FaSync, FaSearch } from "react-icons/fa";
import { saveAs } from "file-saver"; // For exporting items

const ClipboardManager = () => {
  const [clipboardItems, setClipboardItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [maxItems, setMaxItems] = useState(15);
  const [expandedItem, setExpandedItem] = useState(null);
  const inputRef = useRef(null);

  // Load initial clipboard content
  useEffect(() => {
    const loadClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && !clipboardItems.includes(text)) {
          setClipboardItems([text]);
        }
      } catch (err) {
        setError("Clipboard access denied initially. Add items manually below.");
      }
    };
    loadClipboard();
  }, []);

  // Add new item manually
  const addItem = useCallback(() => {
    if (newItem.trim() && !clipboardItems.includes(newItem.trim())) {
      setClipboardItems((prev) => [newItem.trim(), ...prev].slice(0, maxItems));
      setNewItem("");
      setError("");
    } else if (!newItem.trim()) {
      setError("Please enter some text to add.");
    }
  }, [newItem, clipboardItems, maxItems]);

  // Copy item to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setError("Copied to clipboard!");
      setTimeout(() => setError(""), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard.");
    }
  };

  // Delete item
  const deleteItem = (index) => {
    setClipboardItems((prev) => prev.filter((_, i) => i !== index));
    setExpandedItem(null);
    setError("");
  };

  // Clear all items
  const clearAll = () => {
    setClipboardItems([]);
    setExpandedItem(null);
    setSearchTerm("");
    setError("");
  };

  // Read current clipboard
  const readClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && !clipboardItems.includes(text)) {
        setClipboardItems((prev) => [text, ...prev].slice(0, maxItems));
      }
      setError("");
    } catch (err) {
      setError("Clipboard access denied. Paste manually below.");
    }
  };

  // Export items as text file
  const exportItems = () => {
    const blob = new Blob([clipboardItems.join("\n\n---\n\n")], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, `clipboard-items-${Date.now()}.txt`);
  };

  // Filter items based on search
  const filteredItems = clipboardItems.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Clipboard Manager
        </h1>

        {/* Add New Item */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addItem()}
              placeholder="Paste or type text here"
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={addItem}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                title="Add to clipboard list"
              >
                <FaPlus />
              </button>
              <button
                onClick={readClipboard}
                className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                title="Read from clipboard"
              >
                <FaCopy />
              </button>
            </div>
          </div>

          {/* Search and Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Items ({maxItems})
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={maxItems}
                onChange={(e) => setMaxItems(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Clipboard Items */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <h2 className="text-lg font-semibold text-gray-800">Clipboard Items</h2>
            {clipboardItems.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={exportItems}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                >
                  <FaDownload className="mr-1" /> Export
                </button>
                <button
                  onClick={clearAll}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm flex items-center"
                >
                  <FaSync className="mr-1" /> Clear All
                </button>
              </div>
            )}
          </div>

          {filteredItems.length > 0 ? (
            <ul className="space-y-3 max-h-[50vh] overflow-y-auto border p-4 rounded-lg bg-gray-50">
              {filteredItems.map((item, index) => (
                <li
                  key={index}
                  className="p-3 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="text-sm text-gray-700 break-all flex-1 mr-4 cursor-pointer"
                      onClick={() =>
                        setExpandedItem(expandedItem === index ? null : index)
                      }
                    >
                      {expandedItem === index
                        ? item
                        : item.length > 100
                        ? `${item.substring(0, 100)}...`
                        : item}
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
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
              {searchTerm
                ? "No matching items found."
                : "No items yet. Add something above!"}
            </p>
          )}
        </div>

        {/* Status Message */}
        {error && (
          <p
            className={`text-sm text-center ${
              error.includes("Copied") ? "text-green-600" : "text-red-600"
            }`}
          >
            {error}
          </p>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Read and copy from/to system clipboard</li>
            <li>Add items manually or via clipboard</li>
            <li>Search through stored items</li>
            <li>Adjustable maximum item limit (5-50)</li>
            <li>Expand long items on click</li>
            <li>Export all items as a text file</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Items are stored locally during your session. Browser permissions are required for clipboard access.
        </p>
      </div>
    </div>
  );
};

export default ClipboardManager;