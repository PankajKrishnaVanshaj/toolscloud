"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaPlus, FaMinus } from "react-icons/fa";

const RandomCardDrawer = () => {
  const [drawnCards, setDrawnCards] = useState([]);
  const [drawCount, setDrawCount] = useState(1);
  const [deckType, setDeckType] = useState("standard");
  const [shuffleCount, setShuffleCount] = useState(1);
  const [remainingDeck, setRemainingDeck] = useState([]);

  // Define card decks
  const standardSuits = ["♠", "♥", "♦", "♣"];
  const standardRanks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  const tarotMajorArcana = [
    "The Fool",
    "The Magician",
    "The High Priestess",
    "The Empress",
    "The Emperor",
    "The Hierophant",
    "The Lovers",
    "The Chariot",
    "Strength",
    "The Hermit",
    "Wheel of Fortune",
    "Justice",
    "The Hanged Man",
    "Death",
    "Temperance",
    "The Devil",
    "The Tower",
    "The Star",
    "The Moon",
    "The Sun",
    "Judgement",
    "The World",
  ];

  const getDeck = () => {
    if (deckType === "standard") {
      return standardSuits.flatMap((suit) =>
        standardRanks.map((rank) => ({ suit, rank }))
      );
    } else if (deckType === "tarot") {
      return tarotMajorArcana.map((name) => ({ name }));
    }
    return [];
  };

  // Shuffle deck utility
  const shuffleDeck = (deck) => {
    let shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Draw cards
  const drawCards = useCallback(() => {
    let deck = remainingDeck.length > 0 ? [...remainingDeck] : getDeck();
    if (deck.length === 0) return;

    // Apply shuffle
    for (let i = 0; i < shuffleCount; i++) {
      deck = shuffleDeck(deck);
    }

    const actualDrawCount = Math.min(drawCount, deck.length);
    const newCards = deck.slice(0, actualDrawCount);
    const newRemainingDeck = deck.slice(actualDrawCount);

    setDrawnCards(newCards);
    setRemainingDeck(newRemainingDeck);
  }, [drawCount, shuffleCount, deckType, remainingDeck]);

  // Reset deck
  const resetDeck = () => {
    setDrawnCards([]);
    setRemainingDeck(getDeck());
  };

  const getCardColor = (suit) => {
    return suit && (suit === "♥" || suit === "♦") ? "text-red-600" : "text-black";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Card Drawer
        </h1>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deck Type
            </label>
            <select
              value={deckType}
              onChange={(e) => {
                setDeckType(e.target.value);
                setRemainingDeck([]);
                setDrawnCards([]);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="standard">Standard (52 cards)</option>
              <option value="tarot">Tarot Major Arcana (22 cards)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Cards ({drawCount})
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDrawCount((prev) => Math.max(1, prev - 1))}
                className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <FaMinus />
              </button>
              <input
                type="range"
                min="1"
                max={deckType === "standard" ? 52 : 22}
                value={drawCount}
                onChange={(e) => setDrawCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <button
                onClick={() =>
                  setDrawCount((prev) =>
                    Math.min(deckType === "standard" ? 52 : 22, prev + 1)
                  )
                }
                className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <FaPlus />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shuffle Count ({shuffleCount})
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={shuffleCount}
              onChange={(e) => setShuffleCount(Math.max(1, Math.min(10, Number(e.target.value))))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={drawCards}
            disabled={remainingDeck.length === 0 && drawnCards.length > 0}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Draw Cards
          </button>
          <button
            onClick={resetDeck}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset Deck
          </button>
        </div>

        {/* Drawn Cards */}
        {drawnCards.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4 max-h-[60vh] overflow-y-auto">
            {drawnCards.map((card, index) => (
              <div
                key={index}
                className={`w-24 sm:w-28 h-36 sm:h-40 bg-white border-2 rounded-lg shadow-md flex flex-col items-center justify-center transition-transform hover:scale-105 ${
                  card.suit ? getCardColor(card.suit) : "text-gray-800"
                }`}
              >
                {deckType === "standard" ? (
                  <>
                    <div className="text-xl sm:text-2xl font-bold">{card.rank}</div>
                    <div className="text-3xl sm:text-4xl">{card.suit}</div>
                  </>
                ) : (
                  <div className="text-sm sm:text-base font-semibold text-center px-2">
                    {card.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Click "Draw Cards" to draw from a {deckType} deck!
            </p>
          </div>
        )}

        {/* Deck Status */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Remaining cards in deck: {remainingDeck.length || getDeck().length}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Choose between Standard (52 cards) or Tarot Major Arcana (22 cards)</li>
            <li>Adjustable draw count with slider and buttons</li>
            <li>Customizable shuffle iterations</li>
            <li>Persistent deck state with reset option</li>
            <li>Responsive card display with hover effects</li>
            <li>Deck status tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomCardDrawer;