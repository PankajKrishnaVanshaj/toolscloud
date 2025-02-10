"use client";

import { useState } from "react";

const JSONFormatter = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [error, setError] = useState("");

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setFormattedJson(JSON.stringify(parsed, null, 2)); // Beautify JSON
      setError("");
    } catch (err) {
      setError("Invalid JSON format. Please check your input.");
      setFormattedJson("");
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setFormattedJson(JSON.stringify(parsed)); // Minify JSON
      setError("");
    } catch (err) {
      setError("Invalid JSON format. Please check your input.");
      setFormattedJson("");
    }
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">

      {/* Textarea for JSON Input */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Paste your JSON here..."
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      ></textarea>

      {/* Buttons */}
      <div className="flex gap-2 mt-3">
        <button
          className="w-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          onClick={formatJSON}
        >
          Beautify
        </button>
        <button
          className="w-1/2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          onClick={minifyJSON}
        >
          Minify
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="mt-3 p-3 border rounded-lg bg-red-100 text-red-700">{error}</div>}

      {/* Formatted JSON Output */}
      {formattedJson && (
        <pre className="mt-3 p-3 border rounded-lg bg-gray-100 text-sm overflow-x-auto">
          {formattedJson}
        </pre>
      )}
    </div>
  );
};

export default JSONFormatter;
