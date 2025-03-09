"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaTrash, FaHistory, FaUndo, FaRedo } from "react-icons/fa";

const CaptchaGenerator = () => {
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isVerified, setIsVerified] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    length: 6,              // Captcha length
    distortion: "medium",   // low, medium, high
    noise: "medium",        // none, low, medium, high
    charSet: "alphanumeric", // alphanumeric, letters, numbers
    caseSensitive: false,   // Case sensitivity for verification
  });

  const generateCaptchaText = useCallback(() => {
    let characters;
    switch (options.charSet) {
      case "letters":
        characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        break;
      case "numbers":
        characters = "0123456789";
        break;
      case "alphanumeric":
      default:
        characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    }

    let newCaptcha = "";
    for (let i = 0; i < options.length; i++) {
      newCaptcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return newCaptcha;
  }, [options.length, options.charSet]);

  const generateCaptcha = () => {
    const newCaptcha = generateCaptchaText();
    setCaptchaText(newCaptcha);
    setUserInput("");
    setIsVerified(null);
    setIsCopied(false);
    setHistory((prev) => [...prev, { text: newCaptcha, options }].slice(-5));
  };

  // Generate initial captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const verifyCaptcha = () => {
    const userText = options.caseSensitive ? userInput : userInput.toLowerCase();
    const captcha = options.caseSensitive ? captchaText : captchaText.toLowerCase();
    setIsVerified(userText === captcha);
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(captchaText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const clearInput = () => {
    setUserInput("");
    setIsVerified(null);
  };

  // Distortion styles
  const getDistortionStyle = () => {
    switch (options.distortion) {
      case "low":
        return { transform: "rotate(2deg)", letterSpacing: "2px" };
      case "high":
        return { transform: "rotate(8deg) skewX(-15deg)", letterSpacing: "4px" };
      case "medium":
      default:
        return { transform: "rotate(5deg) skewX(-10deg)", letterSpacing: "3px" };
    }
  };

  // Noise styles
  const getNoiseStyle = () => {
    switch (options.noise) {
      case "none":
        return { backgroundImage: "none" };
      case "low":
        return {
          backgroundImage: "linear-gradient(45deg, #f3f3f3 25%, transparent 25%, transparent 75%, #f3f3f3 75%)",
          backgroundSize: "10px 10px",
        };
      case "high":
        return {
          backgroundImage:
            "linear-gradient(45deg, #e0e0e0 15%, transparent 15%, transparent 85%, #e0e0e0 85%), linear-gradient(135deg, #e0e0e0 15%, transparent 15%, transparent 85%, #e0e0e0 85%)",
          backgroundSize: "20px 20px",
        };
      case "medium":
      default:
        return {
          backgroundImage:
            "linear-gradient(45deg, #f3f3f3 25%, transparent 25%, transparent 75%, #f3f3f3 75%), linear-gradient(45deg, #f3f3f3 25%, transparent 25%, transparent 75%, #f3f3f3 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
        };
    }
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => {
      const newOptions = { ...prev, [key]: value };
      return newOptions;
    });
    generateCaptcha(); // Regenerate with new options
  };

  const restoreFromHistory = (entry) => {
    setCaptchaText(entry.text);
    setOptions(entry.options);
    setUserInput("");
    setIsVerified(null);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Captcha Generator
        </h1>

        {/* Options Section */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Captcha Length (4-10)
              </label>
              <input
                type="number"
                min="4"
                max="10"
                value={options.length}
                onChange={(e) =>
                  handleOptionChange("length", Math.max(4, Math.min(10, Number(e.target.value) || 6)))
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character Set
              </label>
              <select
                value={options.charSet}
                onChange={(e) => handleOptionChange("charSet", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alphanumeric">Alphanumeric</option>
                <option value="letters">Letters Only</option>
                <option value="numbers">Numbers Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distortion Level
              </label>
              <select
                value={options.distortion}
                onChange={(e) => handleOptionChange("distortion", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Noise Level
              </label>
              <select
                value={options.noise}
                onChange={(e) => handleOptionChange("noise", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.caseSensitive}
                onChange={() => handleOptionChange("caseSensitive", !options.caseSensitive)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Case Sensitive</label>
            </div>
          </div>
        </div>

        {/* Captcha Display */}
        <div className="relative mb-6">
          <div
            className="bg-gray-200 p-4 rounded-md text-center font-mono text-xl text-gray-800 border border-gray-300"
            style={{ ...getDistortionStyle(), ...getNoiseStyle() }}
          >
            {captchaText}
          </div>
          <button
            onClick={generateCaptcha}
            className="absolute top-1 right-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
            title="Refresh Captcha"
          >
            <FaRedo className="w-5 h-5" />
          </button>
        </div>

        {/* User Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Captcha Text
          </label>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type the text you see"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={verifyCaptcha}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Verify
          </button>
          <button
            onClick={copyToClipboard}
            className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isCopied
                ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                : "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500"
            }`}
          >
            <FaCopy className="inline mr-2" />
            {isCopied ? "Copied!" : "Copy Captcha"}
          </button>
          <button
            onClick={clearInput}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <FaTrash className="inline mr-2" />
            Clear Input
          </button>
        </div>

        {/* Verification Result */}
        {isVerified !== null && (
          <div
            className={`mt-4 p-3 rounded-md text-center text-white font-medium ${
              isVerified ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {isVerified ? "Verification Successful!" : "Verification Failed!"}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Captchas (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{entry.text} ({entry.options.length} chars, {entry.options.distortion})</span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Customizable length (4-10 characters)</li>
            <li>Choose character set: alphanumeric, letters, or numbers</li>
            <li>Adjustable distortion and noise levels</li>
            <li>Case-sensitive verification option</li>
            <li>Copy and track recent captchas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CaptchaGenerator;