"use client";
import React, { useState, useCallback } from "react";
import { FaClipboard, FaEraser, FaCopy, FaSync, FaDownload } from "react-icons/fa";

const ClipboardTextCleaner = () => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    removeExtraSpaces: false,
    removeSpecialChars: false,
    toLowerCase: false,
    toUpperCase: false,
    trim: true,
    removeLineBreaks: false,
    removeNumbers: false,
    removeUrls: false,
    replaceSmartQuotes: false,
  });
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Read clipboard content
  const readClipboard = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      setError("");
      saveToHistory(clipboardText);
    } catch (err) {
      setError("Clipboard access denied. Please paste manually.");
    }
  }, []);

  // Clean text based on selected options
  const cleanText = useCallback(() => {
    let cleaned = text;

    if (options.trim) cleaned = cleaned.trim();
    if (options.removeExtraSpaces) cleaned = cleaned.replace(/\s+/g, " ");
    if (options.removeSpecialChars) cleaned = cleaned.replace(/[^a-zA-Z0-9\s]/g, "");
    if (options.removeLineBreaks) cleaned = cleaned.replace(/(\r\n|\n|\r)/gm, " ");
    if (options.removeNumbers) cleaned = cleaned.replace(/[0-9]/g, "");
    if (options.removeUrls)
      cleaned = cleaned.replace(
        /(https?:\/\/[^\s]+|www\.[^\s]+)/g,
        ""
      );
    if (options.replaceSmartQuotes)
      cleaned = cleaned
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"');
    if (options.toLowerCase) cleaned = cleaned.toLowerCase();
    if (options.toUpperCase) cleaned = cleaned.toUpperCase();

    setText(cleaned);
    saveToHistory(cleaned);
  }, [text, options]);

  // Copy cleaned text to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setError("Text copied to clipboard!");
      setTimeout(() => setError(""), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard.");
    }
  };

  // Download text as a file
  const downloadText = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cleaned-text-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset to initial state
  const reset = () => {
    setText("");
    setOptions({
      removeExtraSpaces: false,
      removeSpecialChars: false,
      toLowerCase: false,
      toUpperCase: false,
      trim: true,
      removeLineBreaks: false,
      removeNumbers: false,
      removeUrls: false,
      replaceSmartQuotes: false,
    });
    setHistory([]);
    setHistoryIndex(-1);
    setError("");
  };

  // Undo and Redo
  const saveToHistory = (newText) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newText);
      return newHistory.slice(-10); // Keep last 10 states
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setText(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setText(history[historyIndex + 1]);
    }
  };

  // Handle option changes
  const handleOptionChange = (option) => {
    setOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
      ...(option === "toLowerCase" && !prev[option] ? { toUpperCase: false } : {}),
      ...(option === "toUpperCase" && !prev[option] ? { toLowerCase: false } : {}),
    }));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Clipboard Text Cleaner
        </h1>

        <div className="space-y-6">
          {/* Text Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text to Clean
            </label>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                saveToHistory(e.target.value);
              }}
              placeholder="Paste your text here or use the Read Clipboard button"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[200px] text-sm"
            />
          </div>

          {/* Cleaning Options */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Cleaning Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { key: "trim", label: "Trim Edges" },
                { key: "removeExtraSpaces", label: "Remove Extra Spaces" },
                { key: "removeSpecialChars", label: "Remove Special Characters" },
                { key: "removeLineBreaks", label: "Remove Line Breaks" },
                { key: "removeNumbers", label: "Remove Numbers" },
                { key: "removeUrls", label: "Remove URLs" },
                { key: "replaceSmartQuotes", label: "Replace Smart Quotes" },
                { key: "toLowerCase", label: "Convert to Lowercase" },
                { key: "toUpperCase", label: "Convert to Uppercase" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options[key]}
                    onChange={() => handleOptionChange(key)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={readClipboard}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaClipboard className="mr-2" /> Read Clipboard
            </button>
            <button
              onClick={cleanText}
              disabled={!text}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaEraser className="mr-2" /> Clean Text
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!text}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy
            </button>
            <button
              onClick={downloadText}
              disabled={!text}
              className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Undo/Redo Buttons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Redo
            </button>
          </div>

          {/* Status Message */}
          {error && (
            <p
              className={`text-sm text-center ${
                error.includes("copied") ? "text-green-600" : "text-red-600"
              }`}
            >
              {error}
            </p>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Text History</h3>
              <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                {history.slice().reverse().map((entry, index) => (
                  <li
                    key={index}
                    className={
                      index === history.length - 1 - historyIndex ? "font-bold" : ""
                    }
                  >
                    {entry.length > 50 ? `${entry.substring(0, 50)}...` : entry}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple cleaning options including URLs and smart quotes</li>
            <li>Clipboard read/write support</li>
            <li>Undo/redo functionality with history</li>
            <li>Download cleaned text as a file</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Clipboard access requires browser permission.
        </p>
      </div>
    </div>
  );
};

export default ClipboardTextCleaner;