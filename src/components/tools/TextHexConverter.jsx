"use client";
import React, { useState } from "react";

const TextHexConverter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState("textToHex"); // textToHex or hexToText
  const [options, setOptions] = useState({
    uppercase: true,
    addSpaces: true,
  });

  // Text to Hex conversion
  const textToHex = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to convert" };
    }

    let hex = Array.from(text)
      .map(char => {
        const code = char.charCodeAt(0).toString(16);
        return options.uppercase ? code.toUpperCase() : code.toLowerCase();
      })
      .join(options.addSpaces ? " " : "");

    return {
      original: text,
      converted: hex,
      type: "Text to Hex",
    };
  };

  // Hex to Text conversion
  const hexToText = (hex) => {
    if (!hex.trim()) {
      return { error: "Please enter some hex values to convert" };
    }

    // Remove spaces and validate hex input
    const cleanHex = hex.replace(/\s+/g, "");
    if (!/^[0-9A-Fa-f]+$/.test(cleanHex) || cleanHex.length % 2 !== 0) {
      return { error: "Invalid hex input: Use only 0-9, A-F, and ensure even length" };
    }

    let text = "";
    try {
      for (let i = 0; i < cleanHex.length; i += 2) {
        text += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
      }
    } catch (e) {
      return { error: "Error decoding hex values" };
    }

    return {
      original: hex,
      converted: text,
      type: "Hex to Text",
    };
  };

  const handleConvert = async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = direction === "textToHex" ? textToHex(inputText) : hexToText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setOutputText(result.converted);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setOutputText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Hex Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter {direction === "textToHex" ? "Text" : "Hex"} to Convert:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-40 resize-y transition-all"
              placeholder={
                direction === "textToHex" 
                  ? "e.g., Hello World" 
                  : "e.g., 48 65 6C 6C 6F 20 57 6F 72 6C 64"
              }
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Conversion Options:</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-600">
                  <input
                    type="radio"
                    name="direction"
                    value="textToHex"
                    checked={direction === "textToHex"}
                    onChange={() => setDirection("textToHex")}
                    className="mr-2"
                  />
                  Text to Hex
                </label>
                <label className="text-sm text-gray-600">
                  <input
                    type="radio"
                    name="direction"
                    value="hexToText"
                    checked={direction === "hexToText"}
                    onChange={() => setDirection("hexToText")}
                    className="mr-2"
                  />
                  Hex to Text
                </label>
              </div>
              {direction === "textToHex" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={options.uppercase}
                      onChange={() => handleOptionChange("uppercase", !options.uppercase)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Uppercase Hex</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={options.addSpaces}
                      onChange={() => handleOptionChange("addSpaces", !options.addSpaces)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Add Spaces</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isLoading ? "Converting..." : "Convert"}
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
        {outputText && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Converted {direction === "textToHex" ? "Hex" : "Text"}
            </h2>
            <p className="mt-3 text-lg text-center text-gray-700 break-all">
              {outputText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
            >
              Copy to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextHexConverter;