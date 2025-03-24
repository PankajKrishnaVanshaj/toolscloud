"use client";
import React, { useState, useCallback } from "react";
import { FaSearch, FaDownload, FaSync } from "react-icons/fa";

const KeyboardShortcutFinder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState("all");
  const [sortBy, setSortBy] = useState("command"); // Sort options: command, keys
  const [favorites, setFavorites] = useState([]); // Favorite shortcuts

  // Expanded shortcut data
  const shortcuts = {
    windows: [
      { command: "Copy", keys: "Ctrl + C", description: "Copy selected text or item" },
      { command: "Paste", keys: "Ctrl + V", description: "Paste copied content" },
      { command: "Cut", keys: "Ctrl + X", description: "Cut selected text or item" },
      { command: "Undo", keys: "Ctrl + Z", description: "Undo last action" },
      { command: "Task Manager", keys: "Ctrl + Shift + Esc", description: "Open Task Manager" },
      { command: "Switch Window", keys: "Alt + Tab", description: "Switch between open windows" },
    ],
    macos: [
      { command: "Copy", keys: "Cmd + C", description: "Copy selected text or item" },
      { command: "Paste", keys: "Cmd + V", description: "Paste copied content" },
      { command: "Cut", keys: "Cmd + X", description: "Cut selected text or item" },
      { command: "Undo", keys: "Cmd + Z", description: "Undo last action" },
      { command: "Spotlight", keys: "Cmd + Space", description: "Open Spotlight search" },
      { command: "Force Quit", keys: "Cmd + Option + Esc", description: "Open Force Quit menu" },
    ],
    vscode: [
      { command: "Find", keys: "Ctrl + F / Cmd + F", description: "Search within file" },
      { command: "Replace", keys: "Ctrl + H / Cmd + Opt + F", description: "Replace text" },
      { command: "Toggle Line Comment", keys: "Ctrl + / / Cmd + /", description: "Comment/uncomment line" },
      { command: "Go to Line", keys: "Ctrl + G / Cmd + G", description: "Jump to specific line" },
      { command: "Open Terminal", keys: "Ctrl + ` / Cmd + `", description: "Toggle integrated terminal" },
    ],
    photoshop: [
      { command: "New Layer", keys: "Ctrl + Shift + N / Cmd + Shift + N", description: "Create new layer" },
      { command: "Free Transform", keys: "Ctrl + T / Cmd + T", description: "Transform selection" },
      { command: "Brush Tool", keys: "B", description: "Select brush tool" },
      { command: "Zoom In", keys: "Ctrl + + / Cmd + +", description: "Zoom into canvas" },
      { command: "Zoom Out", keys: "Ctrl + - / Cmd + -", description: "Zoom out of canvas" },
    ],
  };

  const apps = [
    { value: "all", label: "All Applications" },
    { value: "windows", label: "Windows" },
    { value: "macos", label: "macOS" },
    { value: "vscode", label: "VS Code" },
    { value: "photoshop", label: "Photoshop" },
  ];

  // Filter and sort shortcuts
  const filteredShortcuts = Object.entries(shortcuts)
    .filter(([app]) => selectedApp === "all" || app === selectedApp)
    .flatMap(([, appShortcuts]) =>
      appShortcuts.filter(
        (shortcut) =>
          shortcut.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shortcut.keys.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shortcut.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortBy === "command") return a.command.localeCompare(b.command);
      if (sortBy === "keys") return a.keys.localeCompare(b.keys);
      return 0;
    });

  // Toggle favorite status
  const toggleFavorite = (shortcut) => {
    setFavorites((prev) =>
      prev.some((fav) => fav.command === shortcut.command && fav.keys === shortcut.keys)
        ? prev.filter((fav) => !(fav.command === shortcut.command && fav.keys === shortcut.keys))
        : [...prev, shortcut]
    );
  };

  // Download shortcuts as text file
  const downloadShortcuts = () => {
    const textContent = filteredShortcuts
      .map((s) => `${s.command}: ${s.keys} - ${s.description}`)
      .join("\n");
    const blob = new Blob([textContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shortcuts-${selectedApp}-${Date.now()}.txt`;
    link.click();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedApp("all");
    setSortBy("command");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Keyboard Shortcut Finder
        </h1>

        {/* Search and Filter Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search shortcuts (e.g., 'copy', 'ctrl + c')"
                  className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application</label>
              <select
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {apps.map((app) => (
                  <option key={app.value} value={app.value}>
                    {app.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="command">Command</option>
                <option value="keys">Keys</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={downloadShortcuts}
              disabled={filteredShortcuts.length === 0}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download List
            </button>
            <button
              onClick={resetFilters}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset Filters
            </button>
          </div>

          {/* Shortcut List */}
          <div className="max-h-[50vh] overflow-y-auto border rounded-lg p-4 bg-gray-50">
            {filteredShortcuts.length > 0 ? (
              <div className="space-y-3">
                {filteredShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-md shadow-sm flex flex-col sm:flex-row sm:items-center gap-2 transition-all hover:bg-gray-100"
                  >
                    <button
                      onClick={() => toggleFavorite(shortcut)}
                      className="text-yellow-500 hover:text-yellow-600 mr-2"
                    >
                      {favorites.some(
                        (fav) => fav.command === shortcut.command && fav.keys === shortcut.keys
                      ) ? (
                        "★"
                      ) : (
                        "☆"
                      )}
                    </button>
                    <span className="font-medium text-gray-800 sm:w-1/4">{shortcut.command}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm sm:w-1/4">
                      {shortcut.keys}
                    </span>
                    <span className="text-gray-600 text-sm sm:w-1/2">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No shortcuts found. Try a different search term or application.
              </p>
            )}
          </div>

          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-700 mb-2">Favorite Shortcuts</h3>
              <div className="space-y-2">
                {favorites.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-yellow-600"
                  >
                    <span className="sm:w-1/4">{shortcut.command}</span>
                    <span className="sm:w-1/4">{shortcut.keys}</span>
                    <span className="sm:w-1/2">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Search by command, keys, or description</li>
              <li>Filter by application</li>
              <li>Sort by command or keys</li>
              <li>Add shortcuts to favorites</li>
              <li>Download shortcut list as text file</li>
            </ul>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 mt-4">
            Note: This is an expandable set of shortcuts. Add more to the `shortcuts` object as needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutFinder;