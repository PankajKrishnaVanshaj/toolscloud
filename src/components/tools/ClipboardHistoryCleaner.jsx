"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaClipboard, FaTrash, FaSync, FaCopy, FaDownload } from "react-icons/fa";

const ClipboardHistoryCleaner = () => {
  const [clipboardItems, setClipboardItems] = useState([]);
  const [currentClipboard, setCurrentClipboard] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [maxHistory, setMaxHistory] = useState(10);

  // Read clipboard content
  const readClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCurrentClipboard(text);
      if (text && !clipboardItems.includes(text)) {
        setClipboardItems((prev) => [text, ...prev].slice(0, maxHistory));
      }
      setError("");
    } catch (err) {
      setError("Clipboard access denied. Please grant permission or paste manually.");
    }
  }, [clipboardItems, maxHistory]);

  // Clear current clipboard
  const clearClipboard = async () => {
    try {
      await navigator.clipboard.writeText("");
      setCurrentClipboard("");
      setError("");
    } catch (err) {
      setError("Failed to clear clipboard.");
    }
  };

  // Copy item back to clipboard
  const copyToClipboard = async (item) => {
    try {
      await navigator.clipboard.writeText(item);
      setCurrentClipboard(item);
      setError("");
    } catch (err) {
      setError("Failed to copy to clipboard.");
    }
  };

  // Remove specific item from history
  const removeItem = (indexToRemove) => {
    setClipboardItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Clear all history
  const clearHistory = () => {
    setClipboardItems([]);
    setError("");
  };

  // Download history as text file
  const downloadHistory = () => {
    const text = clipboardItems.join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `clipboard-history-${Date.now()}.txt`;
    link.click();
  };

  // Initial clipboard read and auto-refresh
  useEffect(() => {
    readClipboard();
    let interval;
    if (autoRefresh) {
      interval = setInterval(readClipboard, 2000); // Check every 2 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, readClipboard]);

  // Handle manual paste
  const handlePaste = (e) => {
    const text = e.target.value;
    setCurrentClipboard(text);
    if (text && !clipboardItems.includes(text)) {
      setClipboardItems((prev) => [text, ...prev].slice(0, maxHistory));
    }
  };

  // Filtered history based on search
  const filteredItems = clipboardItems.filter((item) =>
    item.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Clipboard History Cleaner
        </h1>

        <div className="space-y-6">
          {/* Current Clipboard */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Clipboard Content
            </label>
            <textarea
              value={currentClipboard}
              onChange={handlePaste}
              placeholder="Paste content here or grant clipboard permission"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 min-h-[120px] text-sm"
            />
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <button
                onClick={readClipboard}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaClipboard className="mr-2" /> Read Clipboard
              </button>
              <button
                onClick={clearClipboard}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaTrash className="mr-2" /> Clear Clipboard
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search History
              </label>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter history..."
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max History Items ({maxHistory})
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={maxHistory}
                onChange={(e) => setMaxHistory(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Auto-Refresh Clipboard</span>
              </label>
            </div>
          </div>

          {/* Clipboard History */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Session Clipboard History ({filteredItems.length} items)
              </label>
              {clipboardItems.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={downloadHistory}
                    className="py-1 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                  >
                    <FaDownload className="mr-1" /> Download
                  </button>
                  <button
                    onClick={clearHistory}
                    className="py-1 px-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm flex items-center"
                  >
                    <FaSync className="mr-1" /> Clear All
                  </button>
                </div>
              )}
            </div>
            {filteredItems.length > 0 ? (
              <ul className="space-y-3 max-h-[300px] overflow-y-auto border p-3 rounded-md bg-gray-50">
                {filteredItems.map((item, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-700 break-all p-2 bg-white rounded-md shadow-sm flex justify-between items-center"
                  >
                    <span>
                      {item.substring(0, 150)}
                      {item.length > 150 ? "..." : ""}
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
                        onClick={() => removeItem(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Remove item"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center p-4 bg-gray-50 rounded-md">
                No items in history yet
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 text-center p-2 bg-red-50 rounded-md">{error}</p>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3> 
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Read and clear clipboard content</li>
              <li>Maintains session history with customizable limit</li>
              <li>Searchable history with filter</li>
              <li>Copy items back to clipboard</li>
              <li>Remove individual items</li>
              <li>Download history as text file</li>
              <li>Auto-refresh option</li>
            </ul>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            Note: Requires clipboard permission. History is stored locally for the session only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClipboardHistoryCleaner;