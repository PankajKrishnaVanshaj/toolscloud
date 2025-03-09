"use client";

import { useState, useEffect } from "react";
import { FaSpellCheck, FaClipboard, FaEraser, FaPlus, FaDownload } from "react-icons/fa";
import debounce from "lodash/debounce"; // You'll need to install lodash: npm install lodash

const SpellChecker = () => {
  const [text, setText] = useState("");
  const [checkedText, setCheckedText] = useState("");
  const [suggestions, setSuggestions] = useState({});
  const [customDictionary, setCustomDictionary] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Replace with your TextGears API key
  const API_KEY = "YOUR_TEXTGEARS_API_KEY";
  const API_URL = "https://api.textgears.com/spelling";

  // Debounced spell check function
  const checkSpellingAPI = debounce(async (inputText) => {
    if (!inputText.trim()) {
      setCheckedText("");
      setSuggestions({});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}?text=${encodeURIComponent(inputText)}&key=${API_KEY}`, {
        method: "GET",
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      processSpellCheckResults(inputText, data.response);
    } catch (err) {
      setError("Failed to check spelling. Please try again.");
      setCheckedText(inputText);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  const processSpellCheckResults = (originalText, apiResponse) => {
    let formattedText = originalText;
    const newSuggestions = {};

    if (apiResponse.errors && apiResponse.errors.length > 0) {
      apiResponse.errors.forEach((error) => {
        const word = error.bad;
        const regex = new RegExp(`\\b${word}\\b`, "g");
        newSuggestions[word] = error.better || [];
        formattedText = formattedText.replace(
          regex,
          `<span class="text-red-500 underline cursor-pointer" data-word="${word}">${word}</span>`
        );
      });
    }

    setCheckedText(formattedText);
    setSuggestions(newSuggestions);
  };

  // Handle text input change with auto-checking
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    checkSpellingAPI(newText);
  };

  // Handle clicking on misspelled words
  const handleMisspelledClick = (event) => {
    if (event.target.tagName === "SPAN") {
      const word = event.target.dataset.word;
      const suggestionList = suggestions[word] || [];

      const action = prompt(
        `Word: "${word}"\nSuggestions: ${suggestionList.join(", ") || "None"}\n` +
        "Enter correction or type 'add' to add to dictionary:",
        suggestionList[0] || word
      );

      if (action) {
        if (action.toLowerCase() === "add") {
          setCustomDictionary((prev) => new Set(prev).add(word.toLowerCase()));
          setText((prev) => prev); // Trigger recheck
          checkSpellingAPI(text);
        } else {
          setText((prev) => prev.replace(new RegExp(`\\b${word}\\b`, "g"), action));
        }
      }
    }
  };

  const clearText = () => {
    setText("");
    setCheckedText("");
    setSuggestions({});
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "spellchecked-text.txt";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const addToDictionary = () => {
    const word = prompt("Enter a word to add to custom dictionary:");
    if (word) {
      setCustomDictionary((prev) => new Set(prev).add(word.toLowerCase()));
      checkSpellingAPI(text); // Recheck with updated dictionary
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-2xl">
      <div className="relative">
        <textarea
          className="w-full h-48 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type or paste text here..."
          value={text}
          onChange={handleTextChange}
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
            Checking...
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition flex items-center justify-center disabled:opacity-50"
          onClick={() => checkSpellingAPI(text)}
          disabled={isLoading}
        >
          <FaSpellCheck className="mr-2" />
          Check Spelling
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition flex items-center justify-center"
          onClick={copyText}
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
          className="flex-1 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition flex items-center justify-center"
          onClick={addToDictionary}
        >
          <FaPlus className="mr-2" />
          Add Word
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition flex items-center justify-center"
          onClick={downloadText}
        >
          <FaDownload className="mr-2" />
          Download
        </button>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div
        className="mt-4 p-4 border rounded-lg bg-gray-50 cursor-pointer h-48 overflow-auto"
        dangerouslySetInnerHTML={{ __html: checkedText }}
        onClick={handleMisspelledClick}
      />

      <div className="mt-4">
        <h3 className="font-semibold text-gray-700">Suggestions</h3>
        {Object.keys(suggestions).length > 0 ? (
          <ul className="list-disc list-inside text-gray-600">
            {Object.entries(suggestions).map(([word, suggs]) => (
              <li key={word}>
                "{word}": {suggs.length > 0 ? suggs.join(", ") : "No suggestions"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No spelling issues found or text not checked yet.</p>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-100 rounded-lg border border-blue-300">
        <h3 className="font-semibold text-blue-700">Custom Dictionary</h3>
        <p className="text-sm text-blue-600">
          Words: {customDictionary.size > 0 ? Array.from(customDictionary).join(", ") : "None yet"}
        </p>
      </div>
    </div>
  );
};

export default SpellChecker;