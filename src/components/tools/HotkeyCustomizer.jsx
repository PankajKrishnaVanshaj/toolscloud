// components/HotkeyCustomizer.js
'use client';

import React, { useState, useEffect } from 'react';

const HotkeyCustomizer = () => {
  const [hotkeys, setHotkeys] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hotkeys');
      return saved ? JSON.parse(saved) : [
        { action: 'Save', keys: 'Ctrl + S', id: 1 },
        { action: 'Undo', keys: 'Ctrl + Z', id: 2 },
        { action: 'Redo', keys: 'Ctrl + Y', id: 3 },
      ];
    }
    return [];
  });
  const [recording, setRecording] = useState(null);
  const [lastPressed, setLastPressed] = useState('');

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hotkeys', JSON.stringify(hotkeys));
    }
  }, [hotkeys]);

  // Handle key recording
  const handleKeyDown = (e) => {
    if (recording !== null) {
      e.preventDefault();
      const keys = [];
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.altKey) keys.push('Alt');
      if (e.shiftKey) keys.push('Shift');
      if (e.key && !['Control', 'Alt', 'Shift'].includes(e.key)) {
        keys.push(e.key.toUpperCase());
      }
      
      const keyCombo = keys.join(' + ');
      if (keyCombo) {
        setHotkeys(prev =>
          prev.map(item =>
            item.id === recording ? { ...item, keys: keyCombo } : item
          )
        );
        setRecording(null);
      }
    }
  };

  // Test hotkeys
  useEffect(() => {
    const handleTestKeys = (e) => {
      const keys = [];
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.altKey) keys.push('Alt');
      if (e.shiftKey) keys.push('Shift');
      if (e.key && !['Control', 'Alt', 'Shift'].includes(e.key)) {
        keys.push(e.key.toUpperCase());
      }
      
      const keyCombo = keys.join(' + ');
      const matched = hotkeys.find(h => h.keys === keyCombo);
      if (matched) {
        setLastPressed(`${matched.action} (${matched.keys})`);
        setTimeout(() => setLastPressed(''), 2000);
      }
    };

    window.addEventListener('keydown', handleTestKeys);
    return () => window.removeEventListener('keydown', handleTestKeys);
  }, [hotkeys]);

  const startRecording = (id) => {
    setRecording(id);
  };

  const addHotkey = () => {
    const newId = Math.max(...hotkeys.map(h => h.id), 0) + 1;
    setHotkeys(prev => [...prev, { action: 'New Action', keys: 'None', id: newId }]);
  };

  const removeHotkey = (id) => {
    setHotkeys(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Hotkey Customizer</h1>

      <div className="space-y-4">
        {/* Hotkey List */}
        {hotkeys.map((hotkey) => (
          <div key={hotkey.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded-md">
            <input
              type="text"
              value={hotkey.action}
              onChange={(e) =>
                setHotkeys(prev =>
                  prev.map(h =>
                    h.id === hotkey.id ? { ...h, action: e.target.value } : h
                  )
                )
              }
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Action name"
            />
            <button
              onClick={() => startRecording(hotkey.id)}
              className={`px-4 py-2 rounded-md ${
                recording === hotkey.id
                  ? 'bg-yellow-500 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition-colors`}
            >
              {recording === hotkey.id ? 'Press Keys...' : hotkey.keys}
            </button>
            <button
              onClick={() => removeHotkey(hotkey.id)}
              className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              X
            </button>
          </div>
        ))}

        {/* Add New Hotkey */}
        <button
          onClick={addHotkey}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Add New Hotkey
        </button>

        {/* Last Pressed */}
        {lastPressed && (
          <div className="text-center text-green-600">
            Triggered: {lastPressed}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Instructions: Click a hotkey button to record a new combination. Test your hotkeys by pressing them.
        Changes are saved locally in your browser.
      </p>
      <p className="text-xs text-gray-500">
        Note: This is a demo tool. Actual implementation would depend on the specific application context.
      </p>
    </div>
  );
};

export default HotkeyCustomizer;