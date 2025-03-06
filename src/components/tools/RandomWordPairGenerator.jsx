// components/RandomWordPairGenerator.js
'use client';

import React, { useState } from 'react';

const RandomWordPairGenerator = () => {
  const [wordPair, setWordPair] = useState(null);
  const [count, setCount] = useState(1);

  const nouns = [
    'Cloud', 'River', 'Mountain', 'Forest', 'Ocean', 'Star', 'Moon', 
    'Shadow', 'Flame', 'Stone', 'Wind', 'Tree', 'Path', 'Echo', 'Dawn'
  ];

  const adjectives = [
    'Silent', 'Vivid', 'Golden', 'Mystic', 'Eternal', 'Fierce', 'Gentle',
    'Hidden', 'Bright', 'Dark', 'Swift', 'Calm', 'Wild', 'Ancient', 'Crystal'
  ];

  const generateWordPairs = () => {
    const pairs = [];
    for (let i = 0; i < count; i++) {
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      pairs.push(`${adjective} ${noun}`);
    }
    setWordPair(pairs);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Word Pair Generator</h1>

      <div className="flex flex-col items-center mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Number of Pairs:
          </label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(10, Number(e.target.value))))}
            min="1"
            max="10"
            className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          onClick={generateWordPairs}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          Generate Word Pairs
        </button>
      </div>

      {wordPair && wordPair.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3 text-center text-purple-600">
            Generated Word Pairs
          </h2>
          <ul className="space-y-2 text-center">
            {wordPair.map((pair, index) => (
              <li key={index} className="text-gray-700">
                {pair}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!wordPair && (
        <p className="text-center text-gray-500">
          Click the button to generate random word pairs!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Tip: Use these pairs for naming, writing prompts, or creative inspiration!
      </p>
    </div>
  );
};

export default RandomWordPairGenerator;