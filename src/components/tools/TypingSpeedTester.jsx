// components/TypingSpeedTester.js
'use client';

import React, { useState, useEffect } from 'react';

const TypingSpeedTester = () => {
  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "A journey of a thousand miles begins with a single step.",
    "To be or not to be, that is the question.",
    "The rain in Spain stays mainly in the plain.",
    "All that glitters is not gold."
  ];

  const [textToType, setTextToType] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Start or reset the test
  const startTest = () => {
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setTextToType(randomText);
    setUserInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(0);
    setIsTestActive(false);
    setTimeElapsed(0);
  };

  // Handle user input
  const handleInputChange = (e) => {
    const input = e.target.value;
    setUserInput(input);

    if (!isTestActive && input.length === 1) {
      setStartTime(Date.now());
      setIsTestActive(true);
    }

    if (input.length > 0 && isTestActive) {
      calculateStats(input);
    }
  };

  // Calculate WPM and accuracy
  const calculateStats = (input) => {
    const timeNow = Date.now();
    const timeInMinutes = (timeNow - startTime) / 60000; // Convert ms to minutes
    setTimeElapsed((timeNow - startTime) / 1000); // Seconds for display

    const wordsTyped = input.trim().split(/\s+/).length;
    const wpmCalc = Math.round(wordsTyped / timeInMinutes);
    setWpm(wpmCalc > 0 ? wpmCalc : 0);

    const correctChars = input.split('').reduce((acc, char, i) => 
      char === textToType[i] ? acc + 1 : acc, 0);
    const accuracyCalc = Math.round((correctChars / textToType.length) * 100);
    setAccuracy(accuracyCalc > 0 ? accuracyCalc : 0);
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTestActive) {
      interval = setInterval(() => {
        if (startTime) {
          setTimeElapsed((Date.now() - startTime) / 1000);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTestActive, startTime]);

  // Check if test is complete
  useEffect(() => {
    if (userInput === textToType && textToType !== '') {
      setIsTestActive(false);
    }
  }, [userInput, textToType]);

  // Initial setup
  useEffect(() => {
    startTest();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Typing Speed Tester</h1>

      <div className="space-y-6">
        {/* Text to Type */}
        <div>
          <p className="text-gray-700 mb-2">Type this text:</p>
          <div className="p-4 bg-gray-100 rounded-md text-sm font-mono">
            {textToType.split('').map((char, i) => (
              <span
                key={i}
                className={
                  i < userInput.length
                    ? userInput[i] === char
                      ? 'text-green-600'
                      : 'text-red-600'
                    : 'text-gray-600'
                }
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* User Input */}
        <div>
          <textarea
            value={userInput}
            onChange={handleInputChange}
            placeholder="Start typing here..."
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 min-h-[100px] font-mono"
            disabled={!textToType}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Words Per Minute</p>
            <p className="text-lg font-semibold text-blue-600">{wpm} WPM</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Accuracy</p>
            <p className="text-lg font-semibold text-blue-600">{accuracy}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Time Elapsed</p>
            <p className="text-lg font-semibold text-blue-600">{timeElapsed.toFixed(1)}s</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          <button
            onClick={startTest}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reset / New Text
          </button>
        </div>

        {/* Completion Message */}
        {userInput === textToType && textToType !== '' && (
          <p className="text-center text-green-600 font-medium">
            Great job! You've completed the text. Try a new one!
          </p>
        )}

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: WPM is calculated based on words typed over time. Accuracy is based on character matches.
        </p>
      </div>
    </div>
  );
};

export default TypingSpeedTester;