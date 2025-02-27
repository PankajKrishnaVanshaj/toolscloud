"use client";
import React, { useState } from "react";

const TextTitleGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [titles, setTitles] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    tone: "neutral", // neutral, formal, casual, dramatic
    maxTitles: 5,
  });

  // Title generation templates by tone
  const titleTemplates = {
    neutral: [
      "{keyword}: A Complete Guide",
      "The Power of {keyword}",
      "How to Master {keyword}",
      "{keyword} Explained",
      "Unlocking {keyword} Secrets",
    ],
    formal: [
      "An In-Depth Analysis of {keyword}",
      "Exploring the Fundamentals of {keyword}",
      "The Essential Principles of {keyword}",
      "{keyword}: A Scholarly Perspective",
      "Understanding {keyword} in Detail",
    ],
    casual: [
      "{keyword} Hacks You’ll Wish You Knew",
      "Why {keyword} Rocks",
      "Get Good at {keyword} Fast",
      "The Chill Way to {keyword}",
      "{keyword} Made Simple",
    ],
    dramatic: [
      "{keyword}: The Shocking Truth",
      "Unveiled: The Mystery of {keyword}",
      "Will {keyword} Change Everything?",
      "The Dark Side of {keyword}",
      "{keyword} Exposed!",
    ],
  };

  // Additional words for variety
  const enhancers = {
    neutral: ["Effective", "Key", "Ultimate", "Practical", "Essential"],
    formal: ["Comprehensive", "Authoritative", "Definitive", "Rigorous", "Systematic"],
    casual: ["Cool", "Easy", "Awesome", "Quick", "Fun"],
    dramatic: ["Epic", "Stunning", "Terrifying", "Unbelievable", " Explosive"],
  };

  // Generate titles
  const generateTitles = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text or keywords to generate titles" };
    }

    const keywords = text.split(/\s*,\s*|\s+/).filter(word => word.length > 2);
    if (keywords.length === 0) {
      return { error: "Please provide meaningful keywords (at least 3 letters)" };
    }

    const selectedTemplates = titleTemplates[options.tone];
    const selectedEnhancers = enhancers[options.tone];
    const generatedTitles = [];

    for (let i = 0; i < options.maxTitles; i++) {
      const keyword = keywords[Math.floor(Math.random() * keywords.length)];
      const template = selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
      const enhancer = Math.random() > 0.5 ? selectedEnhancers[Math.floor(Math.random() * selectedEnhancers.length)] : "";
      
      let title = template.replace("{keyword}", keyword);
      if (enhancer) {
        title = `${enhancer} ${title}`;
      }

      // Capitalize first letter of each word
      title = title.replace(/\b\w/g, char => char.toUpperCase());
      generatedTitles.push(title);
    }

    return {
      original: text,
      titles: [...new Set(generatedTitles)], // Remove duplicates
    };
  };

  const handleGenerate = async () => {
    setError("");
    setTitles([]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
      const result = generateTitles(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setTitles(result.titles);
    } catch (err) {
      setError("An error occurred while generating titles");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setTitles([]);
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Title Generator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Keywords or Phrase:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-40 resize-y transition-all"
              placeholder="e.g., coding, web development, tutorial"
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/500 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Generation Options:</p>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Tone:</label>
                <select
                  value={options.tone}
                  onChange={(e) => handleOptionChange("tone", e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="neutral">Neutral</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="dramatic">Dramatic</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Max Titles:</label>
                <input
                  type="number"
                  value={options.maxTitles}
                  onChange={(e) => handleOptionChange("maxTitles", Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isLoading ? "Generating..." : "Generate Titles"}
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
        {titles.length > 0 && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Generated Titles
            </h2>
            <ul className="mt-4 space-y-3 text-gray-700">
              {titles.map((title, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
                  <span className="text-lg break-all">{title}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(title)}
                    className="ml-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-all text-sm"
                  >
                    Copy
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextTitleGenerator;