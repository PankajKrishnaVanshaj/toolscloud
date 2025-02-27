"use client";
import React, { useState } from "react";

const TextBinaryConverter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState("textToBinary"); // textToBinary or binaryToText
  const [options, setOptions] = useState({
    addSpaces: true,
    eightBit: true,
  });

  // Text to Binary conversion
  const textToBinary = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to convert" };
    }

    let binary = Array.from(text)
      .map(char => {
        let bin = char.charCodeAt(0).toString(2);
        if (options.eightBit) {
          bin = bin.padStart(8, "0"); // Ensure 8-bit representation
        }
        return bin;
      })
      .join(options.addSpaces ? " " : "");

    return {
      original: text,
      converted: binary,
      type: "Text to Binary",
    };
  };

  // Binary to Text conversion
  const binaryToText = (binary) => {
    if (!binary.trim()) {
      return { error: "Please enter some binary values to convert" };
    }

    // Remove spaces and validate binary input
    const cleanBinary = binary.replace(/\s+/g, "");
    if (!/^[01]+$/.test(cleanBinary) || cleanBinary.length % 8 !== 0) {
      return { error: "Invalid binary input: Use only 0s and 1s, and ensure length is a multiple of 8" };
    }

    let text = "";
    try {
      for (let i = 0; i < cleanBinary.length; i += 8) {
        const byte = cleanBinary.substr(i, 8);
        text += String.fromCharCode(parseInt(byte, 2));
      }
    } catch (e) {
      return { error: "Error decoding binary values" };
    }

    return {
      original: binary,
      converted: text,
      type: "Binary to Text",
    };
  };

  const handleConvert = async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = direction === "textToBinary" ? textToBinary(inputText) : binaryToText(inputText);

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
          Text Binary Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter {direction === "textToBinary" ? "Text" : "Binary"} to Convert:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-40 resize-y transition-all"
              placeholder={
                direction === "textToBinary"
                  ? "e.g., Hello"
                  : "e.g., 01001000 01100101 01101100 01101100 01101111"
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
                    value="textToBinary"
                    checked={direction === "textToBinary"}
                    onChange={() => setDirection("textToBinary")}
                    className="mr-2"
                  />
                  Text to Binary
                </label>
                <label className="text-sm text-gray-600">
                  <input
                    type="radio"
                    name="direction"
                    value="binaryToText"
                    checked={direction === "binaryToText"}
                    onChange={() => setDirection("binaryToText")}
                    className="mr-2"
                  />
                  Binary to Text
                </label>
              </div>
              {direction === "textToBinary" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={options.addSpaces}
                      onChange={() => handleOptionChange("addSpaces", !options.addSpaces)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <span>Add Spaces</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={options.eightBit}
                      onChange={() => handleOptionChange("eightBit", !options.eightBit)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <span>8-Bit Format</span>
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
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
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
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Converted {direction === "textToBinary" ? "Binary" : "Text"}
            </h2>
            <p className="mt-3 text-lg text-center text-gray-700 break-all">
              {outputText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
            >
              Copy to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextBinaryConverter;