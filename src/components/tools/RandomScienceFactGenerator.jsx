// components/RandomScienceFactGenerator.js
'use client';

import React, { useState } from 'react';

const RandomScienceFactGenerator = () => {
  const [currentFact, setCurrentFact] = useState(null);

  const scienceFacts = [
    {
      fact: "The shortest war in history lasted 38 minutes.",
      category: "History/Science"
    },
    {
      fact: "A day on Venus is longer than its year.",
      category: "Astronomy"
    },
    {
      fact: "Octopuses have three hearts and can change color to blend into their surroundings.",
      category: "Biology"
    },
    {
      fact: "The human body contains about 0.2 milligrams of gold, most of it in the blood.",
      category: "Human Biology"
    },
    {
      fact: "Light travels at 299,792 kilometers per second (about 186,282 miles per second).",
      category: "Physics"
    },
    {
      fact: "Honey never spoils; archeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible.",
      category: "Chemistry"
    },
    {
      fact: "The shortest bone in the human body is the stapes bone in the ear, measuring about 2.8 millimeters.",
      category: "Human Biology"
    },
    {
      fact: "A single bolt of lightning contains enough energy to toast 100,000 slices of bread.",
      category: "Physics"
    },
    {
      fact: "The largest known volcano in the solar system is Olympus Mons on Mars, standing at 22 kilometers (13.6 miles) high.",
      category: "Astronomy"
    },
    {
      fact: "Water expands by about 9% when it freezes into ice.",
      category: "Chemistry"
    },
    {
      fact: "Bamboo can grow up to 91 centimeters (35 inches) in a single day.",
      category: "Botany"
    },
    {
      fact: "The Earth's core is as hot as the surface of the Sun, about 5,500°C (9,932°F).",
      category: "Geology"
    }
  ];

  const generateFact = () => {
    const randomIndex = Math.floor(Math.random() * scienceFacts.length);
    setCurrentFact(scienceFacts[randomIndex]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Science Fact Generator</h1>
      
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
          <p className="text-lg text-gray-800 mb-2">
            {currentFact.fact}
          </p>
          <p className="text-sm text-gray-600">
            Category: {currentFact.category}
          </p>
        </div>
      )}

      {!currentFact && (
        <p className="text-center text-gray-500">
          Click the button to generate a random science fact!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Explore fascinating facts from various scientific fields!
      </p>
    </div>
  );
};

export default RandomScienceFactGenerator;