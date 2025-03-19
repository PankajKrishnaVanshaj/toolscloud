"use client";
import React, { useState, useCallback } from "react";
import { FaRedo, FaChartPie, FaCog } from "react-icons/fa";

const VirtualCoinFlipper = () => {
  const [result, setResult] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState([]);
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);
  const [flipSpeed, setFlipSpeed] = useState(1000); // Animation duration in ms
  const [coinStyle, setCoinStyle] = useState("classic"); // Coin design option
  const [showStats, setShowStats] = useState(true);

  // Flip coin logic
  const flipCoin = useCallback(() => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);

    setTimeout(() => {
      const outcome = Math.random() < 0.5 ? "Heads" : "Tails";
      setResult(outcome);
      setHistory((prev) => [outcome, ...prev].slice(0, 20)); // Keep last 20 flips
      if (outcome === "Heads") setHeadsCount((prev) => prev + 1);
      else setTailsCount((prev) => prev + 1);
      setIsFlipping(false);
    }, flipSpeed);
  }, [isFlipping, flipSpeed]);

  // Reset all stats
  const resetStats = () => {
    setHistory([]);
    setHeadsCount(0);
    setTailsCount(0);
    setResult(null);
  };

  // Coin style configuration
  const coinStyles = {
    classic: { heads: "bg-yellow-400 text-gray-800", tails: "bg-gray-300 text-gray-800" },
    modern: { heads: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white", tails: "bg-gradient-to-r from-gray-500 to-gray-700 text-white" },
    minimal: { heads: "bg-white border-4 border-green-500 text-green-600", tails: "bg-white border-4 border-gray-500 text-gray-600" },
  };

  // Calculate percentage for stats
  const totalFlips = headsCount + tailsCount;
  const headsPercent = totalFlips ? ((headsCount / totalFlips) * 100).toFixed(1) : 0;
  const tailsPercent = totalFlips ? ((tailsCount / totalFlips) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Virtual Coin Flipper
        </h1>

        {/* Coin Display */}
        <div className="flex justify-center mb-6">
          <div
            className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold shadow-md transition-all duration-1000 ${
              isFlipping ? "animate-spin" : ""
            } ${
              result === "Heads"
                ? coinStyles[coinStyle].heads
                : result === "Tails"
                ? coinStyles[coinStyle].tails
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {result || "Flip Me!"}
          </div>
        </div>

        {/* Flip Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={flipCoin}
            disabled={isFlipping}
            className={`px-6 py-2 rounded-md text-white font-semibold transition-colors duration-200 ${
              isFlipping
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isFlipping ? "Flipping..." : "Flip Coin"}
          </button>
        </div>

        {/* Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flip Speed (ms)
              </label>
              <input
                type="range"
                min="500"
                max="2000"
                step="100"
                value={flipSpeed}
                onChange={(e) => setFlipSpeed(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <span className="text-sm text-gray-600">{flipSpeed}ms</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coin Style
              </label>
              <select
                value={coinStyle}
                onChange={(e) => setCoinStyle(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        {showStats && totalFlips > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-700">Statistics</h2>
              <button
                onClick={() => setShowStats(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Hide
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600">{headsCount}</p>
                <p className="text-sm text-gray-600">Heads ({headsPercent}%)</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-600">{tailsCount}</p>
                <p className="text-sm text-gray-600">Tails ({tailsPercent}%)</p>
              </div>
            </div>
            {/* Simple Pie Chart */}
            <div className="mt-4 flex justify-center">
              <div
                className="w-24 h-24 rounded-full relative"
                style={{
                  background: `conic-gradient(#34d399 ${headsPercent}%, #6b7280 ${headsPercent}% 100%)`,
                }}
              >
                <div className="absolute inset-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        {!showStats && totalFlips > 0 && (
          <div className="mb-6 text-center">
            <button
              onClick={() => setShowStats(true)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center mx-auto"
            >
              <FaChartPie className="mr-1" /> Show Stats
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-700">Recent Flips (Last 20)</h2>
              <button
                onClick={resetStats}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center text-sm"
              >
                <FaRedo className="mr-1" /> Reset
              </button>
            </div>
            <ul className="space-y-1 max-h-40 overflow-y-auto border p-2 rounded-md bg-gray-50">
              {history.map((flip, index) => (
                <li
                  key={index}
                  className={`text-sm ${flip === "Heads" ? "text-green-600" : "text-gray-600"}`}
                >
                  {flip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Customizable flip speed</li>
            <li>Multiple coin styles: Classic, Modern, Minimal</li>
            <li>Flip history (last 20 flips)</li>
            <li>Statistics with percentage and pie chart</li>
            <li>Smooth animations</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Click "Flip Coin" to start flipping!
        </p>
      </div>
    </div>
  );
};

export default VirtualCoinFlipper;