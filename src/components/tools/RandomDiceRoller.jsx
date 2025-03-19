"use client";
import React, { useState, useCallback } from "react";
import { FaDice, FaSync, FaHistory } from "react-icons/fa";

const RandomDiceRoller = () => {
  const [diceType, setDiceType] = useState(6); // Default to d6
  const [diceCount, setDiceCount] = useState(1); // Default to 1 die
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState([]);
  const [modifier, setModifier] = useState(0); // Roll modifier
  const [isRolling, setIsRolling] = useState(false);
  const diceOptions = [4, 6, 8, 10, 12, 20, 100]; // Added d100

  // Roll dice function with animation simulation
  const rollDice = useCallback(() => {
    setIsRolling(true);
    setTimeout(() => {
      const newResults = [];
      let sum = 0;

      for (let i = 0; i < diceCount; i++) {
        const roll = Math.floor(Math.random() * diceType) + 1;
        newResults.push(roll);
        sum += roll;
      }

      const modifiedTotal = sum + Number(modifier);
      setResults(newResults);
      setTotal(modifiedTotal);
      setHistory((prev) => [
        { dice: `${diceCount}d${diceType}`, results: newResults, total: modifiedTotal },
        ...prev.slice(0, 9), // Keep last 10 rolls
      ]);
      setIsRolling(false);
    }, 500); // Simulate rolling animation
  }, [diceCount, diceType, modifier]);

  // Reset all states
  const reset = () => {
    setDiceType(6);
    setDiceCount(1);
    setResults([]);
    setTotal(0);
    setHistory([]);
    setModifier(0);
    setIsRolling(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Dice Roller
        </h1>

        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dice Type (d{diceType})
              </label>
              <select
                value={diceType}
                onChange={(e) => setDiceType(Number(e.target.value))}
                disabled={isRolling}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
              >
                {diceOptions.map((type) => (
                  <option key={type} value={type}>
                    d{type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Dice ({diceCount})
              </label>
              <input
                type="number"
                value={diceCount}
                onChange={(e) => setDiceCount(Math.max(1, Math.min(20, Number(e.target.value))))}
                min="1"
                max="20"
                disabled={isRolling}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modifier ({modifier >= 0 ? `+${modifier}` : modifier})
              </label>
              <input
                type="number"
                value={modifier}
                onChange={(e) => setModifier(Number(e.target.value))}
                min="-100"
                max="100"
                disabled={isRolling}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={rollDice}
              disabled={isRolling}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {isRolling ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <FaDice className="mr-2" />
              )}
              {isRolling ? "Rolling..." : `Roll ${diceCount}d${diceType}`}
            </button>
            <button
              onClick={reset}
              disabled={isRolling}
              className="flex-1 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-2 text-center">Results</h2>
              <div className="text-center">
                <p className="text-sm text-gray-700">
                  Individual Rolls: {results.join(", ")}
                </p>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  Total: {total} {modifier !== 0 && `(Rolls: ${results.reduce((a, b) => a + b, 0)} + Modifier: ${modifier})`}
                </p>
              </div>
            </div>
          )}

          {!results.length && !isRolling && (
            <p className="text-center text-gray-500">
              Roll the dice to see your results!
            </p>
          )}

          {isRolling && !results.length && (
            <div className="text-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          )}

          {/* Roll History */}
          {history.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-2 flex items-center justify-center">
                <FaHistory className="mr-2" /> Roll History
              </h2>
              <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
                {history.map((roll, index) => (
                  <li key={index}>
                    {roll.dice}: {roll.results.join(", ")} ={" "}
                    <span className="font-bold">{roll.total}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple dice types: d4, d6, d8, d10, d12, d20, d100</li>
            <li>Roll up to 20 dice at once</li>
            <li>Add positive or negative modifiers</li>
            <li>Roll history tracking (last 10 rolls)</li>
            <li>Animated rolling effect</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Perfect for tabletop gaming, random decisions, or just for fun!
        </p>
      </div>
    </div>
  );
};

export default RandomDiceRoller;