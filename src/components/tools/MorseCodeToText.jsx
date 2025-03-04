'use client';

import React, { useState } from 'react';

const MorseCodeToText = () => {
  const [morseInput, setMorseInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [morseOutput, setMorseOutput] = useState('');
  const [separator, setSeparator] = useState(' / ');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Morse code dictionary
  const morseDictionary = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', ' ': '/',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '&': '.-...',
    "'": '.----.', '@': '.--.-.', '(': '-.--.', ')': '-.--.-', ':': '---...',
    '=': '-...-', '+': '.-.-.', '-': '-....-', '"': '.-..-.', '/': '-..-.'
  };

  const reverseMorseDictionary = Object.fromEntries(
    Object.entries(morseDictionary).map(([key, value]) => [value, key])
  );

  const textToMorse = (text) => {
    setError('');
    const upperText = text.toUpperCase();
    const morseWords = upperText.split(' ').map(word => {
      const morseChars = word.split('').map(char => {
        return morseDictionary[char] || '';
      }).filter(Boolean);
      return morseChars.length ? morseChars.join(' ') : '';
    }).filter(Boolean);

    if (morseWords.length === 0) {
      setError('Invalid text input: contains no valid characters');
      return '';
    }

    const result = morseWords.join(separator);
    setHistory(prev => [...prev, { text: text, morse: result }].slice(-10));
    return result;
  };

  const morseToText = (morse) => {
    setError('');
    const cleanedMorse = morse.trim();
    if (!cleanedMorse) {
      setError('Morse code input is empty');
      return '';
    }

    const words = cleanedMorse.split(separator).map(word => {
      const chars = word.split(' ').map(char => {
        return reverseMorseDictionary[char] || '';
      }).filter(Boolean);
      return chars.join('');
    });

    if (words.every(word => word === '')) {
      setError('Invalid Morse code: no valid characters found');
      return '';
    }

    const result = words.join(' ');
    setHistory(prev => [...prev, { morse: morse, text: result }].slice(-10));
    return result;
  };

  const handleMorseInput = (value) => {
    setMorseInput(value);
    const text = morseToText(value);
    setTextOutput(text);
  };

  const handleTextInput = (value) => {
    setTextInput(value);
    const morse = textToMorse(value);
    setMorseOutput(morse);
  };

  const playMorseAudio = () => {
    if (!morseOutput && !morseInput) return;

    const morseToPlay = morseOutput || morseInput;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 600; // Frequency in Hz
    oscillator.type = 'sine';

    let time = audioContext.currentTime;
    const dotDuration = 0.1; // Duration of a dot in seconds
    const dashDuration = dotDuration * 3;
    const spaceDuration = dotDuration;

    morseToPlay.split('').forEach(char => {
      if (char === '.') {
        oscillator.start(time);
        oscillator.stop(time + dotDuration);
        time += dotDuration + spaceDuration;
      } else if (char === '-') {
        oscillator.start(time);
        oscillator.stop(time + dashDuration);
        time += dashDuration + spaceDuration;
      } else if (char === ' ' || char === '/') {
        time += dashDuration; // Space between words or characters
      }
    });

    oscillator.onended = () => audioContext.close();
    oscillator.start();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Morse Code Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Morse Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={morseInput}
                  onChange={(e) => handleMorseInput(e.target.value)}
                  placeholder="e.g., ... --- ... / ... --- ..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={playMorseAudio}
                  disabled={!audioEnabled || (!morseInput && !morseOutput)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                  Play
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">{textOutput || 'Enter Morse code to see text'}</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text
              </label>
              <input
                type="text"
                value={textInput}
                onChange={(e) => handleTextInput(e.target.value)}
                placeholder="e.g., SOS"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-sm text-gray-600">{morseOutput || 'Enter text to see Morse code'}</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Word Separator
              </label>
              <input
                type="text"
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                placeholder="e.g., /"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={audioEnabled}
                onChange={(e) => setAudioEnabled(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              Enable Audio Playback
            </label>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Conversion History (Last 10):</h2>
              <div className="space-y-2 text-sm max-h-40 overflow-auto">
                {history.map((entry, index) => (
                  <div key={index} className="p-2 bg-gray-100 rounded">
                    <p>Text: {entry.text}</p>
                    <p>Morse: {entry.morse}</p>
                  </div>
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
              <li>Audio playback of Morse code (dot: 0.1s, dash: 0.3s)</li>
              <li>Customizable word separator</li>
              <li>Supports letters, numbers, and common punctuation</li>
              <li>History of last 10 conversions</li>
              <li>Example: SOS = ... --- ... / ... --- ...</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default MorseCodeToText;