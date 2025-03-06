// components/RandomCharacterTraitGenerator.js
'use client';

import React, { useState } from 'react';

const RandomCharacterTraitGenerator = () => {
  const [characterTraits, setCharacterTraits] = useState(null);

  const personalityTraits = [
    'Optimistic', 'Pessimistic', 'Introverted', 'Extroverted', 'Analytical',
    'Creative', 'Loyal', 'Skeptical', 'Compassionate', 'Sarcastic', 'Adventurous',
    'Cautious', 'Charismatic', 'Shy', 'Confident'
  ];

  const strengths = [
    'Courageous', 'Intelligent', 'Resourceful', 'Athletic', 'Perceptive',
    'Charming', 'Determined', 'Patient', 'Adaptable', 'Skilled',
    'Empathetic', 'Strategic', 'Resilient', 'Honest', 'Quick-witted'
  ];

  const weaknesses = [
    'Impulsive', 'Stubborn', 'Insecure', 'Naive', 'Arrogant',
    'Disorganized', 'Gullible', 'Short-tempered', 'Clumsy', 'Indecisive',
    'Overconfident', 'Procrastinator', 'Reckless', 'Pessimistic', 'Forgetful'
  ];

  const quirks = [
    'Talks to themselves', 'Collects odd trinkets', 'Hums constantly',
    'Obsessed with time', 'Always carries a lucky charm', 'Fidgets nervously',
    'Speaks in riddles', 'Laughs at inappropriate times', 'Counts everything',
    'Has an unusual pet', 'Whistles off-key', 'Overuses a catchphrase',
    'Avoids eye contact', 'Loves bad puns', 'Sleeps with eyes open'
  ];

  const generateTraits = () => {
    const personality = personalityTraits[Math.floor(Math.random() * personalityTraits.length)];
    const strength = strengths[Math.floor(Math.random() * strengths.length)];
    const weakness = weaknesses[Math.floor(Math.random() * weaknesses.length)];
    const quirk = quirks[Math.floor(Math.random() * quirks.length)];

    setCharacterTraits({
      personality,
      strength,
      weakness,
      quirk
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Character Trait Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateTraits}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate Character Traits
        </button>
      </div>

      {characterTraits && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3 text-center text-green-600">
            Character Profile
          </h2>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium text-gray-700">Personality:</span> {characterTraits.personality}
            </p>
            <p>
              <span className="font-medium text-gray-700">Strength:</span> {characterTraits.strength}
            </p>
            <p>
              <span className="font-medium text-gray-700">Weakness:</span> {characterTraits.weakness}
            </p>
            <p>
              <span className="font-medium text-gray-700">Quirk:</span> {characterTraits.quirk}
            </p>
          </div>
        </div>
      )}

      {!characterTraits && (
        <p className="text-center text-gray-500">
          Click the button to generate random character traits!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Use these traits to inspire unique characters for stories, games, or role-playing!
      </p>
    </div>
  );
};

export default RandomCharacterTraitGenerator;