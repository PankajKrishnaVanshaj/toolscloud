// components/RandomArtPromptGenerator.js
'use client';

import React, { useState } from 'react';

const RandomArtPromptGenerator = () => {
  const [artPrompt, setArtPrompt] = useState(null);

  const subjects = [
    'warrior', 'dragon', 'astronaut', 'mermaid', 'robot', 'wizard',
    'cat', 'forest spirit', 'alien', 'pirate', 'fairy', 'ghost'
  ];

  const styles = [
    'cyberpunk', 'steampunk', 'surrealist', 'impressionist', 'minimalist',
    'gothic', 'baroque', 'pop art', 'watercolor', 'oil painting', 
    'digital art', 'sketch'
  ];

  const settings = [
    'floating island', 'underwater city', 'desert oasis', 'cosmic void',
    'enchanted forest', 'abandoned castle', 'futuristic metropolis',
    'haunted mansion', 'icy tundra', 'volcanic landscape', 'dreamscape'
  ];

  const moods = [
    'mysterious', 'joyful', 'melancholic', 'chaotic', 'peaceful',
    'eerie', 'vibrant', 'somber', 'ethereal', 'dramatic', 'whimsical'
  ];

  const extras = [
    'with glowing eyes', 'holding a magical artifact', 'surrounded by stars',
    'wearing ornate armor', 'with a companion animal', 'in mid-transformation',
    'casting a spell', 'reflecting in a mirror', 'emerging from mist',
    'under a blood moon'
  ];

  const generateArtPrompt = () => {
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const setting = settings[Math.floor(Math.random() * settings.length)];
    const mood = moods[Math.floor(Math.random() * moods.length)];
    const extra = extras[Math.floor(Math.random() * extras.length)];

    const prompt = `A ${mood} ${subject} in a ${style} style, set in a ${setting}, ${extra}.`;
    setArtPrompt(prompt);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Art Prompt Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateArtPrompt}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          Generate New Art Prompt
        </button>
      </div>

      {artPrompt && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-lg font-semibold mb-2 text-purple-600">Your Art Prompt:</h2>
          <p className="text-gray-700">{artPrompt}</p>
        </div>
      )}

      {!artPrompt && (
        <p className="text-center text-gray-500">
          Click the button to generate a random art prompt!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Use these prompts to inspire your next artwork or creative project!
      </p>
    </div>
  );
};

export default RandomArtPromptGenerator;