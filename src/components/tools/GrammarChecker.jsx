"use client";

import { useState, useEffect } from "react";
import {
  FaClipboard,
  FaEraser,
  FaDownload,
  FaSync,
  FaCheck,
  FaSave,
  FaCog,
} from "react-icons/fa";
import debounce from "lodash/debounce";

const GrammarChecker = () => {
  const [text, setText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("en-US");
  const [autoSave, setAutoSave] = useState(false);
  const [customRules, setCustomRules] = useState([]);
  const [showStats, setShowStats] = useState(false);

  const API_URL = "https://api.languagetool.org/v2/check";
  const LANGUAGES = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
  ];

  // Load saved text from localStorage
  useEffect(() => {
    const savedText = localStorage.getItem("grammarText");
    if (savedText) setText(savedText);
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (autoSave) {
      localStorage.setItem("grammarText", text);
    }
  }, [text, autoSave]);

  const checkGrammarAPI = debounce(async (inputText) => {
    if (!inputText.trim()) {
      setCorrectedText("");
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          text: inputText,
          language,
        }),
      });

      if (!response.ok) throw new Error("Grammar check failed");

      const data = await response.json();
      processGrammarResults(inputText, data);
    } catch (err) {
      setError("Failed to check grammar. Please try again.");
      setCorrectedText(inputText);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  const processGrammarResults = (originalText, apiResponse) => {
    let formattedText = originalText;
    const newSuggestions = [];

    // Apply custom rules first
    customRules.forEach((rule, index) => {
      const regex = new RegExp(rule.pattern, "gi");
      formattedText = formattedText.replace(regex, (match) => {
        const id = `custom-${index}-${Date.now()}`;
        newSuggestions.push({
          id,
          badText: match,
          message: rule.message,
          suggestions: [rule.replacement],
        });
        return `<span class="text-red-500 underline cursor-pointer" data-id="${id}">${match}</span>`;
      });
    });

    // Apply API results
    if (apiResponse.matches && apiResponse.matches.length > 0) {
      apiResponse.matches.forEach((match, index) => {
        const { offset, length, message, replacements } = match;
        const badText = originalText.substr(offset, length);
        const id = `grammar-${index}`;
        newSuggestions.push({
          id,
          badText,
          message,
          suggestions: replacements.map((r) => r.value),
        });

        formattedText =
          formattedText.substring(0, offset) +
          `<span class="text-red-500 underline cursor-pointer" data-id="${id}">${badText}</span>` +
          formattedText.substring(offset + length);
      });
    }

    setCorrectedText(formattedText);
    setSuggestions(newSuggestions);
  };

  const handleInputChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    checkGrammarAPI(newText);
  };

  const handleCorrectionClick = (event) => {
    if (event.target.tagName === "SPAN") {
      const id = event.target.dataset.id;
      const suggestion = suggestions.find((s) => s.id === id);
      if (!suggestion) return;

      const action = prompt(
        `Issue: ${suggestion.message}\nSuggestions: ${suggestion.suggestions.join(", ") || "None"}\n` +
        "Enter correction:",
        suggestion.suggestions[0] || suggestion.badText
      );

      if (action) {
        setText((prev) => prev.replace(suggestion.badText, action));
      }
    }
  };

  const applyAllSuggestions = () => {
    let newText = text;
    suggestions.forEach((sugg) => {
      if (sugg.suggestions.length > 0) {
        newText = newText.replace(sugg.badText, sugg.suggestions[0]);
      }
    });
    setText(newText);
    checkGrammarAPI(newText);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  const clearText = () => {
    setText("");
    setCorrectedText("");
    setSuggestions([]);
    if (autoSave) localStorage.removeItem("grammarText");
  };

  const downloadTextFile = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "grammar_checked_text.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const addCustomRule = () => {
    const pattern = prompt("Enter pattern to match (e.g., 'dont'):");
    const replacement = prompt("Enter replacement (e.g., 'don't'):");
    const message = prompt("Enter description (e.g., 'Use contraction'):");
    if (pattern && replacement && message) {
      setCustomRules((prev) => [
        ...prev,
        { pattern, replacement, message },
      ]);
      checkGrammarAPI(text);
    }
  };

  const getTextStats = () => {
    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    return { words, chars, sentences };
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-xl rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            checkGrammarAPI(text);
          }}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <label className="flex items-center text-gray-700">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="mr-2"
            />
            Auto-Save
          </label>
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 text-blue-500 hover:text-blue-700"
          >
            <FaCog />
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          className="w-full h-56 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 resize-y"
          placeholder="Type or paste text here..."
          value={text}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm animate-pulse">
            Checking...
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition flex items-center justify-center disabled:opacity-50"
          onClick={() => checkGrammarAPI(text)}
          disabled={isLoading}
        >
          <FaSync className="mr-2" />
          Check Grammar
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition flex items-center justify-center disabled:opacity-50"
          onClick={applyAllSuggestions}
          disabled={isLoading || suggestions.length === 0}
        >
          <FaCheck className="mr-2" />
          Apply All
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition flex items-center justify-center"
          onClick={copyToClipboard}
        >
          <FaClipboard className="mr-2" />
          Copy
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center justify-center"
          onClick={clearText}
        >
          <FaEraser className="mr-2" />
          Clear
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition flex items-center justify-center"
          onClick={downloadTextFile}
        >
          <FaDownload className="mr-2" />
          Download
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition flex items-center justify-center"
          onClick={addCustomRule}
        >
          <FaSave className="mr-2" />
          Add Rule
        </button>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div
        className="mt-4 p-4 border rounded-lg bg-gray-50 cursor-pointer h-56 overflow-auto"
        dangerouslySetInnerHTML={{ __html: correctedText || text }}
        onClick={handleCorrectionClick}
      />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-gray-700">Suggestions</h3>
          {suggestions.length > 0 ? (
            <ul className="list-disc list-inside text-gray-600 max-h-40 overflow-auto">
              {suggestions.map((sugg) => (
                <li key={sugg.id}>
                  "{sugg.badText}": {sugg.message} - Suggestions:{" "}
                  {sugg.suggestions.join(", ") || "None"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              No grammar issues found or text not checked yet.
            </p>
          )}
        </div>

        {showStats && (
          <div>
            <h3 className="font-semibold text-gray-700">Text Statistics</h3>
            <ul className="text-gray-600">
              <li>Words: {getTextStats().words}</li>
              <li>Characters: {getTextStats().chars}</li>
              <li>Sentences: {getTextStats().sentences}</li>
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
        <h3 className="font-semibold text-blue-700">Custom Rules</h3>
        {customRules.length > 0 ? (
          <ul className="list-disc list-inside text-blue-600 text-sm">
            {customRules.map((rule, index) => (
              <li key={index}>
                "{rule.pattern}" → "{rule.replacement}": {rule.message}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-blue-600 text-sm">No custom rules added yet.</p>
        )}
      </div>
    </div>
  );
};

export default GrammarChecker;