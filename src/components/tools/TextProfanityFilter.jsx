"use client";
import React, { useState } from "react";

// Simplified profanity list (expandable; in a real app, use a comprehensive library or API)
const profanityList = [
  "damn", "hell", "ass", "bitch", "fuck", "shit", "bastard", "crap", "piss", "dick",
  // Add more as needed, or integrate with an external profanity filter library
];

const TextProfanityFilter = () => {
  const [inputText, setInputText] = useState("");
  const [filteredText, setFilteredText] = useState("");
  const [profaneWords, setProfaneWords] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    censorStyle: "asterisks", // asterisks, remove, custom
    customCensor: "[CENSORED]",
    caseSensitive: false,
    showProfaneWords: true,
  });

  // Filter profanity from text
  const filterProfanity = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to filter" };
    }

    const words = text.split(/\s+/);
    const foundProfane = new Set();
    const regexFlags = options.caseSensitive ? "" : "i";
    const profaneRegex = new RegExp(`\\b(${profanityList.join("|")})\\b`, regexFlags);

    const filtered = words.map(word => {
      if (profaneRegex.test(word)) {
        foundProfane.add(options.caseSensitive ? word : word.toLowerCase());
        switch (options.censorStyle) {
          case "asterisks":
            return word.replace(/./g, "*");
          case "remove":
            return "";
          case "custom":
            return options.customCensor;
          default:
            return word;
        }
      }
      return word;
    }).filter(word => word.length > 0).join(" ");

    return {
      original: text,
      filtered: filtered,
      profane: Array.from(foundProfane),
    };
  };

  const handleFilter = async () => {
    setError("");
    setFilteredText("");
    setProfaneWords([]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = filterProfanity(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setFilteredText(result.filtered);
      setProfaneWords(result.profane);
    } catch (err) {
      setError("An error occurred while filtering the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setFilteredText("");
    setProfaneWords([]);
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Profanity Filter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Filter:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-40 resize-y transition-all"
              placeholder="e.g., This is a damn good test with some crap."
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Filtering Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Censor Style:</label>
                <select
                  value={options.censorStyle}
                  onChange={(e) => handleOptionChange("censorStyle", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="asterisks">Asterisks (****)</option>
                  <option value="remove">Remove</option>
                  <option value="custom">Custom Text</option>
                </select>
              </div>
              {options.censorStyle === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Censor:</label>
                  <input
                    type="text"
                    value={options.customCensor}
                    onChange={(e) => handleOptionChange("customCensor", e.target.value)}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    maxLength="20"
                  />
                </div>
              )}
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.caseSensitive}
                  onChange={() => handleOptionChange("caseSensitive", !options.caseSensitive)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <span>Case Sensitive</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.showProfaneWords}
                  onChange={() => handleOptionChange("showProfaneWords", !options.showProfaneWords)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <span>Show Detected Profanity</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleFilter}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isLoading ? "Filtering..." : "Filter Text"}
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
        {filteredText && (
          <div className="mt-8 p-6 bg-red-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Filtered Text
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words">
              {filteredText}
            </p>
            {options.showProfaneWords && profaneWords.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium">Detected Profanity:</p>
                <ul className="list-disc list-inside mt-2">
                  {profaneWords.map((word, index) => (
                    <li key={index}>{word}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={() => navigator.clipboard.writeText(filteredText)}
              className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold"
            >
              Copy Filtered Text to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextProfanityFilter;