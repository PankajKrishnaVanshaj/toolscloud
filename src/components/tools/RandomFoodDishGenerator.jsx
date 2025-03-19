"use client";
import React, { useState, useCallback } from "react";
import { FaDice, FaSave, FaTrash } from "react-icons/fa";

const RandomFoodDishGenerator = () => {
  const [dish, setDish] = useState(null);
  const [savedDishes, setSavedDishes] = useState([]);
  const [courseType, setCourseType] = useState("any");

  // Expanded data arrays
  const cuisines = [
    "Italian", "Mexican", "Japanese", "Indian", "French", "Chinese",
    "Thai", "Mediterranean", "Korean", "American", "Vietnamese", "Spanish",
    "Greek", "Brazilian", "Moroccan", "Ethiopian", "Turkish"
  ];

  const ingredients = [
    "chicken", "beef", "salmon", "tofu", "shrimp", "pork", "mushrooms",
    "rice", "pasta", "quinoa", "lentils", "vegetables", "cheese", "noodles",
    "lamb", "duck", "eggplant", "potatoes", "beans", "spinach", "avocado"
  ];

  const cookingMethods = [
    "grilled", "roasted", "stir-fried", "baked", "steamed", "fried",
    "slow-cooked", "poached", "braised", "sautéed", "smoked", "marinated",
    "charred", "blanched", "seared"
  ];

  const styles = [
    "spicy", "creamy", "tangy", "savory", "sweet", "herb-infused",
    "citrusy", "smoky", "crunchy", "light", "hearty", "aromatic",
    "zesty", "silky", "bold", "rustic", "velvety"
  ];

  const courseTypes = [
    "appetizer", "main", "dessert", "side", "soup", "salad"
  ];

  const extras = [
    "with a garlic sauce", "topped with fresh herbs", "served with flatbread",
    "garnished with nuts", "paired with a tangy slaw", "drizzled with olive oil",
    "with a side of rice", "in a rich broth", "over a bed of greens"
  ];

  // Generate a random dish
  const generateDish = useCallback(() => {
    const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
    const ingredient = ingredients[Math.floor(Math.random() * ingredients.length)];
    const method = cookingMethods[Math.floor(Math.random() * cookingMethods.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const extra = extras[Math.floor(Math.random() * extras.length)];
    const course =
      courseType === "any"
        ? courseTypes[Math.floor(Math.random() * courseTypes.length)]
        : courseType;

    const name = `${style} ${cuisine} ${ingredient}`;
    const description = `${course.charAt(0).toUpperCase() + course.slice(1)}: ${method} ${ingredient} with ${cuisine.toLowerCase()} flavors, served in a ${style.toLowerCase()} style ${extra}.`;

    setDish({ name, description, course });
  }, [courseType]);

  // Save the current dish
  const saveDish = () => {
    if (dish && !savedDishes.some((saved) => saved.name === dish.name)) {
      setSavedDishes((prev) => [...prev, dish]);
    }
  };

  // Remove a saved dish
  const removeSavedDish = (index) => {
    setSavedDishes((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Food Dish Generator
        </h1>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Type
            </label>
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="any">Any</option>
              {courseTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={generateDish}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDice className="mr-2" /> Generate New Dish
            </button>
          </div>
        </div>

        {/* Generated Dish */}
        {dish && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-green-600 mb-3">
                {dish.name}
              </h2>
              <p className="text-gray-700">{dish.description}</p>
              <button
                onClick={saveDish}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaSave className="mr-2" /> Save Dish
              </button>
            </div>
          </div>
        )}

        {!dish && (
          <div className="text-center p-6 bg-gray-50 rounded-lg mb-6">
            <p className="text-gray-500 italic">
              Click "Generate New Dish" to create a random food idea!
            </p>
          </div>
        )}

        {/* Saved Dishes */}
        {savedDishes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Saved Dishes</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {savedDishes.map((savedDish, index) => (
                <div
                  key={index}
                  className="bg-gray-100 p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h4 className="text-md font-medium text-green-600">
                      {savedDish.name}
                    </h4>
                    <p className="text-sm text-gray-600">{savedDish.description}</p>
                  </div>
                  <button
                    onClick={() => removeSavedDish(index)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate random dishes from various cuisines</li>
            <li>Filter by course type (appetizer, main, etc.)</li>
            <li>Save your favorite dish ideas</li>
            <li>Expanded list of ingredients, methods, and styles</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: These are creative dish ideas generated for inspiration and fun!
        </p>
      </div>
    </div>
  );
};

export default RandomFoodDishGenerator;