// components/RandomDiceRoller.js
'use client';

import React, { useState } from 'react';

const RandomDiceRoller = () => {
  const [diceType, setDiceType] = useState(6); // Default to d6
  const [diceCount, setDiceCount] = useState(1); // Default to 1 die
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);

  const diceOptions = [4, 6, 8, 10, 12, 20]; // Common dice types

  const rollDice = () => {
    const newResults = [];
    let sum = 0;

    for (let i = 0; i < diceCount; i++) {
      const roll = Math.floor(Math.random() * diceType) + 1;
      newResults.push(roll);
      sum += roll;
    }

    setResults(newResults);
    setTotal(sum);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Dice Roller</h1>

      <div className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dice Type (d{diceType})
            </label>
            <select
              value={diceType}
              onChange={(e) => setDiceType(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {diceOptions.map((type) => (
                <option key={type} value={type}>
                  d{type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Dice
            </label>
            <input
              type="number"
              value={diceCount}
              onChange={(e) => setDiceCount(Math.max(1, Number(e.target.value)))}
              min="1"
              max="20"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Roll Button */}
        <div className="flex justify-center">
          <button
            onClick={rollDice}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Roll {diceCount}d{diceType}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2 text-center">Results</h2>
            <div className="text-center">
              <p className="text-sm text-gray-700">
                Individual Rolls: {results.join(', ')}
              </p>
              <p className="text-lg font-bold text-blue-600 mt-2">
                Total: {total}
              </p>
            </div>
          </div>
        )}

        {!results.length && (
          <p className="text-center text-gray-500">
            Roll the dice to see your results!
          </p>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Roll virtual dice for games, decisions, or just for fun!
      </p>
    </div>
  );
};

export default RandomDiceRoller;