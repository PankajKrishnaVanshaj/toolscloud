"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaLink,
} from "react-icons/fa";

const TextSlugifier = () => {
  const [inputText, setInputText] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    lowercase: true,
    replaceSpaces: true,
    customSeparator: "-",      // Custom separator instead of space
    removeSpecialChars: true,
    trim: true,
    maxLength: 100,
    replaceAccents: true,      // Replace accented chars (e.g., é → e)
    customReplacements: "",    // Custom char replacements (e.g., @→at)
  });

  const slugifyText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to slugify" };
    }

    let result = text;

    if (options.trim) {
      result = result.trim();
    }

    if (options.replaceAccents) {
      result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    if (options.lowercase) {
      result = result.toLowerCase();
    }

    if (options.customReplacements) {
      try {
        const replacements = options.customReplacements.split(",").map(pair => {
          const [from, to] = pair.split("→").map(s => s.trim());
          return [from, to || ""];
        });
        replacements.forEach(([from, to]) => {
          result = result.replace(new RegExp(from, "g"), to);
        });
      } catch (err) {
        return { error: "Invalid custom replacements format (use: char→replacement, ...)" };
      }
    }

    if (options.replaceSpaces) {
      result = result.replace(/\s+/g, options.customSeparator);
    }

    if (options.removeSpecialChars) {
      result = result
        .replace(new RegExp(`[^\\w${options.customSeparator}]`, "g"), "")
        .replace(new RegExp(`${options.customSeparator}+`, "g"), options.customSeparator);
    }

    if (options.maxLength > 0 && result.length > options.maxLength) {
      result = result.substring(0, options.maxLength).replace(new RegExp(`${options.customSeparator}$`), "");
    }

    result = result.replace(new RegExp(`^${options.customSeparator}+|${options.customSeparator}+$`, "g"), "");

    if (!result) {
      return { error: "Resulting slug is empty after processing" };
    }

    return { original: text, slug: result, changes: getChanges(text, result) };
  };

  const getChanges = (original, slug) => {
    const changes = [];
    if (original === slug) return ["No changes made"];

    if (options.replaceAccents && original.match(/[\u00C0-\u017F]/)) {
      changes.push("Replaced accented characters");
    }
    if (options.lowercase && original !== original.toLowerCase()) {
      changes.push("Converted to lowercase");
    }
    if (options.customReplacements && options.customReplacements.split(",").some(pair => original.includes(pair.split("→")[0].trim()))) {
      changes.push("Applied custom replacements");
    }
    if (options.replaceSpaces && original.includes(" ")) {
      changes.push(`Replaced spaces with "${options.customSeparator}"`);
    }
    if (options.removeSpecialChars && original.match(/[^\w\s-]/)) {
      changes.push("Removed special characters");
    }
    if (options.trim && (original.startsWith(" ") || original.endsWith(" "))) {
      changes.push("Trimmed leading/trailing spaces");
    }
    if (options.maxLength > 0 && original.length > options.maxLength) {
      changes.push(`Truncated to ${options.maxLength} characters`);
    }
    return changes.length > 0 ? changes : ["Minor cleanup applied"];
  };

  const handleSlugify = useCallback(async () => {
    setError("");
    setSlug("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = slugifyText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setSlug(result.slug);
        setHistory(prev => [...prev, { input: inputText, slug: result.slug, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setSlug("");
    setError("");
    setOptions({
      lowercase: true,
      replaceSpaces: true,
      customSeparator: "-",
      removeSpecialChars: true,
      trim: true,
      maxLength: 100,
      replaceAccents: true,
      customReplacements: "",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(0, value) : value,
    }));
  };

  const exportSlug = () => {
    const content = `Original Text:\n${inputText}\n\nSlug:\n${slug}\n\nChanges Applied:\n${slugifyText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `slug_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Slugifier
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Slugify:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-40 sm:h-48 resize-y transition-all"
              placeholder="e.g., My Blog Post Title! é@"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Slugification Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Separator:</label>
                <input
                  type="text"
                  value={options.customSeparator}
                  onChange={(e) => handleOptionChange("customSeparator", e.target.value || "-")}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  maxLength="5"
                  placeholder="e.g., - or _"
                  disabled={!options.replaceSpaces}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Length:</label>
                <input
                  type="number"
                  value={options.maxLength}
                  onChange={(e) => handleOptionChange("maxLength", Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min="0"
                  max="500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Replacements (char→repl, ...):</label>
                <input
                  type="text"
                  value={options.customReplacements}
                  onChange={(e) => handleOptionChange("customReplacements", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., @→at, #→hash"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.lowercase}
                    onChange={() => handleOptionChange("lowercase", !options.lowercase)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Lowercase</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.replaceSpaces}
                    onChange={() => handleOptionChange("replaceSpaces", !options.replaceSpaces)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Replace Spaces</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removeSpecialChars}
                    onChange={() => handleOptionChange("removeSpecialChars", !options.removeSpecialChars)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Remove Special Chars</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.trim}
                    onChange={() => handleOptionChange("trim", !options.trim)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Trim</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.replaceAccents}
                    onChange={() => handleOptionChange("replaceAccents", !options.replaceAccents)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Replace Accents</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSlugify}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              <FaLink className="inline mr-2" />
              {isLoading ? "Processing..." : "Slugify"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {slug && (
              <button
                onClick={exportSlug}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
              >
                <FaDownload className="inline mr-2" />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Output Display */}
        {slug && (
          <div className="mt-8 p-6 bg-orange-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Generated Slug</h2>
            <p className="mt-3 text-lg text-gray-700 break-all whitespace-pre-wrap max-h-64 overflow-y-auto">
              {slug}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {slugifyText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(slug)}
              className="mt-4 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy to Clipboard
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Slugs (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>"{entry.slug.slice(0, 20)}{entry.slug.length > 20 ? "..." : ""}"</span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setSlug(entry.slug);
                      setOptions(entry.options);
                    }}
                    className="text-orange-500 hover:text-orange-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-orange-100 rounded-lg border border-orange-300">
          <h3 className="font-semibold text-orange-700">Features</h3>
          <ul className="list-disc list-inside text-orange-600 text-sm">
            <li>Customizable separator and max length</li>
            <li>Accent normalization and custom character replacements</li>
            <li>Flexible space and special char handling</li>
            <li>Exportable slugs with history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextSlugifier;