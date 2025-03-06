'use client';

import React, { useState } from 'react';

const VirtualCoinFlipper = () => {
  const [result, setResult] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState([]);
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);

  const flipCoin = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);

    // Simulate coin flip with random delay
    setTimeout(() => {
      const outcome = Math.random() < 0.5 ? 'Heads' : 'Tails';
      setResult(outcome);
      setHistory(prev => [outcome, ...prev].slice(0, 10)); // Keep last 10 flips
      if (outcome === 'Heads') setHeadsCount(prev => prev + 1);
      else setTailsCount(prev => prev + 1);
      setIsFlipping(false);
    }, 1000); // 1-second flip animation
  };

  const resetStats = () => {
    setHistory([]);
    setHeadsCount(0);
    setTailsCount(0);
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Virtual Coin Flipper</h1>

      {/* Coin Display */}
      <div className="flex justify-center mb-6">
        <div
          className={`w-32 h-32 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-1000 ${
            isFlipping ? 'animate-spin' : ''
          } ${result === 'Heads' ? 'bg-yellow-400 text-gray-800' : result === 'Tails' ? 'bg-gray-300 text-gray-800' : 'bg-gray-100 text-gray-500'}`}
        >
          {result || 'Flip Me!'}
        </div>
      </div>

      {/* Flip Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={flipCoin}
          disabled={isFlipping}
          className={`px-6 py-2 rounded-md text-white transition-colors duration-200 ${
            isFlipping ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isFlipping ? 'Flipping...' : 'Flip Coin'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-green-600">{headsCount}</p>
          <p className="text-sm text-gray-600">Heads</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-600">{tailsCount}</p>
          <p className="text-sm text-gray-600">Tails</p>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-medium text-gray-700">Recent Flips (Last 10)</h2>
            <button
              onClick={resetStats}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Reset
            </button>
          </div>
          <ul className="space-y-1 max-h-[150px] overflow-y-auto border p-2 rounded-md bg-gray-50">
            {history.map((flip, index) => (
              <li
                key={index}
                className={`text-sm ${flip === 'Heads' ? 'text-green-600' : 'text-gray-600'}`}
              >
                {flip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        Click the button to flip the virtual coin!
      </p>
    </div>
  );
};

export default VirtualCoinFlipper;