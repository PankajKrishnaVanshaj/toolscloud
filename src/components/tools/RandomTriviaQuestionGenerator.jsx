"use client";
import React, { useState, useCallback, useEffect } from "react";
import { FaSync, FaQuestionCircle, FaDownload } from "react-icons/fa";
import axios from "axios";

const RandomTriviaQuestionGenerator = () => {
  const [trivia, setTrivia] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("random");
  const [difficulty, setDifficulty] = useState("medium");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Category mapping for OpenTDB API
  const categories = [
    { name: "Random", id: "" },
    { name: "Science", id: "17" }, // Science & Nature
    { name: "History", id: "23" },
    { name: "Geography", id: "22" },
    { name: "PopCulture", id: "11" }, // Entertainment: Film
  ];

  // Helper function to decode HTML entities
  const decodeHtml = (text) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

  // Fetch trivia from OpenTDB API
  const generateTrivia = useCallback(async () => {
    setShowAnswer(false);
    setLoading(true);
    setError(null);

    try {
      const categoryId = categories.find((cat) => cat.name === selectedCategory).id;
      const response = await axios.get("https://opentdb.com/api.php", {
        params: {
          amount: 1,
          category: categoryId || undefined, // Empty for random
          difficulty: difficulty.toLowerCase(),
          type: "multiple", // Multiple-choice questions
        },
      });

      const questionData = response.data.results[0];
      if (!questionData) {
        setError("No questions available for this category and difficulty.");
        setTrivia(null);
        setLoading(false);
        return;
      }

      // Combine and shuffle options
      const options = [
        ...questionData.incorrect_answers,
        questionData.correct_answer,
      ].map(decodeHtml);
      const shuffledOptions = options.sort(() => Math.random() - 0.5);

      setTrivia({
        category: questionData.category,
        question: decodeHtml(questionData.question),
        options: shuffledOptions,
        answer: decodeHtml(questionData.correct_answer),
      });
    } catch (err) {
      setError("Failed to fetch trivia question. Please try again.");
      setTrivia(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, difficulty]);

  // Initial fetch on component mount
  useEffect(() => {
    generateTrivia();
  }, [generateTrivia]);

  const checkAnswer = (option) => {
    setShowAnswer(true);
    setScore((prev) => ({
      correct: prev.correct + (option === trivia.answer ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const resetScore = () => {
    setScore({ correct: 0, total: 0 });
    setTrivia(null);
    setShowAnswer(false);
    generateTrivia();
  };

  const downloadTrivia = () => {
    if (!trivia) return;
    const text = `${trivia.category}: ${trivia.question}\nOptions: ${trivia.options.join(", ")}\nAnswer: ${trivia.answer}`;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `trivia-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Trivia Question Generator
        </h1>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            >
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Score and Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="text-sm text-gray-600">
            Score: {score.correct}/{score.total} (
            {score.total > 0 ? ((score.correct / score.total) * 100).toFixed(1) : 0}%)
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateTrivia}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FaQuestionCircle className="mr-2" /> New Question
            </button>
            <button
              onClick={resetScore}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Reset Score
            </button>
            <button
              onClick={downloadTrivia}
              disabled={!trivia}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </div>

        {/* Trivia Display */}
        {loading ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">Loading question...</p>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        ) : trivia ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-purple-600">
              {trivia.category} ({difficulty})
            </h2>
            <p className="text-gray-700 mb-4">{trivia.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {trivia.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => checkAnswer(option)}
                  disabled={showAnswer}
                  className={`p-2 bg-white border rounded-md hover:bg-gray-100 transition-colors ${
                    showAnswer
                      ? option === trivia.answer
                        ? "bg-green-100 border-green-500"
                        : "bg-red-100 border-red-500"
                      : ""
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {showAnswer && (
              <p className="text-center text-green-600 font-medium">
                Answer: {trivia.answer}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaQuestionCircle className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Generate a question to start!</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Choose category or random selection</li>
            <li>Adjustable difficulty levels (Easy, Medium, Hard)</li>
            <li>Interactive answer checking with score tracking</li>
            <li>Download question as text file</li>
            <li>Fresh questions from Open Trivia Database</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomTriviaQuestionGenerator;