"use client";
import React, { useState } from "react";

const TextObfuscator = () => {
  const [inputText, setInputText] = useState("");
  const [obfuscatedText, setObfuscatedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    method: "substitute", // substitute, base64, random
    substituteChar: "*",   // Character for substitution
    preserveSpaces: true,  // Keep spaces intact
  });

  // Obfuscation functions
  const obfuscateText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to obfuscate" };
    }

    let result;
    switch (options.method) {
      case "substitute":
        result = substituteText(text);
        break;
      case "base64":
        result = base64Obfuscate(text);
        break;
      case "random":
        result = randomObfuscate(text);
        break;
      default:
        return { error: "Invalid obfuscation method" };
    }

    return {
      original: text,
      obfuscated: result,
      method: options.method,
    };
  };

  // Substitute characters with a fixed character
  const substituteText = (text) => {
    return text.split("").map(char => {
      if (options.preserveSpaces && /\s/.test(char)) return char;
      return /[a-zA-Z0-9]/.test(char) ? options.substituteChar : char;
    }).join("");
  };

  // Base64 encoding as obfuscation
  const base64Obfuscate = (text) => {
    return btoa(text);
  };

  // Random character replacement
  const randomObfuscate = (text) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    return text.split("").map(char => {
      if (options.preserveSpaces && /\s/.test(char)) return char;
      return /[a-zA-Z0-9]/.test(char) ? chars[Math.floor(Math.random() * chars.length)] : char;
    }).join("");
  };

  const handleObfuscate = async () => {
    setError("");
    setObfuscatedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = obfuscateText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setObfuscatedText(result.obfuscated);
    } catch (err) {
      setError("An error occurred while obfuscating the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setObfuscatedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: option === "substituteChar" ? value.slice(0, 1) : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Obfuscator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Obfuscate:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-40 resize-y transition-all"
              placeholder="e.g., Hello World 123"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Obfuscation Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Method:</label>
                <select
                  value={options.method}
                  onChange={(e) => handleOptionChange("method", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="substitute">Substitute</option>
                  <option value="base64">Base64</option>
                  <option value="random">Random</option>
                </select>
              </div>
              {options.method === "substitute" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Substitute Character:</label>
                  <input
                    type="text"
                    value={options.substituteChar}
                    onChange={(e) => handleOptionChange("substituteChar", e.target.value)}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    maxLength="1"
                  />
                </div>
              )}
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.preserveSpaces}
                  onChange={() => handleOptionChange("preserveSpaces", !options.preserveSpaces)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Preserve Spaces</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleObfuscate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isLoading ? "Obfuscating..." : "Obfuscate Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Output Display */}
        {obfuscatedText && (
          <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Obfuscated Text ({options.method})
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap">
              {obfuscatedText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(obfuscatedText)}
              className="mt-4 w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all font-semibold"
            >
              Copy Obfuscated Text to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextObfuscator;