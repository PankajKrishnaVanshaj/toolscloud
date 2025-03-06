// components/RandomSongLyricGenerator.js
'use client';

import React, { useState } from 'react';

const RandomSongLyricGenerator = () => {
  const [lyrics, setLyrics] = useState([]);
  const [genre, setGenre] = useState('pop');

  const nouns = {
    pop: ['heart', 'night', 'dream', 'star', 'world', 'love', 'sky'],
    rock: ['road', 'fire', 'soul', 'storm', 'rebel', 'shadow', 'chain'],
    hiphop: ['street', 'flow', 'mic', 'crew', 'game', 'rhyme', 'block'],
    country: ['truck', 'river', 'moon', 'farm', 'boots', 'highway', 'barn']
  };

  const verbs = {
    pop: ['dance', 'shine', 'fly', 'fall', 'sing', 'feel', 'love'],
    rock: ['rock', 'burn', 'fight', 'run', 'break', 'scream', 'crash'],
    hiphop: ['spit', 'ride', 'grind', 'flow', 'drop', 'hustle', 'blaze'],
    country: ['ride', 'drink', 'roll', 'stray', 'dance', 'pick', 'roam']
  };

  const adjectives = {
    pop: ['bright', 'wild', 'sweet', 'free', 'golden', 'true', 'lost'],
    rock: ['dark', 'loud', 'rough', 'crazy', 'fierce', 'raw', 'bold'],
    hiphop: ['fresh', 'real', 'hot', 'smooth', 'dope', 'hard', 'fly'],
    country: ['dusty', 'old', 'lonesome', 'sweet', 'rugged', 'blue', 'wild']
  };

  const adverbs = ['forever', 'tonight', 'always', 'never', 'slowly', 'fast', 'high'];

  const generateLyrics = () => {
    const lines = [];
    const selectedNouns = nouns[genre];
    const selectedVerbs = verbs[genre];
    const selectedAdjectives = adjectives[genre];

    for (let i = 0; i < 4; i++) { // Generate 4-line verse
      const noun = selectedNouns[Math.floor(Math.random() * selectedNouns.length)];
      const verb = selectedVerbs[Math.floor(Math.random() * selectedVerbs.length)];
      const adjective = selectedAdjectives[Math.floor(Math.random() * selectedAdjectives.length)];
      const adverb = adverbs[Math.floor(Math.random() * adverbs.length)];
      
      const line = `${adjective.charAt(0).toUpperCase() + adjective.slice(1)} ${noun}s ${verb} ${adverb}`;
      lines.push(line);
    }
    
    setLyrics(lines);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Song Lyric Generator</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
          Select Genre
        </label>
        <div className="flex justify-center gap-2 flex-wrap">
          {['pop', 'rock', 'hiphop', 'country'].map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-4 py-2 rounded-md capitalize ${
                genre === g 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition-colors duration-200`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={generateLyrics}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
        >
          Generate New Lyrics
        </button>
      </div>

      {lyrics.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3 text-center text-indigo-600">
            {genre.charAt(0).toUpperCase() + genre.slice(1)} Verse
          </h2>
          <div className="space-y-2 text-center text-gray-700">
            {lyrics.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {lyrics.length === 0 && (
        <p className="text-center text-gray-500">
          Select a genre and click the button to generate lyrics!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: These are randomly generated lyrics for inspiration and entertainment.
      </p>
    </div>
  );
};

export default RandomSongLyricGenerator;