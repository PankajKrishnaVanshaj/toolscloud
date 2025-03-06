// components/RandomWritingPromptGenerator.js
'use client';

import React, { useState } from 'react';

const RandomWritingPromptGenerator = () => {
  const [prompt, setPrompt] = useState(null);

  const genres = [
    'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Horror', 
    'Adventure', 'Historical', 'Thriller', 'Comedy', 'Drama'
  ];

  const characters = [
    'a reluctant hero', 'a time-traveling scientist', 'a cunning detective', 
    'a hopeless romantic', 'a vengeful ghost', 'a daring explorer', 
    'a forgotten king', 'a secretive spy', 'a bumbling inventor', 
    'a troubled artist'
  ];

  const settings = [
    'a magical forest', 'a dystopian city', 'an old mansion', 
    'a quaint village', 'an abandoned spaceship', 'a pirate ship', 
    'a medieval castle', 'a bustling metropolis', 'a quiet mountain town', 
    'a mysterious island'
  ];

  const plotElements = [
    'discovers a hidden truth', 'must stop an impending disaster', 
    'searches for a lost artifact', 'falls into an unexpected romance', 
    'confronts a dark past', 'embarks on a dangerous quest', 
    'unravels a conspiracy', 'faces a moral dilemma', 
    'invents something revolutionary', 'encounters a strange phenomenon'
  ];

  const generatePrompt = () => {
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const character = characters[Math.floor(Math.random() * characters.length)];
    const setting = settings[Math.floor(Math.random() * settings.length)];
    const plot = plotElements[Math.floor(Math.random() * plotElements.length)];

    const newPrompt = `Write a ${genre.toLowerCase()} story about ${character} who, in ${setting}, ${plot}.`;
    setPrompt(newPrompt);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Writing Prompt Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generatePrompt}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate New Prompt
        </button>
      </div>

      {prompt && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-green-600 text-center">Your Writing Prompt</h2>
          <p className="text-gray-700 text-center">{prompt}</p>
        </div>
      )}

      {!prompt && (
        <p className="text-center text-gray-500">
          Click the button to generate a random writing prompt!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Use these prompts to spark your creativity and start writing!
      </p>
    </div>
  );
};

export default RandomWritingPromptGenerator;