"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const RandomPasswordHintGenerator = () => {
  const [passwordData, setPasswordData] = useState(null);
  const [length, setLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(true);
  const [hintStyle, setHintStyle] = useState("phrase");

  // Word lists for hints
  const animals = ["Tiger", "Eagle", "Whale", "Fox", "Bear", "Wolf", "Owl", "Panther", "Deer"];
  const colors = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink", "Silver", "Gold"];
  const objects = ["Star", "River", "Mountain", "Cloud", "Tree", "Stone", "Flame", "Moon", "Lake"];
  const actions = ["Runs", "Flies", "Swims", "Jumps", "Climbs", "Dances", "Sings", "Shines", "Soars"];
  const adjectives = ["Swift", "Bright", "Silent", "Mighty", "Gentle", "Fierce", "Calm", "Bold", "Wise"];

  // Generate password and hint
  const generatePasswordAndHint = useCallback(() => {
    // Generate hint based on style
    let hint;
    if (hintStyle === "phrase") {
      const animal = animals[Math.floor(Math.random() * animals.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const object = objects[Math.floor(Math.random() * objects.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      hint = `${color} ${animal} ${action} ${object}`;
    } else if (hintStyle === "sentence") {
      const animal = animals[Math.floor(Math.random() * animals.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const object = objects[Math.floor(Math.random() * objects.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      hint = `The ${adjective} ${color} ${animal} ${action} over the ${object}.`;
    } else {
      const animal = animals[Math.floor(Math.random() * animals.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      hint = `${color}${animal}`;
    }

    // Generate password
    const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const numbers = "0123456789";
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let allChars = letters;
    if (includeNumbers) allChars += numbers;
    if (includeSpecial) allChars += specialChars;

    let password = "";
    if (includeNumbers) password += numbers[Math.floor(Math.random() * numbers.length)];
    if (includeSpecial) password += specialChars[Math.floor(Math.random() * specialChars.length)];
    password += letters[Math.floor(Math.random() * letters.length)];

    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle password
    password = password.split("").sort(() => Math.random() - 0.5).join("");

    setPasswordData({ password, hint });
  }, [length, includeNumbers, includeSpecial, hintStyle]);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Download as text file
  const downloadPassword = () => {
    if (!passwordData) return;
    const blob = new Blob(
      [`Password: ${passwordData.password}\nHint: ${passwordData.hint}`],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `password-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset form
  const reset = () => {
    setPasswordData(null);
    setLength(12);
    setIncludeNumbers(true);
    setIncludeSpecial(true);
    setHintStyle("phrase");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Password Hint Generator
        </h1>

        {/* Options */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Length: {length}
            </label>
            <input
              type="range"
              min="8"
              max="20"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="mr-2 accent-green-500"
              />
              <span className="text-sm text-gray-700">Include Numbers</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeSpecial}
                onChange={(e) => setIncludeSpecial(e.target.checked)}
                className="mr-2 accent-green-500"
              />
              <span className="text-sm text-gray-700">Include Special Characters</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hint Style</label>
            <select
              value={hintStyle}
              onChange={(e) => setHintStyle(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="phrase">Phrase (e.g., Red Tiger Runs Star)</option>
              <option value="sentence">Sentence (e.g., The Swift Red Tiger Runs over the Star)</option>
              <option value="word">Word (e.g., RedTiger)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generatePasswordAndHint}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              Generate Password & Hint
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Output */}
        {passwordData && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <h2 className="text-lg35 font-semibold text-green-600">Your Password</h2>
              <p className="text-gray-800 font-mono break-all">{passwordData.password}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => copyToClipboard(passwordData.password)}
                  className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadPassword}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <FaDownload className="mrpag-2" /> Download
                </button>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-600">Memory Hint</h2>
              <p className="text-gray-700">{passwordData.hint}</p>
              <p className="text-xs text-gray-500 mt-1">
                (Visualize this to recall your password)
              </p>
            </div>
          </div>
        )}

        {!passwordData && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Generate a secure password with a memorable hint!
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Customizable length (8-20 characters)</li>
            <li>Optional numbers and special characters</li>
            <li>Multiple hint styles: Phrase, Sentence, Word</li>
            <li>Copy to clipboard and download options</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: The hint is for memory only - the password remains random and secure.
        </p>
      </div>
    </div>
  );
};

export default RandomPasswordHintGenerator;