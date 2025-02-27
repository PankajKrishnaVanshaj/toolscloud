"use client";
import React, { useState } from "react";

const TextSlugifier = () => {
  const [inputText, setInputText] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    lowercase: true,
    replaceSpaces: true,
    removeSpecialChars: true,
    trim: true,
    maxLength: 100,
  });

  // Slugification function
  const slugifyText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to slugify" };
    }

    let result = text;

    // Apply selected slugification options
    if (options.trim) {
      result = result.trim();
    }

    if (options.lowercase) {
      result = result.toLowerCase();
    }

    if (options.replaceSpaces) {
      result = result.replace(/\s+/g, "-");
    }

    if (options.removeSpecialChars) {
      // Replace common special characters with hyphens or remove them
      result = result
        .replace(/[^\w\s-]/g, "") // Remove non-word chars except spaces and hyphens
        .replace(/[-]+/g, "-");   // Collapse multiple hyphens
    }

    // Enforce max length
    if (options.maxLength > 0 && result.length > options.maxLength) {
      result = result.substring(0, options.maxLength).replace(/-$/, ""); // Trim and remove trailing hyphen
    }

    // Final cleanup
    result = result.replace(/^[-]+|[-]+$/g, ""); // Remove leading/trailing hyphens

    if (!result) {
      return { error: "Resulting slug is empty after processing" };
    }

    return {
      original: text,
      slug: result,
      changes: getChanges(text, result),
    };
  };

  // Helper to identify changes made
  const getChanges = (original, slug) => {
    const changes = [];
    if (original === slug) return ["No changes made"];

    if (options.lowercase && original !== original.toLowerCase()) {
      changes.push("Converted to lowercase");
    }
    if (options.replaceSpaces && original.includes(" ")) {
      changes.push("Replaced spaces with hyphens");
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

  const handleSlugify = async () => {
    setError("");
    setSlug("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = slugifyText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSlug(result.slug);
    } catch (err) {
      setError("An error occurred while slugifying the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setSlug("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Slugifier
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-40 resize-y transition-all"
              placeholder="e.g., My Blog Post Title!"
              maxLength={1000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/1000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Slugification Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(options).map(([key, value]) => (
                key === "maxLength" ? (
                  <div key={key} className="flex items-center space-x-2 text-sm text-gray-600">
                    <label>Max Length:</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleOptionChange(key, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min="0"
                      max="200"
                    />
                  </div>
                ) : (
                  <label key={key} className="flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleOptionChange(key, !value)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span>{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  </label>
                )
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleSlugify}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {isLoading ? "Processing..." : "Slugify"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Output Display */}
        {slug && (
          <div className="mt-8 p-6 bg-orange-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Generated Slug
            </h2>
            <p className="mt-3 text-lg text-center text-gray-700 break-all">
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
              Copy to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextSlugifier;