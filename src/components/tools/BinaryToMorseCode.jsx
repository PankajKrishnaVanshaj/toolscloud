'use client';

import React, { useState } from 'react';

const BinaryToMorseCode = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [morseOutput, setMorseOutput] = useState('');
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    unitDuration: 100, // ms
    wordSpace: 7,      // Units between words
    charSpace: 3,      // Units between characters
  });

  // Morse code mapping
  const morseCodeMap = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', ' ': '/', '.': '.-.-.-', ',': '--..--',
    '?': '..--..', '!': '-.-.--'
  };

  const binaryToText = (binary) => {
    if (!/^[01\s]+$/.test(binary)) {
      setError('Invalid binary input: Use only 0s, 1s, and spaces');
      return '';
    }

    const bytes = binary.split(' ');
    let text = '';
    for (const byte of bytes) {
      if (byte.length === 0) continue;
      const decimal = parseInt(byte, 2);
      if (decimal >= 0 && decimal <= 255) {
        text += String.fromCharCode(decimal);
      } else {
        setError(`Byte out of range: ${byte} (0-255)`);
        return '';
      }
    }
    return text;
  };

  const textToMorse = (text) => {
    return text.toUpperCase().split('').map(char => morseCodeMap[char] || '').join(' ');
  };

  const handleBinaryInput = (value) => {
    setBinaryInput(value);
    setError('');
    const text = binaryToText(value);
    if (text) {
      setTextInput(text);
      setMorseOutput(textToMorse(text));
    } else {
      setTextInput('');
      setMorseOutput('');
    }
  };

  const handleTextInput = (value) => {
    setTextInput(value);
    setError('');
    setMorseOutput(textToMorse(value));
    // Convert text back to binary (ASCII)
    const binary = value.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    setBinaryInput(binary);
  };

  const playMorseAudio = () => {
    if (!morseOutput) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    oscillator.frequency.value = 600; // Hz

    let time = audioContext.currentTime;
    const unit = settings.unitDuration / 1000; // Convert to seconds

    morseOutput.split(' ').forEach(symbol => {
      if (symbol === '/') {
        time += unit * settings.wordSpace;
      } else if (symbol) {
        symbol.split('').forEach(char => {
          gainNode.gain.setValueAtTime(1, time);
          if (char === '.') {
            time += unit;
          } else if (char === '-') {
            time += unit * 3;
          }
          gainNode.gain.setValueAtTime(0, time);
          time += unit; // Intra-character space
        });
        time += unit * (settings.charSpace - 1); // Inter-character space
      }
    });

    oscillator.start();
    oscillator.stop(time);
  };

  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Morse Code Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input (space-separated bytes)
              </label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => handleBinaryInput(e.target.value)}
                placeholder="e.g., 01001000 01100101 01101100 01101100 01101111"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Input
              </label>
              <input
                type="text"
                value={textInput}
                onChange={(e) => handleTextInput(e.target.value)}
                placeholder="e.g., HELLO"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Settings Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Audio Settings</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Duration (ms)
                </label>
                <input
                  type="number"
                  value={settings.unitDuration}
                  onChange={(e) => handleSettingsChange('unitDuration', e.target.value)}
                  min="50"
                  max="500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Word Space (units)
                </label>
                <input
                  type="number"
                  value={settings.wordSpace}
                  onChange={(e) => handleSettingsChange('wordSpace', e.target.value)}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Char Space (units)
                </label>
                <input
                  type="number"
                  value={settings.charSpace}
                  onChange={(e) => handleSettingsChange('charSpace', e.target.value)}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Output Section */}
          {morseOutput && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Morse Code Output:</h2>
              <div className="flex items-center gap-4">
                <p className="font-mono text-lg">{morseOutput}</p>
                <button
                  onClick={playMorseAudio}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Play Audio
                </button>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert binary (ASCII) to Morse code</li>
              <li>Bidirectional: Binary ↔ Text ↔ Morse</li>
              <li>Audio playback of Morse code</li>
              <li>Customizable timing settings</li>
              <li>Example: "01001000 01100101" → "HE" → ".... ."</li>
              <li>Separate bytes with spaces</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToMorseCode;