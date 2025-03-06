// components/RandomRecipeGenerator.js
'use client';

import React, { useState } from 'react';

const RandomRecipeGenerator = () => {
  const [recipe, setRecipe] = useState(null);

  const cuisines = [
    'Italian', 'Mexican', 'Chinese', 'Indian', 'French', 'Japanese', 
    'Thai', 'Mediterranean', 'American', 'Korean'
  ];

  const proteins = [
    'Chicken', 'Beef', 'Pork', 'Fish', 'Shrimp', 'Tofu', 'Lamb', 
    'Turkey', 'Eggs', 'Lentils'
  ];

  const veggies = [
    'Broccoli', 'Spinach', 'Carrots', 'Bell Peppers', 'Zucchini', 
    'Mushrooms', 'Onions', 'Tomatoes', 'Kale', 'Cauliflower'
  ];

  const carbs = [
    'Rice', 'Pasta', 'Potatoes', 'Quinoa', 'Bread', 'Noodles', 
    'Couscous', 'Tortillas', 'Polenta', 'Sweet Potatoes'
  ];

  const cookingMethods = [
    'Grilled', 'Baked', 'Stir-fried', 'Roasted', 'Steamed', 
    'Sautéed', 'Slow-cooked', 'Pan-fried', 'Poached', 'Broiled'
  ];

  const seasonings = [
    'Garlic', 'Ginger', 'Chili', 'Basil', 'Curry', 'Soy Sauce', 
    'Rosemary', 'Cumin', 'Paprika', 'Lemon'
  ];

  const generateRecipe = () => {
    const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
    const protein = proteins[Math.floor(Math.random() * proteins.length)];
    const veggie = veggies[Math.floor(Math.random() * veggies.length)];
    const carb = carbs[Math.floor(Math.random() * carbs.length)];
    const method = cookingMethods[Math.floor(Math.random() * cookingMethods.length)];
    const seasoning = seasonings[Math.floor(Math.random() * seasonings.length)];

    const name = `${method} ${cuisine} ${protein} with ${veggie}`;
    const ingredients = [
      `${protein} (1 lb)`,
      `${veggie} (2 cups)`,
      `${carb} (1 cup)`,
      `${seasoning} (to taste)`,
      'Salt and pepper (to taste)',
      'Olive oil (2 tbsp)'
    ];
    const instructions = [
      `Prepare the ${protein.toLowerCase()} by seasoning with salt, pepper, and ${seasoning.toLowerCase()}.`,
      `Heat olive oil in a pan and ${method.toLowerCase()} the ${protein.toLowerCase()} until cooked through.`,
      `Add ${veggie.toLowerCase()} and cook until tender.`,
      `Serve over ${carb.toLowerCase()} and garnish with additional ${seasoning.toLowerCase()} if desired.`
    ];

    setRecipe({ name, cuisine, ingredients, instructions });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Recipe Generator</h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={generateRecipe}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate New Recipe
        </button>
      </div>

      {recipe && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-3 text-green-600 text-center">
            {recipe.name}
          </h2>
          <p className="text-sm text-gray-600 text-center mb-4">
            Cuisine: {recipe.cuisine}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Ingredients</h3>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {recipe.ingredients.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Instructions</h3>
              <ol className="list-decimal list-inside text-sm text-gray-700">
                {recipe.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {!recipe && (
        <p className="text-center text-gray-500">
          Click the button to generate a random recipe!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Recipes are randomly generated and may require adjustments for real cooking.
      </p>
    </div>
  );
};

export default RandomRecipeGenerator;