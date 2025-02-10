"use client";

import { useState } from "react";

const URLDecoder = () => {
  const [encodedInput, setEncodedInput] = useState("");
  const [decodedOutput, setDecodedOutput] = useState("");

  // Function to decode URL
  const decodeURL = (text) => {
    try {
      return decodeURIComponent(text);
    } catch (error) {
      return "Invalid URL-encoded input.";
    }
  };

  // Handle decoding
  const handleDecode = () => {
    setDecodedOutput(decodeURL(encodedInput));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      {/* Encoded Input */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Enter encoded URL here..."
        value={encodedInput}
        onChange={(e) => setEncodedInput(e.target.value)}
      />

      {/* Decode Button */}
      <button
        onClick={handleDecode}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Decode URL
      </button>

      {/* Decoded Output */}
      <textarea
        className="w-full h-40 p-3 mt-4 border rounded-lg bg-gray-100"
        placeholder="Decoded text will appear here..."
        value={decodedOutput}
        readOnly
      />
    </div>
  );
};

export default URLDecoder;
