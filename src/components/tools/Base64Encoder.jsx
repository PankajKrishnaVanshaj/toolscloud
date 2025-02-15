"use client";

import { useState } from "react";

const Base64Encoder = () => {
  const [textInput, setTextInput] = useState("");
  const [encodedOutput, setEncodedOutput] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

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

  // Handle copy to clipboard
  const handleCopy = () => {
    if (encodedOutput) {
      navigator.clipboard.writeText(encodedOutput).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Clear success message after 2 seconds
      });
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Text Input */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-primary"
        placeholder="Enter text here..."
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
      />

      <div className="flex flex-wrap gap-4">
        {/* Encode Button */}
        <button
          onClick={handleEncode}
          className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
        >
          Encode to Base64
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
