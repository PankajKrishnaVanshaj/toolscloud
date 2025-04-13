"use client";
import React, { useState, useCallback } from "react";
import { FaDice, FaShareAlt, FaBook, FaHistory } from "react-icons/fa";
import axios from "axios";

const RandomScienceFactGenerator = () => {
  const [currentFact, setCurrentFact] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    "All",
    "Astronomy",
    "Biology",
    "Human Biology",
    "Physics",
    "Chemistry",
    "Botany",
    "Geology",
    "History/Science",
    "General Science",
  ];

  // Keyword-based categorization
  const categorizeFact = (factText) => {
    const lowerFact = factText.toLowerCase();
    if (lowerFact.includes("planet") || lowerFact.includes("star") || lowerFact.includes("galaxy"))
      return "Astronomy";
    if (lowerFact.includes("cell") || lowerFact.includes("animal") || lowerFact.includes("organism"))
      return "Biology";
    if (lowerFact.includes("human") || lowerFact.includes("body") || lowerFact.includes("blood"))
      return "Human Biology";
    if (lowerFact.includes("energy") || lowerFact.includes("light") || lowerFact.includes("motion"))
      return "Physics";
    if (lowerFact.includes("chemical") || lowerFact.includes("acid") || lowerFact.includes("water"))
      return "Chemistry";
    if (lowerFact.includes("plant") || lowerFact.includes("tree") || lowerFact.includes("flower"))
      return "Botany";
    if (lowerFact.includes("earth") || lowerFact.includes("rock") || lowerFact.includes("volcano"))
      return "Geology";
    if (lowerFact.includes("history") || lowerFact.includes("ancient"))
      return "History/Science";
    return "General Science";
  };

  // Generate a random fact with category filter
  const generateFact = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Simulate delay for effect
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      let factData = null;
      let attempts = 0;
      const maxAttempts = 5; // Limit attempts to avoid infinite loops

      // Fetch facts until one matches the category (or any for "All")
      while (attempts < maxAttempts) {
        const response = await axios.get("https://uselessfacts.jsph.pl/api/v2/facts/random");
        const factText = response.data.text;
        const factCategory = categorizeFact(factText);

        if (categoryFilter === "All" || factCategory === categoryFilter) {
          factData = { fact: factText, category: factCategory };
          break;
        }
        attempts++;
      }

      if (!factData) {
        setError(`No suitable fact found for ${categoryFilter}. Try another category!`);
        setCurrentFact(null);
        setIsLoading(false);
        return;
      }

      setCurrentFact(factData);
      setHistory((prev) => [factData, ...prev].slice(0, 5)); // Keep last 5 facts
    } catch (err) {
      setError("Failed to fetch a fact. Please try again.");
      setCurrentFact(null);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter]);

  // Share fact
  const shareFact = () => {
    if (currentFact) {
      const shareText = `${currentFact.fact} (Category: ${currentFact.category})`;
      if (navigator.share) {
        navigator.share({
          title: "Science Fact",
          text: shareText,
          url: window.location.href,
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(shareText);
        alert("Copied to clipboard: " + shareText);
      }
    }
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    setCurrentFact(null);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
    <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
        Random Science Fact Generator
      </h1>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Filter
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={generateFact}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              {isLoading ? "Generating..." : "Generate Fact"}
            </button>
            {currentFact && (
              <button
                onClick={shareFact}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaShareAlt />
              </button>
            )}
          </div>
        </div>

        {/* Current Fact */}
        {error ? (
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        ) : currentFact ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-lg text-gray-800 mb-2">{currentFact.fact}</p>
            <p className="text-sm text-gray-600">Category: {currentFact.category}</p>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              {categoryFilter === "All"
                ? "Click to generate a random science fact!"
                : `No facts available for ${categoryFilter}. Try another category!`}
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-blue-700">Recent Facts</h3>
              <button
                onClick={clearHistory}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <FaHistory className="mr-1" /> Clear History
              </button>
            </div>
            <ul className="text-sm text-blue-600 space-y-2 max-h-48 overflow-y-auto">
              {history.map((fact, index) => (
                <li key={index} className="border-b border-blue-100 pb-1">
                  {fact.fact} <span className="text-xs">({fact.category})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Random facts from multiple science categories</li>
            <li>Category filtering</li>
            <li>Fact history (last 5 facts)</li>
            <li>Share facts via Web Share API or clipboard</li>
            <li>Fresh facts from an external API</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Discover fascinating science facts every day!
        </p>
      </div>
    </div>
  );
};

export default RandomScienceFactGenerator;