"use client";
import React, { useState } from "react";

// Morse code dictionary
const morseCode = {
  "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.",
  "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..",
  "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.",
  "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-",
  "Y": "-.--", "Z": "--..", "0": "-----", "1": ".----", "2": "..---",
  "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...",
  "8": "---..", "9": "----.", ".": ".-.-.-", ",": "--..--", "?": "..--..",
  "!": "-.-.--", " ": "/"
};

// Reverse lookup for Morse to Text
const morseToText = Object.fromEntries(
  Object.entries(morseCode).map(([key, value]) => [value, key])
);

const TextMorseConverter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState("textToMorse"); // textToMorse or morseToText
  const [options, setOptions] = useState({
    addSpaces: true,
  });

  // Text to Morse conversion
  const textToMorse = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to convert" };
    }

    const morse = text.toUpperCase()
      .split("")
      .map(char => morseCode[char] || "")
      .filter(Boolean)
      .join(options.addSpaces ? " " : "");

    if (!morse) {
      return { error: "No valid characters found for Morse conversion" };
    }

    return {
      original: text,
      converted: morse,
      type: "Text to Morse",
    };
  };

  // Morse to Text conversion
  const morseToTextConvert = (morse) => {
    if (!morse.trim()) {
      return { error: "Please enter some Morse code to convert" };
    }

    const parts = morse.split(options.addSpaces ? /\s+/ : "");
    const text = parts
      .map(code => {
        if (code === "/") return " ";
        return morseToText[code] || "";
      })
      .join("");

    if (!text || text.trim() === "") {
      return { error: "Invalid Morse code input: Use dots (.), dashes (-), spaces, and / for word breaks" };
    }

    return {
      original: morse,
      converted: text,
      type: "Morse to Text",
    };
  };

  const handleConvert = async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = direction === "textToMorse" ? textToMorse(inputText) : morseToTextConvert(inputText);

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
          Text Morse Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter {direction === "textToMorse" ? "Text" : "Morse"} to Convert:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-40 resize-y transition-all"
              placeholder={
                direction === "textToMorse"
                  ? "e.g., HELLO WORLD"
                  : "e.g., .... . .-.. .-.. --- / .-- --- .-. .-.. -.."
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
                    value="textToMorse"
                    checked={direction === "textToMorse"}
                    onChange={() => setDirection("textToMorse")}
                    className="mr-2"
                  />
                  Text to Morse
                </label>
                <label className="text-sm text-gray-600">
                  <input
                    type="radio"
                    name="direction"
                    value="morseToText"
                    checked={direction === "morseToText"}
                    onChange={() => setDirection("morseToText")}
                    className="mr-2"
                  />
                  Morse to Text
                </label>
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.addSpaces}
                  onChange={() => handleOptionChange("addSpaces", !options.addSpaces)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <span>Add Spaces</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
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
          <div className="mt-8 p-6 bg-red-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Converted {direction === "textToMorse" ? "Morse" : "Text"}
            </h2>
            <p className="mt-3 text-lg text-center text-gray-700 break-all">
              {outputText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold"
            >
              Copy to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextMorseConverter;