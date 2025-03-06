// components/TaskRandomizer.js
'use client';

import React, { useState } from 'react';

const TaskRandomizer = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [randomizedTasks, setRandomizedTasks] = useState([]);

  // Add a new task
  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask('');
    }
  };

  // Remove a task
  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // Randomize tasks
  const randomizeTasks = () => {
    const shuffled = [...tasks].sort(() => Math.random() - 0.5);
    setRandomizedTasks(shuffled);
  };

  // Clear all tasks
  const clearAll = () => {
    setTasks([]);
    setRandomizedTasks([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Task Randomizer</h1>

      {/* Task Input Form */}
      <form onSubmit={addTask} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter a task..."
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Task
          </button>
        </div>
      </form>

      {/* Task List */}
      {tasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Your Tasks</h2>
          <ul className="space-y-2">
            {tasks.map((task, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
              >
                <span>{task}</span>
                <button
                  onClick={() => removeTask(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Randomize Button */}
      {tasks.length > 1 && (
        <div className="flex justify-center mb-6">
          <button
            onClick={randomizeTasks}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Randomize Tasks
          </button>
        </div>
      )}

      {/* Randomized Result */}
      {randomizedTasks.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-center">Randomized Order</h2>
          <ol className="list-decimal list-inside space-y-2">
            {randomizedTasks.map((task, index) => (
              <li key={index} className="text-gray-700">{task}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Clear All Button */}
      {(tasks.length > 0 || randomizedTasks.length > 0) && (
        <div className="flex justify-center mt-6">
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Instructions */}
      {!tasks.length && !randomizedTasks.length && (
        <p className="text-center text-gray-500">
          Add some tasks above and click "Randomize Tasks" to get a random order!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Add at least 2 tasks to enable randomization.
      </p>
    </div>
  );
};

export default TaskRandomizer;