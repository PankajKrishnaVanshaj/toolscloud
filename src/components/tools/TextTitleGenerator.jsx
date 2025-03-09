"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaMagic,
} from "react-icons/fa";

const TextTitleGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [titles, setTitles] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    tone: "neutral",
    maxTitles: 5,
    lengthPreference: "medium", // short, medium, long
    includeEnhancers: true,
    customTemplate: "",         // User-defined template
    maxLength: 60,              // Max chars per title
  });

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

  const enhancers = {
    neutral: ["Effective", "Key", "Ultimate", "Practical", "Essential"],
    formal: ["Comprehensive", "Authoritative", "Definitive", "Rigorous", "Systematic"],
    casual: ["Cool", "Easy", "Awesome", "Quick", "Fun"],
    dramatic: ["Epic", "Stunning", "Terrifying", "Unbelievable", "Explosive"],
  };

  const lengthAdjustments = {
    short: (title) => title.split(" ").slice(0, 4).join(" "),
    medium: (title) => title,
    long: (title) => `${title} for Everyone`,
  };

  const generateTitles = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text or keywords to generate titles" };
    }

    const keywords = text.split(/\s*,\s*|\s+/).filter(word => word.length > 2);
    if (keywords.length === 0) {
      return { error: "Please provide meaningful keywords (at least 3 letters)" };
    }

    const templates = options.customTemplate
      ? [options.customTemplate]
      : titleTemplates[options.tone];
    const selectedEnhancers = enhancers[options.tone];
    const generatedTitles = new Set();

    while (generatedTitles.size < options.maxTitles && generatedTitles.size < templates.length * keywords.length * 2) {
      const keyword = keywords[Math.floor(Math.random() * keywords.length)];
      const template = templates[Math.floor(Math.random() * templates.length)];
      const enhancer = options.includeEnhancers && Math.random() > 0.5
        ? selectedEnhancers[Math.floor(Math.random() * selectedEnhancers.length)]
        : "";
      
      let title = template.replace("{keyword}", keyword);
      if (enhancer) title = `${enhancer} ${title}`;
      title = lengthAdjustments[options.lengthPreference](title);
      title = title.replace(/\b\w/g, char => char.toUpperCase());

      if (options.maxLength > 0 && title.length > options.maxLength) {
        title = title.substring(0, options.maxLength).trim();
      }

      if (title) generatedTitles.add(title);
    }

    return { original: text, titles: Array.from(generatedTitles) };
  };

  const handleGenerate = useCallback(async () => {
    setError("");
    setTitles([]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = generateTitles(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setTitles(result.titles);
        setHistory(prev => [...prev, { input: inputText, titles: result.titles, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setTitles([]);
    setError("");
    setOptions({
      tone: "neutral",
      maxTitles: 5,
      lengthPreference: "medium",
      includeEnhancers: true,
      customTemplate: "",
      maxLength: 60,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : value,
    }));
  };

  const exportTitles = () => {
    const content = `Input: ${inputText}\n\nGenerated Titles:\n${titles.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `titles_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Title Generator
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-40 sm:h-48 resize-y transition-all"
              placeholder="e.g., coding, web development, tutorial"
              maxLength={1000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/1000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Generation Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
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
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Titles:</label>
                <input
                  type="number"
                  value={options.maxTitles}
                  onChange={(e) => handleOptionChange("maxTitles", Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="20"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Length Preference:</label>
                <select
                  value={options.lengthPreference}
                  onChange={(e) => handleOptionChange("lengthPreference", e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Length (chars):</label>
                <input
                  type="number"
                  value={options.maxLength}
                  onChange={(e) => handleOptionChange("maxLength", Math.max(10, parseInt(e.target.value) || 60))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="10"
                  max="200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Template (optional):</label>
                <input
                  type="text"
                  value={options.customTemplate}
                  onChange={(e) => handleOptionChange("customTemplate", e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., {keyword} for Beginners"
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.includeEnhancers}
                  onChange={() => handleOptionChange("includeEnhancers", !options.includeEnhancers)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <span>Include Enhancers</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              <FaMagic className="inline mr-2" />
              {isLoading ? "Generating..." : "Generate Titles"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {titles.length > 0 && (
              <button
                onClick={exportTitles}
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
        {titles.length > 0 && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Generated Titles</h2>
            <ul className="mt-4 space-y-3 text-gray-700 max-h-64 overflow-y-auto">
              {titles.map((title, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
                  <span className="text-lg break-all">{title}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(title)}
                    className="ml-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-all text-sm"
                  >
                    <FaCopy className="inline" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigator.clipboard.writeText(titles.join("\n"))}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy All Titles
            </button>
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
                  <span>"{entry.input.slice(0, 20)}..." ({entry.titles.length} titles)</span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setTitles(entry.titles);
                      setOptions(entry.options);
                    }}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-purple-100 rounded-lg border border-purple-300">
          <h3 className="font-semibold text-purple-700">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm">
            <li>Multiple tones (Neutral, Formal, Casual, Dramatic)</li>
            <li>Customizable length and max titles (up to 20)</li>
            <li>Optional enhancers and custom templates</li>
            <li>Exportable titles with history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextTitleGenerator;