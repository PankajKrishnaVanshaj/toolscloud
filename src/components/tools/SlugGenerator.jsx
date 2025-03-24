"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaHistory, FaUndo } from "react-icons/fa";

const SlugGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [slug, setSlug] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    separator: "-",         // Slug separator
    toLowerCase: true,      // Convert to lowercase
    prefix: "",            // Add prefix to slug
    suffix: "",            // Add suffix to slug
    maxLength: 50,         // Maximum slug length
  });

  // Function to generate slug with options
  const generateSlug = useCallback((text) => {
    if (!text.trim()) return "";

    let result = text
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, options.separator) // Replace spaces with chosen separator
      .replace(new RegExp(`${options.separator}+`, "g"), options.separator); // Replace multiple separators

    if (options.toLowerCase) result = result.toLowerCase();
    if (options.prefix) result = `${options.prefix}${options.separator}${result}`;
    if (options.suffix) result = `${result}${options.separator}${options.suffix}`;
    if (options.maxLength) result = result.slice(0, options.maxLength);

    return result;
  }, [options]);

  // Handle input change
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    const newSlug = generateSlug(text);
    setSlug(newSlug);
  };

  // Handle form submission (for future use)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (slug) {
      setHistory((prev) => [...prev, { input: inputText, slug, options }].slice(-5));
    }
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (!slug) return;
    navigator.clipboard
      .writeText(slug)
      .then(() => {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  // Handle clear input
  const handleClear = () => {
    setInputText("");
    setSlug("");
  };

  // Handle option change
  const handleOptionChange = (key, value) => {
    setOptions((prev) => {
      const newOptions = { ...prev, [key]: value };
      setSlug(generateSlug(inputText)); // Regenerate slug with new options
      return newOptions;
    });
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setInputText(entry.input);
    setSlug(entry.slug);
    setOptions(entry.options);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full">
        {/* Alert Notification */}
        {showAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Slug copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Slug Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div>
            <label htmlFor="inputText" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Your Text
            </label>
            <input
              type="text"
              id="inputText"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Type something..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Customization Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <select
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="-">Hyphen (-)</option>
                  <option value="_">Underscore (_)</option>
                  <option value=".">Dot (.)</option>
                  <option value="">None</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.toLowerCase}
                  onChange={() => handleOptionChange("toLowerCase", !options.toLowerCase)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Lowercase</label>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prefix:</label>
                <input
                  type="text"
                  value={options.prefix}
                  onChange={(e) => handleOptionChange("prefix", e.target.value)}
                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., blog"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Suffix:</label>
                <input
                  type="text"
                  value={options.suffix}
                  onChange={(e) => handleOptionChange("suffix", e.target.value)}
                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., post"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Length:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={options.maxLength}
                  onChange={(e) =>
                    handleOptionChange("maxLength", Math.max(1, Math.min(100, Number(e.target.value) || 50)))
                  }
                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Slug Output */}
          <div>
            <label htmlFor="slugOutput" className="block text-sm font-medium text-gray-700 mb-2">
              Generated Slug
            </label>
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 break-all">
              {slug || "Your slug will appear here"}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!slug}
              className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors duration-200 ${
                slug ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
              } flex items-center justify-center`}
            >
              <FaCopy className="mr-2" />
              Copy Slug
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
            >
              <FaTrash className="mr-2" />
              Clear
            </button>
          </div>
        </form>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Slugs (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{entry.slug} (from: "{entry.input}")</span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Custom separators (hyphen, underscore, dot, or none)</li>
            <li>Optional lowercase conversion</li>
            <li>Add prefix or suffix to slugs</li>
            <li>Set maximum slug length</li>
            <li>Copy and track recent slugs</li>
          </ul>
        </div>
      </div>

      {/* Tailwind Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default SlugGenerator;