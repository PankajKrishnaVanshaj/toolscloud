"use client";

import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaRandom, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const TaskRandomizer = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [randomizedTasks, setRandomizedTasks] = useState([]);
  const [randomizeCount, setRandomizeCount] = useState(1); // Number of times to randomize
  const [history, setHistory] = useState([]); // Randomization history
  const containerRef = React.useRef(null);

  // Add a new task
  const addTask = useCallback((e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks((prev) => [...prev, newTask.trim()]);
      setNewTask("");
    }
  }, [newTask]);

  // Remove a task
  const removeTask = (index) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
    setRandomizedTasks([]);
    setHistory([]);
  };

  // Randomize tasks
  const randomizeTasks = useCallback(() => {
    let currentTasks = [...tasks];
    const newHistoryEntry = [];

    for (let i = 0; i < randomizeCount; i++) {
      const shuffled = [...currentTasks].sort(() => Math.random() - 0.5);
      newHistoryEntry.push(shuffled);
      currentTasks = shuffled; // Use the last shuffle as the base for the next
    }

    setRandomizedTasks(newHistoryEntry[newHistoryEntry.length - 1]);
    setHistory((prev) => [...prev, newHistoryEntry].slice(-5)); // Keep last 5 histories
  }, [tasks, randomizeCount]);

  // Clear all tasks and reset
  const clearAll = () => {
    setTasks([]);
    setRandomizedTasks([]);
    setHistory([]);
    setRandomizeCount(1);
    setNewTask("");
  };

  // Download the randomized list as an image
  const downloadResult = () => {
    if (containerRef.current && randomizedTasks.length > 0) {
      html2canvas(containerRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `randomized-tasks-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Task Randomizer
        </h1>

        {/* Task Input Form */}
        <form onSubmit={addTask} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter a task..."
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add Task
            </button>
          </div>
        </form>

        {/* Task List */}
        {tasks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Your Tasks</h2>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {tasks.map((task, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-md shadow-sm"
                >
                  <span className="text-gray-800">{task}</span>
                  <button
                    onClick={() => removeTask(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Randomization Settings */}
        {tasks.length > 1 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Randomization Rounds ({randomizeCount})
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={randomizeCount}
                  onChange={(e) => setRandomizeCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of times to shuffle the list
                </p>
              </div>
              <div className="flex items-center justify-center">
                <button
                  onClick={randomizeTasks}
                  className="w-full px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaRandom className="mr-2" /> Randomize
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Randomized Result */}
        {randomizedTasks.length > 0 && (
          <div ref={containerRef} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">
              Randomized Order
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              {randomizedTasks.map((task, index) => (
                <li key={index} className="text-gray-700">{task}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        {(tasks.length > 0 || randomizedTasks.length > 0) && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={downloadResult}
              disabled={randomizedTasks.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Result
            </button>
            <button
              onClick={clearAll}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear All
            </button>
          </div>
        )}

        {/* Randomization History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">Randomization History</h2>
            <div className="max-h-48 overflow-y-auto space-y-4">
              {history.slice().reverse().map((entry, idx) => (
                <div key={idx} className="bg-white p-2 rounded-md shadow-sm">
                  <p className="text-sm text-blue-600 font-medium">
                    Attempt #{history.length - idx}
                  </p>
                  <ol className="list-decimal list-inside text-sm text-blue-500">
                    {entry[entry.length - 1].map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!tasks.length && !randomizedTasks.length && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Add some tasks above and click "Randomize" to get a random order!
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Add and remove tasks easily</li>
            <li>Customizable number of randomization rounds</li>
            <li>View randomization history (last 5 attempts)</li>
            <li>Download randomized list as PNG</li>
            <li>Clear all tasks and reset</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Add at least 2 tasks to enable randomization.
        </p>
      </div>
    </div>
  );
};

export default TaskRandomizer;