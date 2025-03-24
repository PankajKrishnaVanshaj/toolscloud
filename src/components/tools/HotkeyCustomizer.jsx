"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaTrash, FaSave, FaUndo } from "react-icons/fa";

const HotkeyCustomizer = () => {
  const [hotkeys, setHotkeys] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hotkeys");
      return saved
        ? JSON.parse(saved)
        : [
            { action: "Save", keys: "Ctrl + S", id: 1, category: "File" },
            { action: "Undo", keys: "Ctrl + Z", id: 2, category: "Edit" },
            { action: "Redo", keys: "Ctrl + Y", id: 3, category: "Edit" },
          ];
    }
    return [];
  });
  const [recording, setRecording] = useState(null);
  const [lastPressed, setLastPressed] = useState("");
  const [categories, setCategories] = useState(["File", "Edit", "View"]);
  const [newCategory, setNewCategory] = useState("");

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hotkeys", JSON.stringify(hotkeys));
    }
  }, [hotkeys]);

  // Handle key recording
  const handleKeyDown = useCallback(
    (e) => {
      if (recording !== null) {
        e.preventDefault();
        const keys = [];
        if (e.ctrlKey) keys.push("Ctrl");
        if (e.altKey) keys.push("Alt");
        if (e.shiftKey) keys.push("Shift");
        if (e.key && !["Control", "Alt", "Shift"].includes(e.key)) {
          keys.push(e.key.toUpperCase());
        }

        const keyCombo = keys.join(" + ");
        if (keyCombo) {
          // Check for duplicates
          if (hotkeys.some((h) => h.keys === keyCombo && h.id !== recording)) {
            alert("This key combination is already in use!");
            return;
          }
          setHotkeys((prev) =>
            prev.map((item) =>
              item.id === recording ? { ...item, keys: keyCombo } : item
            )
          );
          setRecording(null);
        }
      }
    },
    [recording, hotkeys]
  );

  // Test hotkeys globally
  useEffect(() => {
    const handleTestKeys = (e) => {
      const keys = [];
      if (e.ctrlKey) keys.push("Ctrl");
      if (e.altKey) keys.push("Alt");
      if (e.shiftKey) keys.push("Shift");
      if (e.key && !["Control", "Alt", "Shift"].includes(e.key)) {
        keys.push(e.key.toUpperCase());
      }

      const keyCombo = keys.join(" + ");
      const matched = hotkeys.find((h) => h.keys === keyCombo);
      if (matched) {
        setLastPressed(`${matched.action} (${matched.keys})`);
        setTimeout(() => setLastPressed(""), 2000);
      }
    };

    window.addEventListener("keydown", handleTestKeys);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleTestKeys);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hotkeys, handleKeyDown]);

  const startRecording = (id) => {
    setRecording(id);
  };

  const addHotkey = () => {
    const newId = Math.max(...hotkeys.map((h) => h.id), 0) + 1;
    setHotkeys((prev) => [
      ...prev,
      { action: "New Action", keys: "None", id: newId, category: categories[0] },
    ]);
  };

  const removeHotkey = (id) => {
    setHotkeys((prev) => prev.filter((h) => h.id !== id));
  };

  const resetToDefault = () => {
    setHotkeys([
      { action: "Save", keys: "Ctrl + S", id: 1, category: "File" },
      { action: "Undo", keys: "Ctrl + Z", id: 2, category: "Edit" },
      { action: "Redo", keys: "Ctrl + Y", id: 3, category: "Edit" },
    ]);
    setRecording(null);
    setLastPressed("");
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
      setNewCategory("");
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Hotkey Customizer
        </h1>

        {/* Hotkey List */}
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">{category}</h2>
              <div className="space-y-4">
                {hotkeys
                  .filter((h) => h.category === category)
                  .map((hotkey) => (
                    <div
                      key={hotkey.id}
                      className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <input
                        type="text"
                        value={hotkey.action}
                        onChange={(e) =>
                          setHotkeys((prev) =>
                            prev.map((h) =>
                              h.id === hotkey.id ? { ...h, action: e.target.value } : h
                            )
                          )
                        }
                        className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Action name"
                      />
                      <select
                        value={hotkey.category}
                        onChange={(e) =>
                          setHotkeys((prev) =>
                            prev.map((h) =>
                              h.id === hotkey.id ? { ...h, category: e.target.value } : h
                            )
                          )
                        }
                        className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => startRecording(hotkey.id)}
                        className={`w-full sm:w-auto px-4 py-2 rounded-md ${
                          recording === hotkey.id
                            ? "bg-yellow-500 text-white animate-pulse"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        } transition-colors`}
                      >
                        {recording === hotkey.id ? "Press Keys..." : hotkey.keys}
                      </button>
                      <button
                        onClick={() => removeHotkey(hotkey.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Hotkey and Category */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={addHotkey}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FaPlus className="mr-2" /> Add Hotkey
          </button>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New Category"
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addCategory}
              disabled={!newCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={resetToDefault}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaUndo className="mr-2" /> Reset to Default
          </button>
          <button
            onClick={() => localStorage.setItem("hotkeys", JSON.stringify(hotkeys))}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaSave className="mr-2" /> Save Changes
          </button>
        </div>

        {/* Last Pressed */}
        {lastPressed && (
          <div className="mt-4 text-center text-green-600 bg-green-50 p-2 rounded-lg">
            Triggered: {lastPressed}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Instructions</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Click a hotkey button to record a new combination</li>
            <li>Test hotkeys by pressing them anywhere in the window</li>
            <li>Organize hotkeys by category</li>
            <li>Changes are auto-saved to your browser's local storage</li>
            <li>Use "Reset to Default" to revert to initial settings</li>
          </ul>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: This is a demo tool. In a real application, hotkeys would trigger specific actions
          based on context.
        </p>
      </div>
    </div>
  );
};

export default HotkeyCustomizer;