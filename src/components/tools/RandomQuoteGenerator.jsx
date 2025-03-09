"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const RandomQuoteGenerator = () => {
  const [quotes, setQuotes] = useState([]);
  const [count, setCount] = useState(1);
  const [category, setCategory] = useState("all");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    minLength: 0,          // Minimum quote length (words)
    maxLength: 50,         // Maximum quote length (words)
    separator: "\n",       // Separator for copy/download output
    includeAuthor: true,   // Include author in output
  });

  // Expanded quote collection
  const quoteCollection = {
    all: [
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "motivation" },
      { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi", category: "inspiration" },
      { text: "I think, therefore I am.", author: "René Descartes", category: "philosophy" },
      { text: "Laughter is the best medicine.", author: "Unknown", category: "humor" },
      { text: "To be or not to be, that is the question.", author: "William Shakespeare", category: "literature" },
      { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu", category: "motivation" },
      { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "life" },
      { text: "The best way to predict the future is to create it.", author: "Peter Drucker", category: "inspiration" },
      { text: "The unexamined life is not worth living.", author: "Socrates", category: "philosophy" },
      { text: "I’m not arguing, I’m just explaining why I’m right.", author: "Unknown", category: "humor" },
      { text: "It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.", author: "Jane Austen", category: "literature" },
    ],
    motivation: [
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
      { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
      { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
    ],
    inspiration: [
      { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
      { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
      { text: "You miss 100% of the shots you don’t take.", author: "Wayne Gretzky" },
    ],
    philosophy: [
      { text: "I think, therefore I am.", author: "René Descartes" },
      { text: "The unexamined life is not worth living.", author: "Socrates" },
      { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    ],
    humor: [
      { text: "Laughter is the best medicine.", author: "Unknown" },
      { text: "I’m not arguing, I’m just explaining why I’m right.", author: "Unknown" },
      { text: "I told my wife she was drawing her eyebrows too high. She looked surprised.", author: "Unknown" },
    ],
    literature: [
      { text: "To be or not to be, that is the question.", author: "William Shakespeare" },
      { text: "It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.", author: "Jane Austen" },
      { text: "All animals are equal, but some animals are more equal than others.", author: "George Orwell" },
    ],
  };

  const generateQuotes = useCallback(() => {
    const availableQuotes = quoteCollection[category].filter((quote) => {
      const wordCount = quote.text.split(/\s+/).length;
      return wordCount >= options.minLength && wordCount <= options.maxLength;
    });

    if (availableQuotes.length === 0) {
      setQuotes([]);
      alert("No quotes match your length criteria for this category!");
      return;
    }

    const selectedQuotes = [];
    const usedIndices = new Set();
    const maxCount = Math.min(count, availableQuotes.length);

    while (selectedQuotes.length < maxCount) {
      const randomIndex = Math.floor(Math.random() * availableQuotes.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        selectedQuotes.push(availableQuotes[randomIndex]);
      }
    }

    setQuotes(selectedQuotes);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { quotes: selectedQuotes, count, category, options },
    ].slice(-5));
  }, [count, category, options]);

  const copyToClipboard = () => {
    const text = quotes
      .map((q) => (options.includeAuthor ? `"${q.text}" - ${q.author}` : `"${q.text}"`))
      .join(options.separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = quotes
      .map((q) => (options.includeAuthor ? `"${q.text}" - ${q.author}` : `"${q.text}"`))
      .join(options.separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quotes-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearQuotes = () => {
    setQuotes([]);
    setIsCopied(false);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const restoreFromHistory = (entry) => {
    setQuotes(entry.quotes);
    setCount(entry.count);
    setCategory(entry.category);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Random Quote Generator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Quotes (1-{quoteCollection[category].length})
              </label>
              <input
                type="number"
                min="1"
                max={quoteCollection[category].length}
                value={count}
                onChange={(e) =>
                  setCount(Math.max(1, Math.min(quoteCollection[category].length, Number(e.target.value) || 1)))
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCount(Math.min(count, quoteCollection[e.target.value].length));
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="motivation">Motivation</option>
                <option value="inspiration">Inspiration</option>
                <option value="philosophy">Philosophy</option>
                <option value="humor">Humor</option>
                <option value="literature">Literature</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Length (words):</label>
                <input
                  type="number"
                  min="0"
                  max={options.maxLength}
                  value={options.minLength}
                  onChange={(e) =>
                    handleOptionChange("minLength", Math.max(0, Math.min(options.maxLength, Number(e.target.value) || 0)))
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Length (words):</label>
                <input
                  type="number"
                  min={options.minLength}
                  max="100"
                  value={options.maxLength}
                  onChange={(e) =>
                    handleOptionChange("maxLength", Math.max(options.minLength, Math.min(100, Number(e.target.value) || 50)))
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Separator:</label>
                <select
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="\n">Newline</option>
                  <option value=", ">Comma</option>
                  <option value=" ">Space</option>
                  <option value="; ">Semicolon</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeAuthor}
                  onChange={() => handleOptionChange("includeAuthor", !options.includeAuthor)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Author</label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateQuotes}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Quotes
            </button>
            {quotes.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${
                    isCopied ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-600 hover:bg-gray-700 text-white"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearQuotes}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output Display */}
        {quotes.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              Generated Quotes ({quotes.length}):
            </h2>
            <div className="mt-3 text-gray-700 max-h-96 overflow-y-auto space-y-4">
              {quotes.map((quote, index) => (
                <div key={index}>
                  <p className="italic text-gray-800">"{quote.text}"</p>
                  <p className="text-sm text-gray-600 mt-1">— {quote.author}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Generations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.quotes.length} quotes ({entry.category}, {entry.options.minLength}-{entry.options.maxLength} words)
                  </span>
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
            <li>Generate quotes by category</li>
            <li>Filter by minimum and maximum word length</li>
            <li>Customizable output separator and author inclusion</li>
            <li>Copy, download, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomQuoteGenerator;