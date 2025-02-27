"use client";
import React, { useState } from "react";

const TextRotator = () => {
  const [inputText, setInputText] = useState("");
  const [rotatedText, setRotatedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    rotationType: "shift", // reverse, shift, rot13
    shiftAmount: 1,        // For shift rotation (1-25)
    preserveCase: true,    // Preserve original case during rotation
  });

  // Rotate text based on options
  const rotateText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to rotate" };
    }

    let result = text;

    switch (options.rotationType) {
      case "reverse":
        result = reverseText(text);
        break;
      case "shift":
        result = shiftText(text, options.shiftAmount);
        break;
      case "rot13":
        result = rot13Text(text);
        break;
      default:
        return { error: "Invalid rotation type" };
    }

    return {
      original: text,
      rotated: result,
      type: options.rotationType,
    };
  };

  // Reverse text
  const reverseText = (text) => {
    return text.split("").reverse().join("");
  };

  // Shift text (Caesar cipher-like)
  const shiftText = (text, shift) => {
    return text.split("").map(char => {
      if (/[A-Za-z]/.test(char)) {
        const code = char.charCodeAt(0);
        const base = code >= 97 ? 97 : 65; // Lowercase or uppercase
        const rotatedCode = ((code - base + shift) % 26) + base;
        return String.fromCharCode(rotatedCode);
      }
      return char;
    }).join("");
  };

  // ROT13 rotation (fixed shift of 13)
  const rot13Text = (text) => {
    return shiftText(text, 13);
  };

  const handleRotate = async () => {
    setError("");
    setRotatedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = rotateText(options.preserveCase ? inputText : inputText.toLowerCase());

      if (result.error) {
        setError(result.error);
        return;
      }

      setRotatedText(result.rotated);
    } catch (err) {
      setError("An error occurred while rotating the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setRotatedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, Math.min(25, value)) : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Rotator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Rotate:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-40 resize-y transition-all"
              placeholder="e.g., Hello World"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Rotation Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Rotation Type:</label>
                <select
                  value={options.rotationType}
                  onChange={(e) => handleOptionChange("rotationType", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="reverse">Reverse</option>
                  <option value="shift">Shift (Caesar)</option>
                  <option value="rot13">ROT13</option>
                </select>
              </div>
              {options.rotationType === "shift" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Shift Amount (1-25):</label>
                  <input
                    type="number"
                    value={options.shiftAmount}
                    onChange={(e) => handleOptionChange("shiftAmount", parseInt(e.target.value) || 1)}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="1"
                    max="25"
                  />
                </div>
              )}
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.preserveCase}
                  onChange={() => handleOptionChange("preserveCase", !options.preserveCase)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span>Preserve Case</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleRotate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isLoading ? "Rotating..." : "Rotate Text"}
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
        {rotatedText && (
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Rotated Text ({options.rotationType})
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap">
              {rotatedText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(rotatedText)}
              className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
            >
              Copy Rotated Text to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextRotator;