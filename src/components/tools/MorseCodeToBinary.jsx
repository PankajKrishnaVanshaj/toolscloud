'use client';

import React, { useState } from 'react';

const MorseCodeToBinary = () => {
  const [morseInput, setMorseInput] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [error, setError] = useState('');
  const [bitLength, setBitLength] = useState(8); // Default 8-bit binary
  const [playMorse, setPlayMorse] = useState(false);

  // Morse code dictionary
  const MORSE_TO_CHAR = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
    '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
    '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
    '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
    '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
    '--..': 'Z', '-----': '0', '.----': '1', '..---': '2', '...--': '3',
    '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8',
    '----.': '9', '.-.-.-': '.', '--..--': ',', '..--..': '?', '-.-.--': '!',
    '-....-': '-', '.-..-.': '"', '.----..': '[', '.----.-': ']',
    '-..-.': '/', '...-..-': '$', '.--.-.': '@', '-...-': '='
  };

  const CHAR_TO_MORSE = Object.fromEntries(
    Object.entries(MORSE_TO_CHAR).map(([k, v]) => [v, k])
  );

  // Morse to Binary mapping: . = 1, - = 11, space between letters = 00, space between words = 0000
  const morseToBinary = (morse) => {
    const morseWords = morse.trim().split(/\s{2,}/); // Split by 2+ spaces for words
    const binaryWords = morseWords.map(word => {
      const morseChars = word.split(' ');
      const binaryChars = morseChars.map(char => {
        if (!MORSE_TO_CHAR[char]) return null;
        return char.split('').map(symbol => symbol === '.' ? '1' : '11').join('00'); // 00 between symbols
      }).filter(Boolean);
      return binaryChars.join('00'); // 00 between letters
    });
    return binaryWords.join('0000'); // 0000 between words
  };

  const binaryToMorse = (binary) => {
    const binaryWords = binary.split('0000'); // Split words
    const morseWords = binaryWords.map(word => {
      const binaryChars = word.split(/(?<=^(?:1|11)(?:00(?:1|11))*)00/); // Split by letter separator
      const morseChars = binaryChars.filter(Boolean).map(char => {
        const symbols = char.match(/(1|11)/g);
        if (!symbols) return null;
        return symbols.map(bit => bit === '1' ? '.' : '-').join('');
      });
      return morseChars.filter(Boolean).join(' ');
    });
    return morseWords.join('  ');
  };

  const playMorseCode = (morse) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const dotDuration = 100; // ms
    let currentTime = audioContext.currentTime;

    morse.split('').forEach(symbol => {
      if (symbol === '.' || symbol === '-') {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, currentTime); // 600 Hz tone
        oscillator.connect(audioContext.destination);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + (symbol === '.' ? dotDuration : dotDuration * 3) / 1000);
        currentTime += (symbol === '.' ? dotDuration : dotDuration * 3) / 1000;
        currentTime += dotDuration / 1000; // Gap between symbols
      } else if (symbol === ' ') {
        currentTime += dotDuration * 3 / 1000; // Gap between letters or words
      }
    });

    setTimeout(() => audioContext.close(), currentTime * 1000);
  };

  const handleMorseInput = (value) => {
    setMorseInput(value);
    setError('');
    const cleanedInput = value.trim().replace(/\s+/g, ' ');
    if (!cleanedInput) {
      setBinaryOutput('');
      setTextOutput('');
      return;
    }

    const morseWords = cleanedInput.split('  ');
    const invalidChar = morseWords.some(word => 
      word.split(' ').some(char => !MORSE_TO_CHAR[char])
    );
    if (invalidChar) {
      setError('Invalid Morse code character');
      setBinaryOutput('');
      setTextOutput('');
      return;
    }

    const binary = morseToBinary(cleanedInput);
    const text = morseWords.map(word => 
      word.split(' ').map(char => MORSE_TO_CHAR[char] || '').join('')
    ).join(' ');
    setBinaryOutput(padBinary(binary, Math.ceil(binary.length / bitLength) * bitLength));
    setTextOutput(text);
  };

  const handleBinaryInput = (value) => {
    setBinaryOutput(value);
    setError('');
    if (!/^[01]+$/.test(value)) {
      setError('Invalid binary input');
      setMorseInput('');
      setTextOutput('');
      return;
    }

    const morse = binaryToMorse(value);
    const text = morse.split('  ').map(word => 
      word.split(' ').map(char => MORSE_TO_CHAR[char] || '').join('')
    ).join(' ');
    setMorseInput(morse);
    setTextOutput(text);
  };

  const padBinary = (binary, length) => {
    return binary.padStart(length, '0');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Morse Code to Binary Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Morse Code
              </label>
              <textarea
                value={morseInput}
                onChange={(e) => handleMorseInput(e.target.value)}
                placeholder="e.g., ... --- ... / .--"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Output
              </label>
              <textarea
                value={binaryOutput}
                onChange={(e) => handleBinaryInput(e.target.value)}
                placeholder="e.g., 1011001011"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 font-mono"
              />
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bit Length
                </label>
                <select
                  value={bitLength}
                  onChange={(e) => setBitLength(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={8}>8-bit</option>
                  <option value={16}>16-bit</option>
                  <option value={32}>32-bit</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setPlayMorse(true);
                  playMorseCode(morseInput);
                  setTimeout(() => setPlayMorse(false), morseInput.length * 400);
                }}
                disabled={!morseInput || playMorse}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              >
                {playMorse ? 'Playing...' : 'Play Morse'}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {textOutput && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Text:</span> {textOutput}</p>
                <p><span className="font-medium">Morse:</span> {morseInput}</p>
                <p><span className="font-medium">Binary:</span> {binaryOutput}</p>
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
              <li>Convert Morse code to binary and text</li>
              <li>Convert binary to Morse code and text</li>
              <li>Play Morse code as audio (dot = 1, dash = 11)</li>
              <li>Supports 8, 16, 32-bit binary padding</li>
              <li>Use space between letters, double space between words</li>
              <li>Example: ... --- ... (SOS) → 10101011001100</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default MorseCodeToBinary;