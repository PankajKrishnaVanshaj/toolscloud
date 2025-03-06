// components/RandomBookTitleGenerator.js
'use client';

import React, { useState } from 'react';

const RandomBookTitleGenerator = () => {
  const [bookTitle, setBookTitle] = useState(null);

  const adjectives = [
    'Mysterious', 'Forgotten', 'Hidden', 'Eternal', 'Whispering', 
    'Crimson', 'Silent', 'Golden', 'Shattered', 'Enchanted', 
    'Lost', 'Dark', 'Radiant', 'Secret'
  ];

  const nouns = [
    'Kingdom', 'Forest', 'Tower', 'Realm', 'Shadow', 
    'Journey', 'Legacy', 'Prophecy', 'Curse', 'Empire', 
    'Echo', 'Throne', 'Veil', 'Path'
  ];

  const themes = [
    'of Destiny', 'of the Stars', 'of Time', 'of Blood', 
    'in the Mist', 'under the Moon', 'beyond the Horizon', 
    'and Dust', 'of Dreams', 'in Shadow', 
    'of the Ancients', 'and Fire', 'of Secrets'
  ];

  const structures = [
    'The {{adjective}} {{noun}} {{theme}}',
    '{{adjective}} {{noun}}',
    'The {{noun}} {{theme}}',
    'A {{adjective}} {{noun}} {{theme}}',
    'The {{adjective}} {{theme}}'
  ];

  const generateTitle = () => {
    const structure = structures[Math.floor(Math.random() * structures.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const theme = themes[Math.floor(Math.random() * themes.length)];

    let title = structure
      .replace('{{adjective}}', adjective)
      .replace('{{noun}}', noun)
      .replace('{{theme}}', theme);

    setBookTitle(title);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Book Title Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateTitle}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          Generate New Title
        </button>
      </div>

      {bookTitle && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-xl font-semibold mb-3 text-purple-600 italic">
            "{bookTitle}"
          </h2>
        </div>
      )}

      {!bookTitle && (
        <p className="text-center text-gray-500">
          Click the button to generate a random book title!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: These are fictional titles generated for inspiration and creativity!
      </p>
    </div>
  );
};

export default RandomBookTitleGenerator;