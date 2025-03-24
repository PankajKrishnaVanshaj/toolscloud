"use client";
import React, { useState, useCallback } from "react";
import { FaDice, FaSave, FaSync } from "react-icons/fa";

const RandomRecipeGenerator = () => {
  const [recipe, setRecipe] = useState(null);
  const [servings, setServings] = useState(2);
  const [dietaryPref, setDietaryPref] = useState("none");
  const [savedRecipes, setSavedRecipes] = useState([]);

  // Expanded data arrays
  const cuisines = [
    "Italian", "Mexican", "Chinese", "Indian", "French", "Japanese", "Thai",
    "Mediterranean", "American", "Korean", "Spanish", "Vietnamese", "Greek",
  ];
  const proteins = {
    none: ["Chicken", "Beef", "Pork", "Fish", "Shrimp", "Lamb", "Turkey", "Eggs"],
    vegetarian: ["Tofu", "Lentils", "Chickpeas", "Tempeh", "Black Beans"],
    vegan: ["Tofu", "Lentils", "Chickpeas", "Tempeh", "Black Beans"],
  };
  const veggies = [
    "Broccoli", "Spinach", "Carrots", "Bell Peppers", "Zucchini", "Mushrooms",
    "Onions", "Tomatoes", "Kale", "Cauliflower", "Eggplant", "Asparagus",
  ];
  const carbs = [
    "Rice", "Pasta", "Potatoes", "Quinoa", "Bread", "Noodles", "Couscous",
    "Tortillas", "Polenta", "Sweet Potatoes", "Barley",
  ];
  const cookingMethods = [
    "Grilled", "Baked", "Stir-fried", "Roasted", "Steamed", "Sautéed",
    "Slow-cooked", "Pan-fried", "Poached", "Broiled",
  ];
  const seasonings = [
    "Garlic", "Ginger", "Chili", "Basil", "Curry", "Soy Sauce", "Rosemary",
    "Cumin", "Paprika", "Lemon", "Oregano", "Cilantro", "Turmeric",
  ];
  const extras = [
    "Cheese", "Cream", "Nuts", "Seeds", "Olives", "Honey", "Yogurt",
  ];

  // Generate recipe based on preferences
  const generateRecipe = useCallback(() => {
    const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
    const availableProteins = proteins[dietaryPref] || proteins.none;
    const protein = availableProteins[Math.floor(Math.random() * availableProteins.length)];
    const veggie = veggies[Math.floor(Math.random() * veggies.length)];
    const carb = carbs[Math.floor(Math.random() * carbs.length)];
    const method = cookingMethods[Math.floor(Math.random() * cookingMethods.length)];
    const seasoning = seasonings[Math.floor(Math.random() * seasonings.length)];
    const extra = dietaryPref === "vegan" ? null : extras[Math.floor(Math.random() * extras.length)];

    const name = `${method} ${cuisine} ${protein} with ${veggie}`;
    const ingredients = [
      `${protein} (${(servings * 0.5).toFixed(1)} lb)`,
      `${veggie} (${servings} cups)`,
      `${carb} (${servings * 0.5} cups)`,
      `${seasoning} (to taste)`,
      "Salt and pepper (to taste)",
      "Olive oil (2 tbsp)",
      ...(extra && dietaryPref !== "vegan" ? [`${extra} (1/4 cup)`] : []),
    ];
    const instructions = [
      `Prepare the ${protein.toLowerCase()} by seasoning with salt, pepper, and ${seasoning.toLowerCase()}.`,
      `Heat olive oil in a pan and ${method.toLowerCase()} the ${protein.toLowerCase()} until cooked through (about ${Math.floor(Math.random() * 10) + 5} minutes).`,
      `Add ${veggie.toLowerCase()} and cook until tender (about 5-7 minutes).`,
      ...(extra && dietaryPref !== "vegan" ? [`Stir in ${extra.toLowerCase()} and cook for an additional 2 minutes.`] : []),
      `Serve over ${carb.toLowerCase()} and garnish with additional ${seasoning.toLowerCase()} if desired.`,
    ];

    setRecipe({ name, cuisine, ingredients, instructions, servings, dietaryPref });
  }, [servings, dietaryPref]);

  // Save recipe
  const saveRecipe = () => {
    if (recipe) {
      setSavedRecipes((prev) => [...prev, { ...recipe, id: Date.now() }]);
    }
  };

  // Clear saved recipes
  const clearSavedRecipes = () => {
    setSavedRecipes([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Recipe Generator
        </h1>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
            <input
              type="number"
              min="1"
              max="10"
              value={servings}
              onChange={(e) => setServings(Math.max(1, Math.min(10, e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dietary Preference
            </label>
            <select
              value={dietaryPref}
              onChange={(e) => setDietaryPref(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="none">None</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={generateRecipe}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDice className="mr-2" /> Generate
            </button>
          </div>
        </div>

        {/* Recipe Display */}
        {recipe && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-green-600">{recipe.name}</h2>
              <button
                onClick={saveRecipe}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                title="Save Recipe"
              >
                <FaSave />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Cuisine: {recipe.cuisine} | Servings: {recipe.servings} | Diet:{" "}
              {recipe.dietaryPref === "none" ? "Standard" : recipe.dietaryPref}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Ingredients</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {recipe.ingredients.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Instructions</h3>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                  {recipe.instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Saved Recipes */}
        {savedRecipes.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-blue-700">Saved Recipes</h3>
              <button
                onClick={clearSavedRecipes}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Clear Saved Recipes"
              >
                <FaSync />
              </button>
            </div>
            <ul className="list-disc list-inside text-sm text-blue-600 space-y-2 max-h-48 overflow-y-auto">
              {savedRecipes.map((saved) => (
                <li key={saved.id}>
                  {saved.name} ({saved.cuisine}, {saved.servings} servings,{" "}
                  {saved.dietaryPref === "none" ? "Standard" : saved.dietaryPref})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Placeholder */}
        {!recipe && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Set your preferences and click "Generate" to create a random recipe!
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Customizable servings (1-10)</li>
            <li>Dietary preferences: None, Vegetarian, Vegan</li>
            <li>Expanded ingredient and cuisine options</li>
            <li>Save and view generated recipes</li>
            <li>Randomized cooking times for realism</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Recipes are randomly generated and may require adjustments for real cooking.
        </p>
      </div>
    </div>
  );
};

export default RandomRecipeGenerator;