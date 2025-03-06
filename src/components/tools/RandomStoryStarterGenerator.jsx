// components/RandomStoryStarterGenerator.js
'use client';

import React, { useState } from 'react';

const RandomStoryStarterGenerator = () => {
  const [storyStarter, setStoryStarter] = useState(null);

  const characters = [
    'a curious explorer', 'a time-traveling scientist', 'a mischievous fairy', 
    'a retired pirate', 'an ambitious chef', 'a talking cat', 
    'a secretive librarian', 'a young inventor', 'a lost astronaut', 
    'a magical gardener'
  ];

  const settings = [
    'a hidden jungle temple', 'a futuristic underwater city', 'a haunted Victorian mansion',
    'a bustling medieval market', 'a mysterious floating island', 'an abandoned space station',
    'a enchanted forest', 'a steampunk airship', 'a desert caravan', 
    'a snowy mountain village'
  ];

  const plotElements = [
    'discovers a long-lost artifact', 'must solve an ancient riddle', 
    'encounters a strange creature', 'uncovers a dangerous conspiracy', 
    'finds a portal to another world', 'receives a cryptic message', 
    'competes in a high-stakes challenge', 'searches for a missing friend', 
    'awakens a dormant power', 'faces an unexpected betrayal'
  ];

  const tones = [
    'mysterious', 'thrilling', 'humorous', 'dark', 'adventurous', 
    'romantic', 'spooky', 'whimsical', 'dramatic', 'hopeful'
  ];

  const generateStoryStarter = () => {
    const character = characters[Math.floor(Math.random() * characters.length)];
    const setting = settings[Math.floor(Math.random() * settings.length)];
    const plotElement = plotElements[Math.floor(Math.random() * plotElements.length)];
    const tone = tones[Math.floor(Math.random() * tones.length)];

    const prompt = `In a ${tone} tale, ${character} ${plotElement} in ${setting}.`;
    setStoryStarter(prompt);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Story Starter Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateStoryStarter}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate Story Starter
        </button>
      </div>

      {storyStarter && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <p className="text-lg text-gray-800 italic">
            "{storyStarter}"
          </p>
        </div>
      )}

      {!storyStarter && (
        <p className="text-center text-gray-500">
          Click the button to generate a random story starter!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Use these prompts as inspiration for your next writing adventure!
      </p>
    </div>
  );
};

export default RandomStoryStarterGenerator;