// components/RandomFoodDishGenerator.js
'use client';

import React, { useState } from 'react';

const RandomFoodDishGenerator = () => {
  const [dish, setDish] = useState(null);

  const cuisines = [
    'Italian', 'Mexican', 'Japanese', 'Indian', 'French', 'Chinese', 
    'Thai', 'Mediterranean', 'Korean', 'American', 'Vietnamese', 'Spanish'
  ];
  
  const ingredients = [
    'chicken', 'beef', 'salmon', 'tofu', 'shrimp', 'pork', 'mushrooms', 
    'rice', 'pasta', 'quinoa', 'lentils', 'vegetables', 'cheese', 'noodles'
  ];
  
  const cookingMethods = [
    'grilled', 'roasted', 'stir-fried', 'baked', 'steamed', 'fried', 
    'slow-cooked', 'poached', 'braised', 'sautéed', 'smoked'
  ];
  
  const styles = [
    'spicy', 'creamy', 'tangy', 'savory', 'sweet', 'herb-infused', 
    'citrusy', 'smoky', 'crunchy', 'light', 'hearty', 'aromatic'
  ];

  const generateDish = () => {
    const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
    const ingredient = ingredients[Math.floor(Math.random() * ingredients.length)];
    const method = cookingMethods[Math.floor(Math.random() * cookingMethods.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];
    
    const name = `${style} ${cuisine} ${ingredient}`;
    const description = `${method} ${ingredient} with ${cuisine.toLowerCase()} flavors, served in a ${style.toLowerCase()} style.`;
    
    setDish({ name, description });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Food Dish Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateDish}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate New Dish
        </button>
      </div>

      {dish && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-xl font-semibold mb-3 text-green-600">
            {dish.name}
          </h2>
          <p className="text-gray-700">
            {dish.description}
          </p>
        </div>
      )}

      {!dish && (
        <p className="text-center text-gray-500">
          Click the button to generate a random food dish idea!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: These are creative dish ideas generated for inspiration and fun!
      </p>
    </div>
  );
};

export default RandomFoodDishGenerator;