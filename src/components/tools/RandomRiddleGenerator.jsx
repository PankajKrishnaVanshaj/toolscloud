"use client";
import React, { useState, useCallback, useEffect } from "react";
import { FaDice, FaEye, FaEyeSlash, FaSync } from "react-icons/fa";
import axios from "axios";

const RandomRiddleGenerator = () => {
  const [riddle, setRiddle] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const difficulties = ["easy", "medium", "hard"];
  const categories = ["objects", "nature", "concepts", "words"];

  // Helper to assign random difficulty and category
  const assignAttributes = () => ({
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
  });

  // Filter and generate riddle
  const generateRiddle = useCallback(async () => {
    setShowAnswer(false);
    setLoading(true);
    setError(null);

    try {
      // Fetch random riddle from API
      const response = await axios.get("https://riddles-api.vercel.app/random");
      const { riddle: question, answer } = response.data;

      if (!question || !answer) {
        throw new Error("Invalid riddle data received.");
      }

      // Assign random difficulty and category
      const attributes = assignAttributes();
      const newRiddle = {
        structure: question,
        answer,
        difficulty: attributes.difficulty,
        category: attributes.category,
      };

      // Apply filters
      if (
        (difficulty !== "all" && newRiddle.difficulty !== difficulty) ||
        (category !== "all" && newRiddle.category !== category)
      ) {
        // Fetch another riddle if filters don't match
        generateRiddle();
        return;
      }

      setRiddle(newRiddle);
      setHistory((prev) => [...prev, newRiddle].slice(-5)); // Keep last 5
    } catch (err) {
      setError("Failed to fetch a riddle. Please try again.");
      setRiddle(null);
    } finally {
      setLoading(false);
    }
  }, [difficulty, category]);

  // Initial fetch on mount
  useEffect(() => {
    generateRiddle();
  }, [generateRiddle]);

  const toggleAnswer = () => setShowAnswer(!showAnswer);

  // Reset to default settings
  const reset = () => {
    setRiddle(null);
    setShowAnswer(false);
    setDifficulty("all");
    setCategory("all");
    setHistory([]);
    generateRiddle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Riddle Generator
        </h1>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All</option>
              <option value="objects">Objects</option>
              <option value="nature">Nature</option>
              <option value="concepts">Concepts</option>
              <option value="words">Words</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generateRiddle}
            disabled={loading}
            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaDice className="mr-2" /> Generate Riddle
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Riddle Display */}
        {loading ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">Loading riddle...</p>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        ) : riddle ? (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <p className="text-gray-700 mb-4 text-lg">{riddle.structure}</p>
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={toggleAnswer}
                className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center"
              >
                {showAnswer ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
                {showAnswer ? "Hide Answer" : "Show Answer"}
              </button>
            </div>
            {showAnswer && (
              <p className="mt-4 text-purple-600 font-semibold text-lg">
                Answer: {riddle.answer}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Difficulty: {riddle.difficulty} | Category: {riddle.category}
            </p>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Click "Generate Riddle" to start the fun!
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Recent Riddles</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1 max-h-40 overflow-y-auto">
              {history.slice().reverse().map((r, index) => (
                <li key={index}>
                  {r.structure} <span className="font-semibold">({r.answer})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm space-y-1">
            <li>Filter by difficulty (Easy, Medium, Hard)</li>
            <li>Filter by category (Objects, Nature, Concepts, Words)</li>
            <li>Show bodem answer</li>
            <li>History of recent riddles (up to 5)</li>
            <li>Reset to default settings</li>
            <li>Fresh riddles from an online API</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomRiddleGenerator;