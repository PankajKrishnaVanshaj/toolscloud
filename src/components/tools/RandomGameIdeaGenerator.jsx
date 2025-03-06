// components/RandomGameIdeaGenerator.js
'use client';

import React, { useState } from 'react';

const RandomGameIdeaGenerator = () => {
  const [gameIdea, setGameIdea] = useState(null);

  const genres = [
    'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Puzzle', 
    'Platformer', 'Horror', 'Sports', 'Racing', 'Shooter', 'Stealth'
  ];

  const settings = [
    'Medieval Fantasy', 'Sci-Fi Galaxy', 'Post-Apocalyptic Earth', 'Steampunk City',
    'Ancient Civilization', 'Cyberpunk Megacity', 'Wild West', 'Pirate Seas',
    'Haunted Mansion', 'Underwater Kingdom', 'Floating Islands', 'Time-Travel Hub'
  ];

  const mechanics = [
    'Time Manipulation', 'Resource Management', 'Stealth Infiltration', 
    'Base Building', 'Character Customization', 'Puzzle Solving', 
    'Cooperative Multiplayer', 'Procedural Generation', 'Parkour Movement',
    'Crafting System', 'Turn-Based Combat', 'Real-Time Strategy'
  ];

  const themes = [
    'Revenge', 'Discovery', 'Survival', 'Betrayal', 'Redemption', 
    'Friendship', 'Mystery', 'Conquest', 'Exploration', 'Rebellion',
    'Transformation', 'Legacy'
  ];

  const generateGameIdea = () => {
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const setting = settings[Math.floor(Math.random() * settings.length)];
    const mechanic = mechanics[Math.floor(Math.random() * mechanics.length)];
    const theme = themes[Math.floor(Math.random() * themes.length)];

    const title = `Untitled ${genre} Game`;
    const description = `A ${genre.toLowerCase()} game set in a ${setting.toLowerCase()}, featuring ${mechanic.toLowerCase()} as the core gameplay mechanic, with a central theme of ${theme.toLowerCase()}.`;

    setGameIdea({ title, description });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Game Idea Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateGameIdea}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate New Game Idea
        </button>
      </div>

      {gameIdea && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-xl font-semibold mb-3 text-green-600">
            {gameIdea.title}
          </h2>
          <p className="text-gray-700">
            {gameIdea.description}
          </p>
        </div>
      )}

      {!gameIdea && (
        <p className="text-center text-gray-500">
          Click the button to generate a random game idea!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: These are fictional game concepts generated for inspiration and fun!
      </p>
    </div>
  );
};

export default RandomGameIdeaGenerator;