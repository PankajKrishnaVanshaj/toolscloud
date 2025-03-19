"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy, FaPlus } from "react-icons/fa";

const RandomArtPromptGenerator = () => {
  const [artPrompt, setArtPrompt] = useState(null);
  const [history, setHistory] = useState([]);
  const [complexity, setComplexity] = useState("medium"); // Simple, Medium, Complex
  const [customWords, setCustomWords] = useState({
    subjects: "",
    styles: "",
    settings: "",
    moods: "",
    extras: "",
  });

  // Default word lists
  const defaultWords = {
    subjects: [
      "warrior", "dragon", "astronaut", "mermaid", "robot", "wizard",
      "cat", "forest spirit", "alien", "pirate", "fairy", "ghost",
      "knight", "phoenix", "cyborg", "siren"
    ],
    styles: [
      "cyberpunk", "steampunk", "surrealist", "impressionist", "minimalist",
      "gothic", "baroque", "pop art", "watercolor", "oil painting",
      "digital art", "sketch", "realism", "abstract", "futurist"
    ],
    settings: [
      "floating island", "underwater city", "desert oasis", "cosmic void",
      "enchanted forest", "abandoned castle", "futuristic metropolis",
      "haunted mansion", "icy tundra", "volcanic landscape", "dreamscape",
      "steampunk airship", "alien planet", "mystical cave"
    ],
    moods: [
      "mysterious", "joyful", "melancholic", "chaotic", "peaceful",
      "eerie", "vibrant", "somber", "ethereal", "dramatic", "whimsical",
      "tense", "serene", "nostalgic"
    ],
    extras: [
      "with glowing eyes", "holding a magical artifact", "surrounded by stars",
      "wearing ornate armor", "with a companion animal", "in mid-transformation",
      "casting a spell", "reflecting in a mirror", "emerging from mist",
      "under a blood moon", "with mechanical wings", "in a storm",
      "surrounded by floating lanterns"
    ],
  };

  // Combine default and custom words
  const getWordList = (category) => {
    const custom = customWords[category]
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word);
    return [...defaultWords[category], ...custom];
  };

  // Generate prompt based on complexity
  const generateArtPrompt = useCallback(() => {
    const subjects = getWordList("subjects");
    const styles = getWordList("styles");
    const settings = getWordList("settings");
    const moods = getWordList("moods");
    const extras = getWordList("extras");

    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

    let prompt;
    switch (complexity) {
      case "simple":
        prompt = `A ${randomItem(subjects)} in a ${randomItem(styles)} style.`;
        break;
      case "medium":
        prompt = `A ${randomItem(moods)} ${randomItem(subjects)} in a ${randomItem(
          styles
        )} style, set in a ${randomItem(settings)}.`;
        break;
      case "complex":
        prompt = `A ${randomItem(moods)} ${randomItem(subjects)} in a ${randomItem(
          styles
        )} style, set in a ${randomItem(settings)}, ${randomItem(extras)}.`;
        break;
      default:
        prompt = "";
    }

    setArtPrompt(prompt);
    setHistory((prev) => [prompt, ...prev.slice(0, 9)]); // Keep last 10 prompts
  }, [complexity, customWords]);

  // Copy prompt to clipboard
  const copyToClipboard = () => {
    if (artPrompt) {
      navigator.clipboard.writeText(artPrompt);
      alert("Prompt copied to clipboard!");
    }
  };

  // Handle custom word input
  const handleCustomInput = (category) => (e) => {
    setCustomWords((prev) => ({ ...prev, [category]: e.target.value }));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Art Prompt Generator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={generateArtPrompt}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Generate New Prompt
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!artPrompt}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy Prompt
            </button>
          </div>

          {/* Complexity Selector */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Complexity:</label>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
              className="w-full sm:w-auto p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            >
              <option value="simple">Simple</option>
              <option value="medium">Medium</option>
              <option value="complex">Complex</option>
            </select>
          </div>

          {/* Custom Words */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(customWords).map((category) => (
              <div key={category}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  Custom {category}
                </label>
                <input
                  type="text"
                  value={customWords[category]}
                  onChange={handleCustomInput(category)}
                  placeholder={`Add ${category} (comma-separated)`}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
                />
              </div>
            ))}
          </div>

          {/* Generated Prompt */}
          {artPrompt ? (
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <h2 className="text-lg font-semibold mb-2 text-purple-600">Your Art Prompt:</h2>
              <p className="text-gray-700 break-words">{artPrompt}</p>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Click "Generate New Prompt" to get started!
            </p>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Prompt History</h3>
              <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
                {history.map((prompt, index) => (
                  <li
                    key={index}
                    className="cursor-pointer hover:text-purple-600"
                    onClick={() => setArtPrompt(prompt)}
                  >
                    {prompt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm space-y-1">
            <li>Three complexity levels: Simple, Medium, Complex</li>
            <li>Customizable word lists</li>
            <li>Prompt history with clickable reuse</li>
            <li>Copy to clipboard functionality</li>
            <li>Expanded word options for variety</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Use these prompts to inspire your next artwork or creative project!
        </p>
      </div>
    </div>
  );
};

export default RandomArtPromptGenerator;