// components/RandomPoetryLineGenerator.js
'use client';

import React, { useState } from 'react';

const RandomPoetryLineGenerator = () => {
  const [poetryLine, setPoetryLine] = useState(null);

  const nouns = [
    'moon', 'river', 'shadow', 'wind', 'forest', 'star', 'ocean', 'mountain',
    'flame', 'dawn', 'night', 'rose', 'sky', 'dream', 'silence', 'bird'
  ];

  const verbs = [
    'whispers', 'dances', 'weaves', 'sings', 'falls', 'rises', 'drifts', 'glows',
    'fades', 'wanders', 'shimmers', 'flows', 'burns', 'soars', 'echoes', 'breathes'
  ];

  const adjectives = [
    'silver', 'gentle', 'wild', 'eternal', 'faint', 'golden', 'dark', 'soft',
    'crimson', 'hidden', 'radiant', 'quiet', 'vast', 'fleeting', 'mysterious', 'pale'
  ];

  const adverbs = [
    'silently', 'slowly', 'gently', 'boldly', 'forever', 'softly', 'swiftly',
    'quietly', 'gracefully', 'faintly', 'endlessly', 'calmly', 'brightly', 'shyly'
  ];

  const prepositions = [
    'beneath', 'above', 'within', 'beyond', 'against', 'through', 'under',
    'over', 'beside', 'across', 'into', 'around'
  ];

  const structures = [
    (adj, n, v, adv) => `The ${adj} ${n} ${v} ${adv}.`,
    (adj, n, v, prep, n2) => `${adj} ${n} ${v} ${prep} the ${n2}.`,
    (n, v, adv, prep, adj) => `${n} ${v} ${adv} ${prep} ${adj} skies.`,
    (adv, v, adj, n) => `${adv}, the ${adj} ${n} ${v}.`,
    (adj, n, prep, n2, v) => `The ${adj} ${n} ${prep} ${n2} ${v}.`
  ];

  const generatePoetryLine = () => {
    const structure = structures[Math.floor(Math.random() * structures.length)];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const n = nouns[Math.floor(Math.random() * nouns.length)];
    const v = verbs[Math.floor(Math.random() * verbs.length)];
    const adv = adverbs[Math.floor(Math.random() * adverbs.length)];
    const prep = prepositions[Math.floor(Math.random() * prepositions.length)];
    const n2 = nouns[Math.floor(Math.random() * nouns.length)];

    // Ensure n and n2 are different when both are used
    const uniqueN2 = n === n2 ? nouns[(nouns.indexOf(n2) + 1) % nouns.length] : n2;

    const line = structure(adj, n, v, adv, prep, uniqueN2);
    setPoetryLine(line);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Poetry Line Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generatePoetryLine}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          Generate New Poetry Line
        </button>
      </div>

      {poetryLine && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <p className="text-lg italic text-gray-800">
            "{poetryLine}"
          </p>
        </div>
      )}

      {!poetryLine && (
        <p className="text-center text-gray-500">
          Click the button to generate a random poetry line!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: These lines are randomly generated for inspiration and creativity.
      </p>
    </div>
  );
};

export default RandomPoetryLineGenerator;