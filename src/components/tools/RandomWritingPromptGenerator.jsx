"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaSave, FaDice } from "react-icons/fa";

const RandomWritingPromptGenerator = () => {
  const [prompt, setPrompt] = useState(null);
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [customGenre, setCustomGenre] = useState("");
  const [customCharacter, setCustomCharacter] = useState("");
  const [customSetting, setCustomSetting] = useState("");
  const [customPlot, setCustomPlot] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const genres = [
    "Fantasy",
    "Science Fiction",
    "Mystery",
    "Romance",
    "Horror",
    "Adventure",
    "Historical",
    "Thriller",
    "Comedy",
    "Drama",
    "Steampunk",
    "Cyberpunk",
    "Western",
    "Post-Apocalyptic",
  ];

  const characters = [
    "a reluctant hero",
    "a time-traveling scientist",
    "a cunning detective",
    "a hopeless romantic",
    "a vengeful ghost",
    "a daring explorer",
    "a forgotten king",
    "a secretive spy",
    "a bumbling inventor",
    "a troubled artist",
    "a rogue android",
    "a fearless journalist",
    "a cursed prince",
    "a retired assassin",
  ];

  const settings = [
    "a magical forest",
    "a dystopian city",
    "an old mansion",
    "a quaint village",
    "an abandoned spaceship",
    "a pirate ship",
    "a medieval castle",
    "a bustling metropolis",
    "a quiet mountain town",
    "a mysterious island",
    "a hidden underground bunker",
    "a floating sky city",
    "a haunted theater",
    "a desert oasis",
  ];

  const plotElements = [
    "discovers a hidden truth",
    "must stop an impending disaster",
    "searches for a lost artifact",
    "falls into an unexpected romance",
    "confronts a dark past",
    "embarks on a dangerous quest",
    "unravels a conspiracy",
    "faces a moral dilemma",
    "invents something revolutionary",
    "encounters a strange phenomenon",
    "battles a powerful enemy",
    "seeks redemption",
    "explores an unknown realm",
    "solves an ancient riddle",
  ];

  const generatePrompt = useCallback(() => {
    const selectedGenres = useCustom && customGenre ? [customGenre] : genres;
    const selectedCharacters = useCustom && customCharacter ? [customCharacter] : characters;
    const selectedSettings = useCustom && customSetting ? [customSetting] : settings;
    const selectedPlots = useCustom && customPlot ? [customPlot] : plotElements;

    const genre = selectedGenres[Math.floor(Math.random() * selectedGenres.length)];
    const character = selectedCharacters[Math.floor(Math.random() * selectedCharacters.length)];
    const setting = selectedSettings[Math.floor(Math.random() * selectedSettings.length)];
    const plot = selectedPlots[Math.floor(Math.random() * selectedPlots.length)];

    const newPrompt = `Write a ${genre.toLowerCase()} story about ${character} who, in ${setting}, ${plot}.`;
    setPrompt(newPrompt);
  }, [customGenre, customCharacter, customSetting, customPlot, useCustom]);

  const savePrompt = () => {
    if (prompt && !savedPrompts.includes(prompt)) {
      setSavedPrompts((prev) => [...prev, prompt]);
    }
  };

  const clearSavedPrompts = () => {
    setSavedPrompts([]);
  };

  const resetCustomInputs = () => {
    setCustomGenre("");
    setCustomCharacter("");
    setCustomSetting("");
    setCustomPlot("");
    setUseCustom(false);
    setPrompt(null);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Writing Prompt Generator
        </h1>

        {/* Custom Input Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={useCustom}
              onChange={(e) => setUseCustom(e.target.checked)}
              className="mr-2 accent-green-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Use Custom Elements
            </label>
          </div>
          {useCustom && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                placeholder="Custom Genre (e.g., Noir)"
                className="p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                value={customCharacter}
                onChange={(e) => setCustomCharacter(e.target.value)}
                placeholder="Custom Character (e.g., a brave knight)"
                className="p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                value={customSetting}
                onChange={(e) => setCustomSetting(e.target.value)}
                placeholder="Custom Setting (e.g., a snowy tundra)"
                className="p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                value={customPlot}
                onChange={(e) => setCustomPlot(e.target.value)}
                placeholder="Custom Plot (e.g., finds a secret map)"
                className="p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={generatePrompt}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            <FaDice className="mr-2" /> Generate New Prompt
          </button>
        </div>

        {/* Current Prompt */}
        {prompt ? (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-2 text-green-600 text-center">
              Your Writing Prompt
            </h2>
            <p className="text-gray-700 text-center">{prompt}</p>
            <button
              onClick={savePrompt}
              className="mt-4 flex items-center mx-auto px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <FaSave className="mr-2" /> Save Prompt
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-500 mb-6">
            Click the button to generate a random writing prompt!
          </p>
        )}

        {/* Saved Prompts */}
        {savedPrompts.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Saved Prompts</h3>
              <button
                onClick={clearSavedPrompts}
                className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                <FaSync className="mr-2" /> Clear All
              </button>
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {savedPrompts.map((savedPrompt, index) => (
                <li
                  key={index}
                  className="p-2 bg-gray-100 rounded-md text-gray-700 text-sm"
                >
                  {savedPrompt}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">How to Use</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Click "Generate New Prompt" for a random idea</li>
            <li>Enable custom elements to add your own inputs</li>
            <li>Save prompts you like to revisit later</li>
            <li>Use these prompts to spark your creativity!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomWritingPromptGenerator;