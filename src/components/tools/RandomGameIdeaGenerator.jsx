"use client";
import React, { useState, useCallback } from "react";
import { FaDice, FaSave, FaHistory } from "react-icons/fa";

const RandomGameIdeaGenerator = () => {
  const [gameIdea, setGameIdea] = useState(null);
  const [history, setHistory] = useState([]);
  const [customOptions, setCustomOptions] = useState({
    genre: "",
    setting: "",
    mechanic: "",
    theme: "",
  });
  const [useCustom, setUseCustom] = useState(false);

  // Expanded options
  const genres = [
    "Action",
    "Adventure",
    "RPG",
    "Strategy",
    "Simulation",
    "Puzzle",
    "Platformer",
    "Horror",
    "Sports",
    "Racing",
    "Shooter",
    "Stealth",
    "Fighting",
    "Survival",
    "Rhythm",
  ];

  const settings = [
    "Medieval Fantasy",
    "Sci-Fi Galaxy",
    "Post-Apocalyptic Earth",
    "Steampunk City",
    "Ancient Civilization",
    "Cyberpunk Megacity",
    "Wild West",
    "Pirate Seas",
    "Haunted Mansion",
    "Underwater Kingdom",
    "Floating Islands",
    "Time-Travel Hub",
    "Alien Planet",
    "Victorian Era",
    "Mythical Forest",
  ];

  const mechanics = [
    "Time Manipulation",
    "Resource Management",
    "Stealth Infiltration",
    "Base Building",
    "Character Customization",
    "Puzzle Solving",
    "Cooperative Multiplayer",
    "Procedural Generation",
    "Parkour Movement",
    "Crafting System",
    "Turn-Based Combat",
    "Real-Time Strategy",
    "Open World Exploration",
    "Narrative Choices",
    "Physics-Based Interactions",
  ];

  const themes = [
    "Revenge",
    "Discovery",
    "Survival",
    "Betrayal",
    "Redemption",
    "Friendship",
    "Mystery",
    "Conquest",
    "Exploration",
    "Rebellion",
    "Transformation",
    "Legacy",
    "Hope",
    "Despair",
    "Unity",
  ];

  const generateGameIdea = useCallback(() => {
    const pickRandom = (array) => array[Math.floor(Math.random() * array.length)];

    const genre = useCustom && customOptions.genre ? customOptions.genre : pickRandom(genres);
    const setting = useCustom && customOptions.setting ? customOptions.setting : pickRandom(settings);
    const mechanic = useCustom && customOptions.mechanic ? customOptions.mechanic : pickRandom(mechanics);
    const theme = useCustom && customOptions.theme ? customOptions.theme : pickRandom(themes);

    const title = `${theme} of ${setting.split(" ")[0]}: A ${genre} Tale`;
    const description = `A ${genre.toLowerCase()} game set in a ${setting.toLowerCase()}, featuring ${mechanic.toLowerCase()} as the core gameplay mechanic, with a central theme of ${theme.toLowerCase()}.`;

    const newIdea = { title, description };
    setGameIdea(newIdea);
    setHistory((prev) => [newIdea, ...prev.slice(0, 9)]); // Keep last 10 ideas
  }, [customOptions, useCustom]);

  const handleCustomInput = (field) => (e) => {
    setCustomOptions((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const downloadIdea = () => {
    if (!gameIdea) return;
    const element = document.createElement("a");
    const file = new Blob([`${gameIdea.title}\n\n${gameIdea.description}`], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${gameIdea.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Game Idea Generator
        </h1>

        {/* Custom Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={useCustom}
              onChange={(e) => setUseCustom(e.target.checked)}
              className="mr-2 accent-green-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Use Custom Inputs (leave blank for random)
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {["genre", "setting", "mechanic", "theme"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field}
                </label>
                <input
                  type="text"
                  value={customOptions[field]}
                  onChange={handleCustomInput(field)}
                  placeholder={`Random ${field}`}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 disabled:bg-gray-200"
                  disabled={!useCustom}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-6 gap-4">
          <button
            onClick={generateGameIdea}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            <FaDice className="mr-2" /> Generate New Idea
          </button>
          {gameIdea && (
            <button
              onClick={downloadIdea}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <FaSave className="mr-2" /> Save Idea
            </button>
          )}
        </div>

        {/* Game Idea Display */}
        {gameIdea ? (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-green-600">
              {gameIdea.title}
            </h2>
            <p className="text-gray-700 text-sm sm:text-base">{gameIdea.description}</p>
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">
            Click "Generate New Idea" to create a random game concept!
          </p>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center">
              <FaHistory className="mr-2" /> Recent Ideas
            </h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto text-sm text-blue-600">
              {history.map((idea, index) => (
                <li
                  key={index}
                  className="p-2 bg-white rounded-md hover:bg-blue-100 cursor-pointer"
                  onClick={() => setGameIdea(idea)}
                >
                  <strong>{idea.title}</strong>: {idea.description.substring(0, 50)}...
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Expanded options for genres, settings, mechanics, and themes</li>
            <li>Custom input support for personalized ideas</li>
            <li>History of recent ideas (click to revisit)</li>
            <li>Download generated ideas as text files</li>
            <li>Dynamic title generation</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: These are fictional game concepts generated for inspiration and fun!
        </p>
      </div>
    </div>
  );
};

export default RandomGameIdeaGenerator;