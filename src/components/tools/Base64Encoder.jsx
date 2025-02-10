"use client";

import { useState } from "react";

const Base64Encoder = () => {
  const [textInput, setTextInput] = useState("");
  const [encodedOutput, setEncodedOutput] = useState("");

  // Function to encode text to Base64
  const encodeBase64 = (text) => {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
      return "Invalid input for Base64 encoding.";
    }
  };

  // Handle encoding
  const handleEncode = () => {
    setEncodedOutput(encodeBase64(textInput));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      {/* Text Input */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Enter text here..."
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
      />

      {/* Encode Button */}
      <button
        onClick={handleEncode}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Encode to Base64
      </button>

      {/* Encoded Output */}
      <textarea
        className="w-full h-40 p-3 mt-4 border rounded-lg bg-gray-100"
        placeholder="Base64 output will appear here..."
        value={encodedOutput}
        readOnly
      />
    </div>
  );
};

export default Base64Encoder;
