"use client";

import { useState } from "react";

const Base64Decoder = () => {
  const [encodedInput, setEncodedInput] = useState("");
  const [decodedOutput, setDecodedOutput] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

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

  // Handle copy to clipboard
  const handleCopy = () => {
    if (decodedOutput) {
      navigator.clipboard.writeText(decodedOutput).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Clear success message after 2 seconds
      });
    }
  };
  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Base64 Input */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-primary"
        placeholder="Enter Base64 text here..."
        value={encodedInput}
        onChange={(e) => setEncodedInput(e.target.value)}
      />

      <div className="flex flex-wrap gap-4">
        {/* Decode Button */}
        <button
          onClick={handleDecode}
          className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
        >
          Decode Base64
        </button>
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Copy Output
        </button>
      </div>

      {/* Copy Success Message */}
      {copySuccess && (
        <p className="text-green-500 mt-2 font-semibold">
          Copied to clipboard!
        </p>
      )}

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
