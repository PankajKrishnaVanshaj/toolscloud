// components/RandomPasswordPhraseGenerator.js
'use client';

import React, { useState } from 'react';

const RandomPasswordPhraseGenerator = () => {
  const [passphrase, setPassphrase] = useState('');
  const [wordCount, setWordCount] = useState(4);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(true);

  const words = [
    'apple', 'bear', 'cloud', 'dragon', 'eagle', 'forest', 'ghost', 'hammer',
    'island', 'jazz', 'kitten', 'lemon', 'mountain', 'ninja', 'ocean', 'panda',
    'queen', 'river', 'shadow', 'tiger', 'unicorn', 'violet', 'whale', 'xray',
    'yogurt', 'zebra', 'blaze', 'coral', 'dusk', 'ember'
  ];

  const specialChars = '!@#$%^&*+-=';

  const generatePassphrase = () => {
    // Select random words
    let newPassphrase = [];
    for (let i = 0; i < wordCount; i++) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      // Capitalize first letter
      const capitalizedWord = randomWord.charAt(0).toUpperCase() + randomWord.slice(1);
      newPassphrase.push(capitalizedWord);
    }

    // Add number if selected
    if (includeNumbers) {
      const randomNum = Math.floor(Math.random() * 100);
      newPassphrase.push(randomNum.toString());
    }

    // Add special character if selected
    if (includeSpecial) {
      const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)];
      newPassphrase.push(randomSpecial);
    }

    // Join without spaces for final passphrase
    setPassphrase(newPassphrase.join(''));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(passphrase);
    alert('Passphrase copied to clipboard!');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Password Phrase Generator</h1>

      {/* Controls */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Words (2-6)
          </label>
          <input
            type="number"
            value={wordCount}
            onChange={(e) => setWordCount(Math.max(2, Math.min(6, Number(e.target.value))))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="2"
            max="6"
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="mr-2"
            />
            Include Numbers
          </label>
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={includeSpecial}
              onChange={(e) => setIncludeSpecial(e.target.checked)}
              className="mr-2"
            />
            Include Special Characters
          </label>
        </div>

        <button
          onClick={generatePassphrase}
          className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Generate Passphrase
        </button>
      </div>

      {/* Result */}
      {passphrase && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <p className="text-lg font-mono text-gray-800 break-all mb-3">
            {passphrase}
          </p>
          <button
            onClick={copyToClipboard}
            className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm"
          >
            Copy to Clipboard
          </button>
        </div>
      )}

      {!passphrase && (
        <p className="text-center text-gray-500">
          Click "Generate Passphrase" to create a secure password!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Tip: Passphrases are more secure and memorable than traditional passwords.
        Customize your options for the perfect balance!
      </p>
    </div>
  );
};

export default RandomPasswordPhraseGenerator;