"use client";

import { useState } from "react";

const URLDecoder = () => {
  const [textInput, setTextInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  // Function to decode URL
  const decodeURL = (text) => {
    try {
      setError("");
      return decodeURIComponent(text);
    } catch (error) {
      setError("Invalid URL-encoded input.");
      return "";
    }
  };

  // Handle decoding
  const handleDecode = () => {
    setOutput(decodeURL(textInput));
    setCopySuccess("");
  };

  // Clear input and output
  const handleClear = () => {
    setTextInput("");
    setOutput("");
    setError("");
    setCopySuccess("");
  };

  // Handle copying the output to the clipboard
  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopySuccess("Output copied to clipboard!");
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Text Input */}
      <label className="block font-medium text-gray-700 mb-2">Input Text</label>
      <textarea
        className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-primary"
        placeholder="Enter text or URL here..."
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
      />
      <p className="text-sm text-gray-500 mt-1">
        Character count: {textInput.length}
      </p>

      {/* Buttons */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={handleDecode}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary"
        >
          Decode URL
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Clear
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary"
        >
          Copy Output
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-2 font-semibold">{error}</p>}

      {/* Success Message */}
      {copySuccess && (
        <p className="text-green-500 mt-2 font-semibold">{copySuccess}</p>
      )}

      {/* Output */}
      <label className="block font-medium text-gray-700 mt-6 mb-2">
        Output
      </label>
      <textarea
        className="w-full h-32 p-3 border rounded-lg bg-gray-100"
        placeholder="Encoded/Decoded output will appear here..."
        value={output}
        readOnly
      />
    </div>
  );
};

export default URLDecoder;
