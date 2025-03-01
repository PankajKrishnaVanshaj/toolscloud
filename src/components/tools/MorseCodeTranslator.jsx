"use client";

import React, { useState } from 'react';

const MorseCodeTranslator = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('textToMorse'); // 'textToMorse' or 'morseToText'
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Morse code mapping
  const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', ' ': '/', '.': '.-.-.-', ',': '--..--',
    '?': '..--..', '!': '-.-.--'
  };

  const reverseMorseCode = Object.fromEntries(
    Object.entries(morseCode).map(([key, value]) => [value, key])
  );

  const textToMorse = (text) => {
    return text
      .toUpperCase()
      .split('')
      .map(char => morseCode[char] || '')
      .join(' ')
      .trim();
  };

  const morseToText = (morse) => {
    const words = morse.split(' / ');
    return words
      .map(word => 
        word.split(' ')
          .map(code => reverseMorseCode[code] || '')
          .join('')
      )
      .join(' ')
      .trim();
  };

  const processText = () => {
    setError(null);
    setOutputText('');
    setCopied(false);

    if (!inputText.trim()) {
      setError('Please enter some text or Morse code');
      return;
    }

    try {
      const result = mode === 'textToMorse' 
        ? textToMorse(inputText) 
        : morseToText(inputText);
      if (!result) {
        throw new Error('Invalid input for selected mode');
      }
      setOutputText(result);
    } catch (err) {
      setError('Error processing input: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processText();
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Reference table for common characters
  const morseTable = Object.entries(morseCode).slice(0, 10); // Limited to 10 for brevity

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Morse Code Translator</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input {mode === 'textToMorse' ? 'Text' : 'Morse Code'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={mode === 'textToMorse' 
                ? 'HELLO WORLD' 
                : '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'}
            />
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="textToMorse">Text to Morse</option>
                <option value="morseToText">Morse to Text</option>
              </select>
            </div>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Translate
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Output */}
        {outputText && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">
                {mode === 'textToMorse' ? 'Morse Code Output' : 'Text Output'}
              </h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
              {outputText}
            </pre>
          </div>
        )}

        {/* Morse Code Reference Table */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Morse Code Reference (Sample)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Character</th>
                  <th className="px-4 py-2">Morse Code</th>
                </tr>
              </thead>
              <tbody>
                {morseTable.map(([char, code], index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 font-mono">{char}</td>
                    <td className="px-4 py-2 font-mono">{code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Use space between letters and '/' between words. Case-insensitive for text input.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MorseCodeTranslator;