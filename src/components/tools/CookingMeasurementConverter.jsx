"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaSave } from "react-icons/fa";

const CookingMeasurementConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("cup");
  const [ingredientDensity, setIngredientDensity] = useState("1"); // g/mL, default to water
  const [displayPrecision, setDisplayPrecision] = useState(3); // Decimal places
  const [favoriteUnits, setFavoriteUnits] = useState(["cup", "tsp", "tbsp", "g", "oz"]); // Default favorites

  // Conversion factors to milliliters (mL) for volume
  const volumeConversions = {
    cup: 236.588, // US Cup
    tsp: 4.92892, // Teaspoon
    tbsp: 14.7868, // Tablespoon
    fl_oz: 29.5735, // Fluid Ounce
    mL: 1, // Milliliter
    L: 1000, // Liter
    pint: 473.176, // US Pint
    quart: 946.353, // US Quart
    gallon: 3785.41, // US Gallon
  };

  // Weight conversions to grams (g)
  const weightConversions = {
    g: 1, // Gram
    oz: 28.3495, // Ounce
    lb: 453.592, // Pound
    kg: 1000, // Kilogram
    mg: 0.001, // Milligram
  };

  // Display names for units
  const unitDisplayNames = {
    cup: "cup",
    tsp: "tsp",
    tbsp: "tbsp",
    fl_oz: "fl oz",
    mL: "mL",
    L: "L",
    pint: "pint",
    quart: "quart",
    gallon: "gallon",
    g: "g",
    oz: "oz",
    lb: "lb",
    kg: "kg",
    mg: "mg",
  };

  // Predefined densities for common ingredients
  const ingredientDensities = {
    water: 1,
    flour: 0.6,
    sugar: 0.8,
    butter: 0.9,
    milk: 1.03,
    oil: 0.92,
  };

  // Conversion logic
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return { volume: {}, weight: {} };

      const isVolume = Object.keys(volumeConversions).includes(fromUnit);
      const density = parseFloat(ingredientDensity) || 1;

      if (isVolume) {
        const valueInMl = inputValue * volumeConversions[fromUnit];
        const valueInGrams = valueInMl * density;

        return {
          volume: Object.keys(volumeConversions).reduce((acc, unit) => {
            acc[unit] = valueInMl / volumeConversions[unit];
            return acc;
          }, {}),
          weight: Object.keys(weightConversions).reduce((acc, unit) => {
            acc[unit] = valueInGrams / weightConversions[unit];
            return acc;
          }, {}),
        };
      } else {
        const valueInGrams = inputValue * weightConversions[fromUnit];
        const valueInMl = valueInGrams / density;

        return {
          volume: Object.keys(volumeConversions).reduce((acc, unit) => {
            acc[unit] = valueInMl / volumeConversions[unit];
            return acc;
          }, {}),
          weight: Object.keys(weightConversions).reduce((acc, unit) => {
            acc[unit] = valueInGrams / weightConversions[unit];
            return acc;
          }, {}),
        };
      }
    },
    [ingredientDensity]
  );

  const results = convertValue(value, unit);

  // Reset function
  const reset = () => {
    setValue("");
    setUnit("cup");
    setIngredientDensity("1");
    setDisplayPrecision(3);
  };

  // Save favorites to localStorage (simulated)
  const saveFavorites = () => {
    alert("Favorites saved! (Simulated - implement localStorage for persistence)");
    // Uncomment to use localStorage:
    // localStorage.setItem("favoriteUnits", JSON.stringify(favoriteUnits));
  };

  // Toggle favorite units
  const toggleFavorite = (unit) => {
    setFavoriteUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    );
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Cooking Measurement Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Measurement
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="Volume">
                  {Object.keys(volumeConversions).map((u) => (
                    <option key={u} value={u}>
                      {unitDisplayNames[u]}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Weight">
                  {Object.keys(weightConversions).map((u) => (
                    <option key={u} value={u}>
                      {unitDisplayNames[u]}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Density & Precision */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingredient Density (g/mL)
              </label>
              <select
                value={ingredientDensity}
                onChange={(e) => setIngredientDensity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(ingredientDensities).map(([name, density]) => (
                  <option key={name} value={density}>
                    {name} ({density})
                  </option>
                ))}
                <option value={ingredientDensity}>Custom ({ingredientDensity})</option>
              </select>
              <input
                type="number"
                value={ingredientDensity}
                onChange={(e) => setIngredientDensity(e.target.value)}
                placeholder="Custom density"
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Precision (decimals)
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={displayPrecision}
                onChange={(e) => setDisplayPrecision(Math.max(0, Math.min(6, e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={saveFavorites}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaSave className="mr-2" /> Save Favorites
              </button>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Volume:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results.volume)
                    .filter(([unit]) => favoriteUnits.includes(unit))
                    .map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}: {val.toFixed(displayPrecision)}
                        <button
                          onClick={() => toggleFavorite(unit)}
                          className="ml-2 text-yellow-500 hover:text-yellow-600"
                        >
                          ★
                        </button>
                      </p>
                    ))}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Weight:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results.weight)
                    .filter(([unit]) => favoriteUnits.includes(unit))
                    .map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}: {val.toFixed(displayPrecision)}
                        <button
                          onClick={() => toggleFavorite(unit)}
                          className="ml-2 text-yellow-500 hover:text-yellow-600"
                        >
                          ★
                        </button>
                      </p>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Favorite Units Selection */}
          <div className="p-4 bg-yellow-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Select Favorite Units:</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              {[...Object.keys(volumeConversions), ...Object.keys(weightConversions)].map(
                (unit) => (
                  <label key={unit} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={favoriteUnits.includes(unit)}
                      onChange={() => toggleFavorite(unit)}
                      className="mr-2 accent-blue-500"
                    />
                    {unitDisplayNames[unit]}
                  </label>
                )
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between volume and weight units</li>
            <li>Adjustable ingredient density with presets</li>
            <li>Customizable display precision (0-6 decimals)</li>
            <li>Favorite units selection</li>
            <li>1 cup = 236.588 mL, 1 oz = 28.3495 g, etc.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CookingMeasurementConverter;