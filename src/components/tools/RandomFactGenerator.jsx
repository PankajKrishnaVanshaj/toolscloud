// components/RandomFactGenerator.js
'use client';

import React, { useState } from 'react';

const RandomFactGenerator = () => {
  const [currentFact, setCurrentFact] = useState(null);

  const facts = [
    "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
    "Octopuses have three hearts and can change color to blend into their surroundings.",
    "A day on Venus is longer than its year.",
    "The shortest war in history lasted 38 minutes.",
    "Bananas are berries, but strawberries aren't.",
    "The human nose can detect about 1 trillion different smells.",
    "A group of flamingos is called a 'flamboyance'.",
    "The shortest bone in the human body is in the ear and is about 3mm long.",
    "Cows have best friends and can become stressed when separated from them.",
    "The first computer 'bug' was an actual insect that got stuck in a relay.",
    "A single cloud can weigh more than a million pounds.",
    "Polar bears have black skin under their white fur to absorb heat.",
    "The shortest warship in history was just 13 feet long.",
    "Sloths can hold their breath longer than dolphins.",
    "The inventor of the frisbee was turned into a frisbee after he died.",
    "A jiffy is an actual unit of time: 1/100th of a second.",
    "There are more stars in the universe than grains of sand on Earth.",
    "The shortest war in history was won with zero casualties.",
    "A blue whale's heart weighs as much as a car.",
    "Butterflies taste with their feet."
  ];

  const generateFact = () => {
    const randomIndex = Math.floor(Math.random() * facts.length);
    setCurrentFact(facts[randomIndex]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Fact Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateFact}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate New Fact
        </button>
      </div>

      {currentFact && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <p className="text-gray-800 text-lg italic">
            "{currentFact}"
          </p>
        </div>
      )}

      {!currentFact && (
        <p className="text-center text-gray-500">
          Click the button to discover a random fact!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Fun facts sourced from various trivia collections.
      </p>
    </div>
  );
};

export default RandomFactGenerator;