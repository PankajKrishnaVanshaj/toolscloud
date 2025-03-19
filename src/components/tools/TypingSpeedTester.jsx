"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaRedo, FaPlay, FaPause, FaDownload } from "react-icons/fa";

const TypingSpeedTester = () => {
  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "A journey of a thousand miles begins with a single step.",
    "To be or not to be, that is the question.",
    "The rain in Spain stays mainly in the plain.",
    "All that glitters is not gold.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  ];

  const [textToType, setTextToType] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");
  const [testDuration, setTestDuration] = useState(60); // Default 1 minute
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  // Start or reset the test
  const startTest = useCallback(() => {
    const filteredTexts =
      difficulty === "easy"
        ? sampleTexts.filter((t) => t.length < 40)
        : difficulty === "hard"
        ? sampleTexts.filter((t) => t.length > 50)
        : sampleTexts;
    const randomText = filteredTexts[Math.floor(Math.random() * filteredTexts.length)];
    setTextToType(randomText);
    setUserInput("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(0);
    setIsTestActive(false);
    setIsPaused(false);
    setTimeElapsed(0);
    if (inputRef.current) inputRef.current.focus();
  }, [difficulty]);

  // Handle user input
  const handleInputChange = (e) => {
    if (isPaused || timeElapsed >= testDuration) return;

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
  const calculateStats = useCallback(
    (input) => {
      const timeNow = Date.now();
      const timeInMinutes = (timeNow - startTime) / 60000;
      setTimeElapsed((timeNow - startTime) / 1000);

      const wordsTyped = input.trim().split(/\s+/).length;
      const wpmCalc = Math.round(wordsTyped / timeInMinutes);
      setWpm(wpmCalc > 0 ? wpmCalc : 0);

      const correctChars = input.split("").reduce((acc, char, i) => {
        return char === textToType[i] ? acc + 1 : acc;
      }, 0);
      const accuracyCalc = Math.round((correctChars / textToType.length) * 100);
      setAccuracy(accuracyCalc > 0 ? accuracyCalc : 0);
    },
    [startTime, textToType]
  );

  // Timer and test completion
  useEffect(() => {
    let interval;
    if (isTestActive && !isPaused) {
      interval = setInterval(() => {
        if (startTime) {
          const elapsed = (Date.now() - startTime) / 1000;
          setTimeElapsed(elapsed);
          if (elapsed >= testDuration || userInput === textToType) {
            setIsTestActive(false);
            setHistory((prev) => [
              ...prev,
              { wpm, accuracy, time: elapsed, text: textToType, date: new Date() },
            ]);
          }
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTestActive, isPaused, startTime, testDuration, userInput, textToType, wpm, accuracy]);

  // Initial setup
  useEffect(() => {
    startTest();
  }, [startTest]);

  // Toggle pause
  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Download results
  const downloadResults = () => {
    const result = `Typing Test Result\n\nText: "${textToType}"\nWPM: ${wpm}\nAccuracy: ${accuracy}%\nTime: ${timeElapsed.toFixed(1)}s\nDate: ${new Date().toLocaleString()}`;
    const blob = new Blob([result], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `typing-test-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Typing Speed Tester
        </h1>

        <div className="space-y-6">
          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isTestActive}
              >
                <option value="easy">Easy (Short)</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard (Long)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Duration (s)
              </label>
              <select
                value={testDuration}
                onChange={(e) => setTestDuration(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isTestActive}
              >
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={120}>2 minutes</option>
              </select>
            </div>
          </div>

          {/* Text to Type */}
          <div>
            <p className="text-gray-700 mb-2">Type this text:</p>
            <div className="p-4 bg-gray-100 rounded-md text-sm font-mono whitespace-pre-wrap">
              {textToType.split("").map((char, i) => (
                <span
                  key={i}
                  className={
                    i < userInput.length
                      ? userInput[i] === char
                        ? "text-green-600"
                        : "text-red-600"
                      : "text-gray-600"
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
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              placeholder="Start typing here..."
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 min-h-[100px] font-mono resize-none"
              disabled={!textToType || timeElapsed >= testDuration}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Words Per Minute</p>
              <p className="text-lg font-semibold text-blue-600">{wpm} WPM</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-lg font-semibold text-blue-600">{accuracy}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time Remaining</p>
              <p className="text-lg font-semibold text-blue-600">
                {Math.max(0, testDuration - timeElapsed).toFixed(1)}s
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all"
              style={{ width: `${(timeElapsed / testDuration) * 100}%` }}
            ></div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={startTest}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaRedo className="mr-2" /> New Test
            </button>
            <button
              onClick={togglePause}
              disabled={!isTestActive || timeElapsed >= testDuration}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isPaused ? <FaPlay className="mr-2" /> : <FaPause className="mr-2" />}
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={downloadResults}
              disabled={!isTestActive && timeElapsed === 0}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Result
            </button>
          </div>

          {/* Completion Message */}
          {(userInput === textToType || timeElapsed >= testDuration) && textToType !== "" && (
            <p className="text-center text-green-600 font-medium">
              {userInput === textToType
                ? "Great job! You've completed the text!"
                : "Time's up! Test completed."}
            </p>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Test History</h3>
              <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index}>
                    {entry.date.toLocaleString()} - WPM: {entry.wpm}, Accuracy: {entry.accuracy}%
                    , Time: {entry.time.toFixed(1)}s - "{entry.text.substring(0, 30)}..."
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Adjustable difficulty and test duration</li>
              <li>Real-time WPM and accuracy tracking</li>
              <li>Pause/resume functionality</li>
              <li>Progress bar and time remaining</li>
              <li>Test history tracking</li>
              <li>Downloadable results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingSpeedTester;