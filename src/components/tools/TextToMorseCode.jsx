'use client';

import React, { useState, useRef } from 'react';

const TextToMorseCode = () => {
  const [text, setText] = useState('');
  const [morseCode, setMorseCode] = useState('');
  const [error, setError] = useState('');
  const [speed, setSpeed] = useState(20); // Words per minute (WPM)
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);

  // Morse code dictionary
  const morseDict = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
    'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
    'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
    'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
    'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', ' ': '/', '.': '.-.-.-', ',': '--..--', '?': '..--..',
    '!': '-.-.--', '&': '.-...',
  };

  // Reverse dictionary for Morse to text conversion
  const reverseMorseDict = Object.fromEntries(
    Object.entries(morseDict).map(([key, value]) => [value, key])
  );

  const convertToMorse = (input) => {
    setError('');
    const upperText = input.toUpperCase();
    let result = '';
    for (const char of upperText) {
      if (morseDict[char]) {
        result += morseDict[char] + ' ';
      } else if (char !== ' ') {
        setError(`Unsupported character: ${char}`);
        return '';
      }
    }
    return result.trim();
  };

  const convertToText = (morse) => {
    setError('');
    const morseWords = morse.trim().split(' / ');
    let result = '';
    for (const word of morseWords) {
      const morseChars = word.split(' ');
      for (const char of morseChars) {
        if (reverseMorseDict[char]) {
          result += reverseMorseDict[char];
        } else if (char !== '') {
          setError(`Invalid Morse code sequence: ${char}`);
          return '';
        }
      }
      result += ' ';
    }
    return result.trim();
  };

  const handleTextChange = (value) => {
    setText(value);
    const morse = convertToMorse(value);
    setMorseCode(morse);
  };

  const handleMorseChange = (value) => {
    setMorseCode(value);
    const text = convertToText(value);
    setText(text);
  };

  // Audio generation for Morse code
  const playMorseCode = () => {
    if (!morseCode || isPlaying) return;

    setIsPlaying(true);
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;

    const unitTime = 1200 / speed; // Unit time in ms based on WPM (PARIS standard)
    const frequency = 600; // Hz
    let currentTime = audioContext.currentTime;

    const playSignal = (duration) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.5;
      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration / 1000);
      currentTime += duration / 1000;
      currentTime += unitTime / 1000; // Gap between signals
    };

    morseCode.split('').forEach(char => {
      if (char === '.') {
        playSignal(unitTime); // Dot
      } else if (char === '-') {
        playSignal(unitTime * 3); // Dash
      } else if (char === ' ') {
        currentTime += unitTime * 2 / 1000; // Space between letters (total 3 units, 1 already added)
      } else if (char === '/') {
        currentTime += unitTime * 6 / 1000; // Space between words (total 7 units, 1 already added)
      }
    });

    setTimeout(() => {
      audioContext.close();
      setIsPlaying(false);
    }, (currentTime - audioContext.currentTime) * 1000 + 100);
  };

  const stopMorseCode = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Text to Morse Code Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text
              </label>
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter text (e.g., HELLO WORLD)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Morse Code
              </label>
              <textarea
                value={morseCode}
                onChange={(e) => handleMorseChange(e.target.value)}
                placeholder="Enter Morse code (e.g., .... . .-.. .-.. --- / .-- --- .-. .-.. -..)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 font-mono"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speed (WPM)
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{speed} WPM</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={playMorseCode}
                  disabled={isPlaying || !morseCode}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
                >
                  Play
                </button>
                <button
                  onClick={stopMorseCode}
                  disabled={!isPlaying}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Visualization Section */}
          {morseCode && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Visualization:</h2>
              <div className="flex flex-wrap gap-1 font-mono text-sm">
                {morseCode.split('').map((char, index) => (
                  <span key={index} className={
                    char === '.' ? 'w-2 h-2 bg-black rounded-full' :
                    char === '-' ? 'w-6 h-2 bg-black rounded' :
                    char === ' ' ? 'w-2 h-2' :
                    char === '/' ? 'w-4 h-2' : ''
                  }></span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert text to Morse code and vice versa</li>
              <li>Play Morse code as audio (600 Hz)</li>
              <li>Adjustable speed (5-40 WPM)</li>
              <li>Visual representation of dots and dashes</li>
              <li>Supports letters, numbers, and basic punctuation</li>
              <li>Morse format: Space between letters, / between words</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TextToMorseCode;