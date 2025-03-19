"use client";
import React, { useState, useCallback } from "react";
import { FaDice, FaShareAlt, FaBook, FaHistory } from "react-icons/fa";

const RandomScienceFactGenerator = () => {
  const [currentFact, setCurrentFact] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const scienceFacts = [
    { fact: "The shortest war in history lasted 38 minutes.", category: "History/Science" },
    { fact: "A day on Venus is longer than its year.", category: "Astronomy" },
    { fact: "Octopuses have three hearts and can change color to blend into their surroundings.", category: "Biology" },
    { fact: "The human body contains about 0.2 milligrams of gold, most of it in the blood.", category: "Human Biology" },
    { fact: "Light travels at 299,792 kilometers per second (about 186,282 miles per second).", category: "Physics" },
    { fact: "Honey never spoils; archeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible.", category: "Chemistry" },
    { fact: "The shortest bone in the human body is the stapes bone in the ear, measuring about 2.8 millimeters.", category: "Human Biology" },
    { fact: "A single bolt of lightning contains enough energy to toast 100,000 slices of bread.", category: "Physics" },
    { fact: "The largest known volcano in the solar system is Olympus Mons on Mars, standing at 22 kilometers (13.6 miles) high.", category: "Astronomy" },
    { fact: "Water expands by about 9% when it freezes into ice.", category: "Chemistry" },
    { fact: "Bamboo can grow up to 91 centimeters (35 inches) in a single day.", category: "Botany" },
    { fact: "The Earth's core is as hot as the surface of the Sun, about 5,500°C (9,932°F).", category: "Geology" },
  ];

  const categories = ["All", ...new Set(scienceFacts.map(fact => fact.category))];

  // Generate a random fact with category filter
  const generateFact = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { // Simulate a delay for effect
      const filteredFacts = categoryFilter === "All"
        ? scienceFacts
        : scienceFacts.filter(fact => fact.category === categoryFilter);
      
      if (filteredFacts.length === 0) {
        setCurrentFact(null);
        setIsLoading(false);
        return;
      }

      const randomIndex = Math.floor(Math.random() * filteredFacts.length);
      const newFact = filteredFacts[randomIndex];
      setCurrentFact(newFact);
      setHistory(prev => [newFact, ...prev].slice(0, 5)); // Keep last 5 facts
      setIsLoading(false);
    }, 500);
  }, [categoryFilter, scienceFacts]);

  // Share fact (simulated)
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
        alert("Copied to clipboard: " + shareText);
        navigator.clipboard.writeText(shareText);
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
                <option key={cat} value={cat}>{cat}</option>
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
        {currentFact ? (
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