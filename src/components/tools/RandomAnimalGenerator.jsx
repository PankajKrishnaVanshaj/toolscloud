// components/RandomAnimalGenerator.js
'use client';

import React, { useState } from 'react';

const RandomAnimalGenerator = () => {
  const [animal, setAnimal] = useState(null);

  const bases = [
    'Tiger', 'Eagle', 'Shark', 'Bear', 'Wolf', 'Snake', 'Hawk', 
    'Panther', 'Crocodile', 'Owl', 'Fox', 'Dolphin'
  ];
  
  const modifiers = [
    'Crystal', 'Shadow', 'Flame', 'Ice', 'Thunder', 'Mist', 'Glow', 
    'Venom', 'Steel', 'Frost', 'Solar', 'Lunar'
  ];
  
  const habitats = [
    'Jungle', 'Desert', 'Ocean', 'Mountain', 'Forest', 'Tundra', 'Sky', 
    'Cave', 'Swamp', 'Plains', 'Volcano', 'River'
  ];
  
  const traits = [
    'winged', 'horned', 'scaled', 'feathered', 'clawed', 'tailed', 
    'fanged', 'spiked', 'armored', 'camouflaged', 'bioluminescent', 'giant'
  ];

  const generateAnimal = () => {
    const base = bases[Math.floor(Math.random() * bases.length)];
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    const habitat = habitats[Math.floor(Math.random() * habitats.length)];
    const trait = traits[Math.floor(Math.random() * traits.length)];
    
    const name = `${modifier} ${base}`;
    const description = `A ${trait} ${base.toLowerCase()} native to the ${habitat}.`;
    
    setAnimal({ name, description });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Animal Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateAnimal}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate New Animal
        </button>
      </div>

      {animal && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-xl font-semibold mb-3 text-green-600">
            {animal.name}
          </h2>
          <p className="text-gray-700">
            {animal.description}
          </p>
        </div>
      )}

      {!animal && (
        <p className="text-center text-gray-500">
          Click the button to generate a random animal!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: These are fictional animals generated for fun and creativity!
      </p>
    </div>
  );
};

export default RandomAnimalGenerator;