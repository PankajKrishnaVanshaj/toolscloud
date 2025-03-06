// components/RandomMythicalCreatureGenerator.js
'use client';

import React, { useState } from 'react';

const RandomMythicalCreatureGenerator = () => {
  const [creature, setCreature] = useState(null);

  const heads = [
    'Dragon', 'Lion', 'Eagle', 'Serpent', 'Wolf', 'Phoenix', 'Unicorn', 'Sphinx'
  ];
  
  const bodies = [
    'Horse', 'Bear', 'Deer', 'Snake', 'Bird', 'Fish', 'Spider', 'Goat'
  ];
  
  const abilities = [
    'fire-breathing', 'shape-shifting', 'invisibility', 'flight', 
    'venomous', 'teleportation', 'mind-reading', 'regeneration', 
    'ice-control', 'time-bending'
  ];
  
  const traits = [
    'Golden', 'Iridescent', 'Shadowy', 'Crystal', 'Emerald', 
    'Spectral', 'Luminous', 'Obsidian', 'Celestial', 'Ethereal'
  ];

  const habitats = [
    'mountains', 'forests', 'oceans', 'deserts', 'clouds', 
    'caves', 'volcanoes', 'swamps', 'underworld'
  ];

  const generateCreature = () => {
    const head = heads[Math.floor(Math.random() * heads.length)];
    const body = bodies[Math.floor(Math.random() * bodies.length)];
    const ability = abilities[Math.floor(Math.random() * abilities.length)];
    const trait = traits[Math.floor(Math.random() * traits.length)];
    const habitat = habitats[Math.floor(Math.random() * habitats.length)];
    
    const name = `${trait} ${head}${body}`;
    const description = `A mythical creature with the head of a ${head.toLowerCase()} and the body of a ${body.toLowerCase()}, capable of ${ability}. It dwells in the ${habitat}.`;
    
    setCreature({ name, description });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Mythical Creature Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateCreature}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          Generate New Creature
        </button>
      </div>

      {creature && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-xl font-semibold mb-3 text-purple-600">
            {creature.name}
          </h2>
          <p className="text-gray-700">
            {creature.description}
          </p>
        </div>
      )}

      {!creature && (
        <p className="text-center text-gray-500">
          Click the button to generate a random mythical creature!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: These are fictional creatures generated for fun and inspiration!
      </p>
    </div>
  );
};

export default RandomMythicalCreatureGenerator;