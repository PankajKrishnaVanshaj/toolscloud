// components/RandomCardDrawer.js
'use client';

import React, { useState } from 'react';

const RandomCardDrawer = () => {
  const [drawnCards, setDrawnCards] = useState([]);
  const [drawCount, setDrawCount] = useState(1);

  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = suits.flatMap(suit => ranks.map(rank => ({ suit, rank })));

  const drawCards = () => {
    // Create a copy of the deck
    let availableCards = [...deck];
    const newCards = [];
    
    // Draw the specified number of cards (max 52)
    const actualDrawCount = Math.min(drawCount, 52);
    
    for (let i = 0; i < actualDrawCount; i++) {
      if (availableCards.length === 0) break;
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      newCards.push(availableCards[randomIndex]);
      availableCards.splice(randomIndex, 1); // Remove drawn card
    }
    
    setDrawnCards(newCards);
  };

  const getCardColor = (suit) => {
    return (suit === '♥' || suit === '♦') ? 'text-red-600' : 'text-black';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Card Drawer</h1>

      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Number of cards to draw (1-5):
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={drawCount}
            onChange={(e) => setDrawCount(Math.max(1, Math.min(5, Number(e.target.value))))}
            className="w-16 p-1 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={drawCards}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Draw Cards
        </button>
      </div>

      {drawnCards.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-4">
          {drawnCards.map((card, index) => (
            <div
              key={index}
              className={`w-24 h-36 bg-white border-2 rounded-lg shadow-md flex flex-col items-center justify-center ${getCardColor(card.suit)}`}
            >
              <div className="text-2xl font-bold">{card.rank}</div>
              <div className="text-4xl">{card.suit}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          Click "Draw Cards" to get random cards from a standard deck!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Cards are drawn without replacement from a standard 52-card deck for each draw.
      </p>
    </div>
  );
};

export default RandomCardDrawer;