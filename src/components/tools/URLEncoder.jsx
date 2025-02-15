"use client";

import { useState } from "react";

const URLEncoder = () => {
  const [textInput, setTextInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Function to encode URL
  const encodeURL = (text) => {
    try {
      setError("");
      return encodeURIComponent(text);
    } catch (error) {
      setError("Invalid input for URL encoding.");
      return "";
    }
  };

  // Handle encoding
  const handleEncode = () => {
    setOutput(encodeURL(textInput));
  };

  // Clear input and output
  const handleClear = () => {
    setTextInput("");
    setOutput("");
    setError("");
    setCopySuccess(false);
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Clear success message after 2 seconds
      });
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
          onClick={handleEncode}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary"
        >
          Encode URL
        </button>

        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Clear
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary border border-orange-700"
        >
          Copy Output
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-2 font-semibold">{error}</p>}

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

      {/* Copy Button */}

      {/* Copy Success Message */}
      {copySuccess && (
        <p className="text-green-500 mt-2 font-semibold">
          Copied to clipboard!
        </p>
      )}
    </div>
  );
};

export default URLEncoder;
