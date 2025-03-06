// components/RandomRiddleGenerator.js
'use client';

import React, { useState } from 'react';

const RandomRiddleGenerator = () => {
  const [riddle, setRiddle] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const riddleTemplates = [
    {
      structure: "I am full of holes, yet I can hold water. I am used to clean, but I am not soap. What am I?",
      answer: "A sponge"
    },
    {
      structure: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
      answer: "An echo"
    },
    {
      structure: "I’m tall when I’m young, and I’m short when I’m old. What am I?",
      answer: "A candle"
    },
    {
      structure: "What has keys but can’t open locks?",
      answer: "A piano"
    },
    {
      structure: "The more you take, the more you leave behind. What am I?",
      answer: "Footsteps"
    }
  ];

  const generateRiddle = () => {
    const randomIndex = Math.floor(Math.random() * riddleTemplates.length);
    setRiddle(riddleTemplates[randomIndex]);
    setShowAnswer(false); // Hide answer when generating new riddle
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Riddle Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateRiddle}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          Generate New Riddle
        </button>
      </div>

      {riddle && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <p className="text-gray-700 mb-4">{riddle.structure}</p>
          <button
            onClick={toggleAnswer}
            className="px-4 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>
          {showAnswer && (
            <p className="mt-3 text-purple-600 font-semibold">
              Answer: {riddle.answer}
            </p>
          )}
        </div>
      )}

      {!riddle && (
        <p className="text-center text-gray-500">
          Click the button to generate a random riddle!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Test your wits with these clever riddles!
      </p>
    </div>
  );
};

export default RandomRiddleGenerator;