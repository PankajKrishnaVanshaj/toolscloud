"use client";

import { useState } from "react";

const Base64Decoder = () => {
  const [encodedInput, setEncodedInput] = useState("");
  const [decodedOutput, setDecodedOutput] = useState("");

  // Function to decode Base64
  const decodeBase64 = (base64Text) => {
    try {
      return decodeURIComponent(escape(atob(base64Text)));
    } catch (error) {
      return "Invalid Base64 input.";
    }
  };

  // Handle decoding
  const handleDecode = () => {
    setDecodedOutput(decodeBase64(encodedInput));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      {/* Base64 Input */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Enter Base64 text here..."
        value={encodedInput}
        onChange={(e) => setEncodedInput(e.target.value)}
      />

      {/* Decode Button */}
      <button
        onClick={handleDecode}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Decode Base64
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

export default Base64Decoder;
