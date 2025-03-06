// components/RandomPasswordHintGenerator.js
'use client';

import React, { useState } from 'react';

const RandomPasswordHintGenerator = () => {
  const [passwordData, setPasswordData] = useState(null);
  const [length, setLength] = useState(12);

  const animals = ['Tiger', 'Eagle', 'Whale', 'Fox', 'Bear', 'Wolf', 'Owl'];
  const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink'];
  const objects = ['Star', 'River', 'Mountain', 'Cloud', 'Tree', 'Stone', 'Flame'];
  const actions = ['Runs', 'Flies', 'Swims', 'Jumps', 'Climbs', 'Dances', 'Sings'];

  const generatePasswordAndHint = () => {
    // Generate components for hint
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const object = objects[Math.floor(Math.random() * objects.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    // Create hint
    const hint = `${color} ${animal} ${action} ${object}`;

    // Generate password
    const specialChars = '!@#$%^&*';
    const numbers = '0123456789';
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    const allChars = letters + numbers + specialChars;
    let password = '';
    
    // Ensure at least one of each type
    password += letters[Math.floor(Math.random() * letters.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Fill remaining length
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle password
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    setPasswordData({ password, hint });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Password Hint Generator</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password Length: {length}
        </label>
        <input
          type="range"
          min="8"
          max="20"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={generatePasswordAndHint}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate Password & Hint
        </button>
      </div>

      {passwordData && (
        <div className="bg-gray-50 p-4 rounded-md space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-green-600">Your Password</h2>
            <p className="text-gray-800 font-mono break-all">{passwordData.password}</p>
            <button
              onClick={() => navigator.clipboard.writeText(passwordData.password)}
              className="mt-2 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              Copy to Clipboard
            </button>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-green-600">Memory Hint</h2>
            <p className="text-gray-700">{passwordData.hint}</p>
            <p className="text-xs text-gray-500 mt-1">
              (Visualize this phrase to remember your password)
            </p>
          </div>
        </div>
      )}

      {!passwordData && (
        <p className="text-center text-gray-500">
          Click the button to generate a secure password with a memorable hint!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: The hint is for memory only - the password is randomly generated and secure.
      </p>
    </div>
  );
};

export default RandomPasswordHintGenerator;