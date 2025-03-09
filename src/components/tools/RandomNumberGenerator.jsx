"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const RandomNumberGenerator = () => {
  const [numbers, setNumbers] = useState([]);
  const [history, setHistory] = useState([]);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [sortOrder, setSortOrder] = useState("none");
  const [unique, setUnique] = useState(false);
  const [filter, setFilter] = useState("all");
  const [separator, setSeparator] = useState(", ");
  const [showAlert, setShowAlert] = useState(false);

  const generateNumbers = useCallback(() => {
    if (min >= max) {
      alert("Min should be less than Max.");
      return;
    }
    if (count < 1 || count > 1000) {
      alert("Count must be between 1 and 1000.");
      return;
    }

    let newNumbers = [];
    if (unique) {
      const rangeSize = max - min + 1;
      if (count > rangeSize) {
        alert(`Cannot generate ${count} unique numbers in range ${min} to ${max}.`);
        return;
      }
      const availableNumbers = Array.from({ length: rangeSize }, (_, i) => i + min);
      newNumbers = availableNumbers
        .sort(() => 0.5 - Math.random())
        .slice(0, count);
    } else {
      newNumbers = Array.from(
        { length: count },
        () => Math.floor(Math.random() * (max - min + 1)) + min
      );
    }

    // Apply filter
    if (filter === "even") newNumbers = newNumbers.filter((num) => num % 2 === 0);
    if (filter === "odd") newNumbers = newNumbers.filter((num) => num % 2 !== 0);
    if (filter === "prime") {
      newNumbers = newNumbers.filter((num) => {
        if (num < 2) return false;
        for (let i = 2; i <= Math.sqrt(num); i++) {
          if (num % i === 0) return false;
        }
        return true;
      });
    }

    // Apply sorting
    if (sortOrder === "asc") newNumbers.sort((a, b) => a - b);
    if (sortOrder === "desc") newNumbers.sort((a, b) => b - a);

    setNumbers(newNumbers);
    setHistory((prev) => [
      ...prev,
      { numbers: newNumbers, options: { min, max, count, sortOrder, unique, filter, separator } },
    ].slice(-5));
  }, [min, max, count, sortOrder, unique, filter]);

  const reset = () => {
    setNumbers([]);
    setHistory([]);
    setMin(1);
    setMax(100);
    setCount(1);
    setSortOrder("none");
    setUnique(false);
    setFilter("all");
    setSeparator(", ");
  };

  const copyToClipboard = () => {
    const text = numbers.join(separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = numbers.join(separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `numbers-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreFromHistory = (entry) => {
    setNumbers(entry.numbers);
    setMin(entry.options.min);
    setMax(entry.options.max);
    setCount(entry.options.count);
    setSortOrder(entry.options.sortOrder);
    setUnique(entry.options.unique);
    setFilter(entry.options.filter);
    setSeparator(entry.options.separator);
  };

  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const average = numbers.length ? (sum / numbers.length).toFixed(2) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        {/* Alert Notification */}
        {showAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Numbers copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Random Number Generator
        </h1>

        {/* Summary Row */}
        <p className="mb-4 text-gray-700 text-center font-medium">
          Min: {min} | Max: {max} | Count: {count}
        </p>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Value:</label>
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(Number(e.target.value) || 1)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Value:</label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(Number(e.target.value) || 100)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Count (1-1000):</label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Count"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">No Sorting</option>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Numbers</option>
                <option value="even">Even Only</option>
                <option value="odd">Odd Only</option>
                <option value="prime">Prime Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Separator:</label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value=", ">Comma (, )</option>
                <option value=" ">Space</option>
                <option value="\n">Newline</option>
                <option value="; ">Semicolon (; )</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={unique}
                onChange={() => setUnique(!unique)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Unique Values</label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateNumbers}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Numbers
            </button>
            {numbers.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaCopy className="mr-2" />
                  Copy
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
              </>
            )}
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaTrash className="mr-2" />
              Reset
            </button>
          </div>
        </div>

        {/* Generated Numbers */}
        {numbers.length > 0 && (
          <div className="mt-6 bg-blue-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Generated Numbers ({numbers.length}):
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {numbers.map((num, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                >
                  {num}
                </span>
              ))}
            </div>
            <p className="text-gray-700 font-medium">
              Sum: {sum} | Average: {average}
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Generations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.numbers.length} numbers (Min: {entry.options.min}, Max: {entry.options.max})
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Generate unique or repeated numbers</li>
            <li>Filter by all, even, odd, or prime numbers</li>
            <li>Sort in ascending or descending order</li>
            <li>Custom separators for output</li>
            <li>Copy, download, and track history</li>
          </ul>
        </div>
      </div>

      {/* Tailwind Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default RandomNumberGenerator;