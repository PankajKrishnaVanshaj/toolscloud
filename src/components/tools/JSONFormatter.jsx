"use client";

import { useState, useEffect } from "react";
import {
  AiOutlineFileText,
  AiOutlineClear,
  AiOutlineDownload,
  AiOutlineCopy,
} from "react-icons/ai";

const JSONFormatter = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);

  // Validate JSON in real-time
  useEffect(() => {
    try {
      JSON.parse(jsonInput);
      setIsValid(true);
      setError("");
    } catch {
      setIsValid(false);
      setError("Invalid JSON format. Please check your input.");
    }
  }, [jsonInput]);

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedJson);
    alert("Formatted JSON copied to clipboard!");
  };

  const downloadJSON = () => {
    const blob = new Blob([formattedJson], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "formatted.json";
    link.click();
  };

  const clearInput = () => {
    setJsonInput("");
    setFormattedJson("");
    setError("");
  };

  const highlightSyntax = (json) => {
    if (!json) return "";
    json = json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)|(\b(true|false|null)\b)|(-?\d+(\.\d+)?([eE][+-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            return `<span class="text-blue-600">${match}</span>`; // Keys
          } else {
            return `<span class="text-green-600">${match}</span>`; // Strings
          }
        } else if (/true|false|null/.test(match)) {
          return `<span class="text-purple-600">${match}</span>`; // Boolean/Null
        } else {
          return `<span class="text-red-600">${match}</span>`; // Numbers
        }
      }
    );
    return json;
  };

  return (
    <div className="mx-auto p-5 rounded-2xl bg-white shadow-lg">
      {/* Real-Time Validation Indicator */}
      <div
        className={`mb-4 p-2 rounded-lg ${
          isValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {isValid ? "Valid JSON" : error}
      </div>

      {/* Textarea for JSON Input */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Paste your JSON here..."
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      ></textarea>

      {/* Buttons */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          className="flex items-center justify-center gap-2 border hover:border-secondary bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text px-7 py-2 rounded-lg  transition"
          onClick={formatJSON}
        >
          <AiOutlineFileText className="text-primary" />
          Beautify
        </button>
        <button
          className="flex items-center justify-center gap-2 border hover:border-secondary bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text px-7 py-2 rounded-lg  transition"
          onClick={minifyJSON}
        >
          <AiOutlineFileText className="text-primary"/>
          Minify
        </button>
        <button
          className="flex items-center justify-center gap-2 border hover:border-secondary bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text px-7 py-2 rounded-lg  transition"
          onClick={copyToClipboard}
        >
          <AiOutlineCopy className="text-primary"/>
          Copy
        </button>
        <button
          className="flex items-center justify-center gap-2 border hover:border-secondary bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text px-7 py-2 rounded-lg  transition"
          onClick={clearInput}
        >
          <AiOutlineClear className="text-primary"/>
          Clear
        </button>
      </div>

      {/* Download Button */}
      {formattedJson && (
        <button
          className="mt-3 flex items-center gap-2 border text-primary px-7 py-2 rounded-lg hover:border-secondary transition font-semibold"
          onClick={downloadJSON}
        >
          <AiOutlineDownload />
          Download JSON
        </button>
      )}

      {/* Formatted JSON Output with Syntax Highlighting */}
      {formattedJson && (
        <pre className="mt-3 p-3 border rounded-lg bg-gray-100 text-sm overflow-x-auto">
          <code
            dangerouslySetInnerHTML={{
              __html: highlightSyntax(formattedJson),
            }}
          />
        </pre>
      )}
    </div>
  );
};

export default JSONFormatter;
