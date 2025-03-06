// components/KeyboardShortcutFinder.js
'use client';

import React, { useState } from 'react';

const KeyboardShortcutFinder = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState('all');

  // Sample shortcut data (expandable)
  const shortcuts = {
    windows: [
      { command: 'Copy', keys: 'Ctrl + C', description: 'Copy selected text or item' },
      { command: 'Paste', keys: 'Ctrl + V', description: 'Paste copied content' },
      { command: 'Cut', keys: 'Ctrl + X', description: 'Cut selected text or item' },
      { command: 'Undo', keys: 'Ctrl + Z', description: 'Undo last action' },
      { command: 'Task Manager', keys: 'Ctrl + Shift + Esc', description: 'Open Task Manager' },
    ],
    macos: [
      { command: 'Copy', keys: 'Cmd + C', description: 'Copy selected text or item' },
      { command: 'Paste', keys: 'Cmd + V', description: 'Paste copied content' },
      { command: 'Cut', keys: 'Cmd + X', description: 'Cut selected text or item' },
      { command: 'Undo', keys: 'Cmd + Z', description: 'Undo last action' },
      { command: 'Spotlight', keys: 'Cmd + Space', description: 'Open Spotlight search' },
    ],
    vscode: [
      { command: 'Find', keys: 'Ctrl + F / Cmd + F', description: 'Search within file' },
      { command: 'Replace', keys: 'Ctrl + H / Cmd + Opt + F', description: 'Replace text' },
      { command: 'Toggle Line Comment', keys: 'Ctrl + / / Cmd + /', description: 'Comment/uncomment line' },
      { command: 'Go to Line', keys: 'Ctrl + G / Cmd + G', description: 'Jump to specific line' },
    ],
    photoshop: [
      { command: 'New Layer', keys: 'Ctrl + Shift + N / Cmd + Shift + N', description: 'Create new layer' },
      { command: 'Free Transform', keys: 'Ctrl + T / Cmd + T', description: 'Transform selection' },
      { command: 'Brush Tool', keys: 'B', description: 'Select brush tool' },
    ],
  };

  const apps = [
    { value: 'all', label: 'All Applications' },
    { value: 'windows', label: 'Windows' },
    { value: 'macos', label: 'macOS' },
    { value: 'vscode', label: 'VS Code' },
    { value: 'photoshop', label: 'Photoshop' },
  ];

  // Filter shortcuts based on search term and selected app
  const filteredShortcuts = Object.entries(shortcuts)
    .filter(([app]) => selectedApp === 'all' || app === selectedApp)
    .flatMap(([, appShortcuts]) =>
      appShortcuts.filter(
        (shortcut) =>
          shortcut.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shortcut.keys.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shortcut.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Keyboard Shortcut Finder</h1>

      <div className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search shortcuts (e.g., 'copy', 'ctrl + c')"
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {apps.map((app) => (
              <option key={app.value} value={app.value}>
                {app.label}
              </option>
            ))}
          </select>
        </div>

        {/* Shortcut List */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredShortcuts.length > 0 ? (
            <div className="space-y-3">
              {filteredShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-md flex flex-col sm:flex-row sm:items-center gap-2"
                >
                  <span className="font-medium text-gray-800 sm:w-1/3">
                    {shortcut.command}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm sm:w-1/4">
                    {shortcut.keys}
                  </span>
                  <span className="text-gray-600 text-sm sm:w-1/2">
                    {shortcut.description}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No shortcuts found. Try a different search term or application.
            </p>
          )}
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 mt-4">
          Note: This is a sample set of shortcuts. More can be added to the database as needed.
        </p>
      </div>
    </div>
  );
};

export default KeyboardShortcutFinder;