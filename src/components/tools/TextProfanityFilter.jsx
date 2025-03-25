"use client";
import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaFilter,
} from "react-icons/fa";

// Expanded profanity list (still simplified; use a library like 'bad-words' in production)
const profanityList = [
  "damn", "hell", "ass", "bitch", "fuck", "shit", "bastard", "crap", "piss", "dick",
  "cock", "pussy", "asshole", "fucker", "motherfucker", "tits", "whore", "slut",
  // Add more or integrate with a comprehensive profanity filter library
];

const TextProfanityFilter = () => {
  const [inputText, setInputText] = useState("");
  const [filteredText, setFilteredText] = useState("");
  const [profaneWords, setProfaneWords] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    censorStyle: "asterisks",  // asterisks, remove, custom, blur
    customCensor: "[CENSORED]",
    caseSensitive: false,
    showProfaneWords: true,
    wholeWordMatch: true,      // Match whole words only
    customProfanity: "",       // Additional user-defined profane words
    preserveFirstLetter: false,// Keep first letter when censoring
  });

  const filterProfanity = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to filter" };
    }

    // Combine default and custom profanity lists
    const customList = options.customProfanity.split(",").map(word => word.trim()).filter(word => word);
    const fullProfanityList = [...profanityList, ...customList];
    const regexFlags = options.caseSensitive ? "g" : "gi";
    const pattern = options.wholeWordMatch
      ? `\\b(${fullProfanityList.join("|")})\\b`
      : `(${fullProfanityList.join("|")})`;
    const profaneRegex = new RegExp(pattern, regexFlags);

    const words = text.split(/\s+/);
    const foundProfane = new Set();

    const filtered = text.replace(profaneRegex, (match) => {
      foundProfane.add(options.caseSensitive ? match : match.toLowerCase());
      let censored;
      switch (options.censorStyle) {
        case "asterisks":
          censored = options.preserveFirstLetter
            ? match[0] + "*".repeat(match.length - 1)
            : "*".repeat(match.length);
          break;
        case "remove":
          censored = "";
          break;
        case "custom":
          censored = options.customCensor;
          break;
        case "blur":
          censored = options.preserveFirstLetter
            ? match[0] + "~".repeat(match.length - 1)
            : "~".repeat(match.length);
          break;
        default:
          censored = match;
      }
      return censored;
    }).trim();

    return {
      original: text,
      filtered: filtered,
      profane: Array.from(foundProfane),
    };
  };

  const handleFilter = useCallback(async () => {
    setError("");
    setFilteredText("");
    setProfaneWords([]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = filterProfanity(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setFilteredText(result.filtered);
        setProfaneWords(result.profane);
        setHistory(prev => [...prev, { input: inputText, output: result.filtered, profane: result.profane, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setFilteredText("");
    setProfaneWords([]);
    setError("");
    setOptions({
      censorStyle: "asterisks",
      customCensor: "[CENSORED]",
      caseSensitive: false,
      showProfaneWords: true,
      wholeWordMatch: true,
      customProfanity: "",
      preserveFirstLetter: false,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const exportResult = () => {
    const content = `Input Text: ${inputText}\nCensor Style: ${options.censorStyle}${options.censorStyle === "custom" ? `\nCustom Censor: ${options.customCensor}` : ""}\nCase Sensitive: ${options.caseSensitive}\nWhole Word Match: ${options.wholeWordMatch}\nCustom Profanity: ${options.customProfanity || "None"}\nPreserve First Letter: ${options.preserveFirstLetter}\n\nFiltered Text:\n${filteredText}\n\nDetected Profanity:\n${profaneWords.join(", ") || "None"}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `filtered_text_${options.censorStyle}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Profanity Filter
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-32 sm:h-40 resize-y transition-all"
              placeholder="e.g., This is a damn good test with some crap."
              maxLength={10000}
            />
            <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Filtering Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Censor Style:</label>
                <select
                  value={options.censorStyle}
                  onChange={(e) => handleOptionChange("censorStyle", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="asterisks">Asterisks (****)</option>
                  <option value="remove">Remove</option>
                  <option value="custom">Custom Text</option>
                  <option value="blur">Blur (~~~~)</option>
                </select>
              </div>
              {options.censorStyle === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Censor:</label>
                  <input
                    type="text"
                    value={options.customCensor}
                    onChange={(e) => handleOptionChange("customCensor", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    maxLength="20"
                    placeholder="[CENSORED]"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Profanity (comma-separated):</label>
                <input
                  type="text"
                  value={options.customProfanity}
                  onChange={(e) => handleOptionChange("customProfanity", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., jerk, rude"
                  maxLength="100"
                />
              </div>
              <div className="flex flex-col gap-2">
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
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.wholeWordMatch}
                    onChange={() => handleOptionChange("wholeWordMatch", !options.wholeWordMatch)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span>Whole Word Match</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveFirstLetter}
                    onChange={() => handleOptionChange("preserveFirstLetter", !options.preserveFirstLetter)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span>Preserve First Letter</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleFilter}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <FaFilter className="inline mr-2" />
              {isLoading ? "Filtering..." : "Filter Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {filteredText && (
              <button
                onClick={exportResult}
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
        {filteredText && (
          <div className="mt-8 p-6 bg-red-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Filtered Text
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-700 break-words whitespace-pre-wrap max-h-64 overflow-auto">
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
              <FaCopy className="inline mr-2" />
              Copy Filtered Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Filters (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    "{entry.output.slice(0, 20)}..." ({entry.profane.length} profane)
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setFilteredText(entry.output);
                      setProfaneWords(entry.profane);
                      setOptions(entry.options);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-red-100 rounded-lg border border-red-300">
          <h3 className="font-semibold text-red-700">Features</h3>
          <ul className="list-disc list-inside text-red-600 text-sm">
            <li>Multiple censor styles (asterisks, remove, custom, blur)</li>
            <li>Custom profanity list support</li>
            <li>Case sensitivity and whole word matching</li>
            <li>Preserve first letter option</li>
            <li>Export results and history tracking</li>
          </ul>
          <p className="mt-2 text-xs text-red-600">Note: Profanity list is limited; use a library like 'bad-words' for production.</p>
        </div>
      </div>
    </div>
  );
};

export default TextProfanityFilter;