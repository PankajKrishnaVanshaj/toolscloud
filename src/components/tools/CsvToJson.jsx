"use client";

import { useState } from "react";

const CsvToJson = () => {
  const [csvInput, setCsvInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState(null); // Track errors

  // Function to convert CSV to JSON
  const convertCsvToJson = () => {
    setError(null);
    if (!csvInput.trim()) {
      setError("CSV input is empty!");
      return;
    }

    const lines = csvInput.trim().split("\n");
    if (lines.length < 2) {
      setError("Invalid CSV format! Must have at least headers and one row.");
      return;
    }

    const headers = lines[0].split(",");
    const jsonData = lines.slice(1).map((line, lineIndex) => {
      const values = line.split(",");
      if (values.length !== headers.length) {
        setError(`Inconsistent row at line ${lineIndex + 2}`);
        return null;
      }
      return headers.reduce((acc, header, index) => {
        acc[header.trim()] = values[index]?.trim() || "";
        return acc;
      }, {});
    });

    if (jsonData.includes(null)) return;
    setJsonOutput(JSON.stringify(jsonData, null, indent));
    alert("CSV converted to JSON successfully!");
  };

  const clearAll = () => {
    setCsvInput("");
    setJsonOutput("");
    setError(null);
    alert("Input and output cleared!");
  };

  const downloadJson = () => {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "converted.json";
    link.click();
    URL.revokeObjectURL(url);
    alert("JSON file downloaded!");
  };

  const copyToClipboard = () => {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput);
    alert("Copied to clipboard!");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvInput(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      {/* CSV Input */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
        placeholder="Enter CSV data here..."
        value={csvInput}
        onChange={(e) => setCsvInput(e.target.value)}
      ></textarea>

      {/* Upload CSV File */}
      <div className="mb-3">
        <label className="block font-medium mb-1">Upload CSV File:</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Convert and Clear Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={convertCsvToJson}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Convert to JSON
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
        >
          Clear
        </button>
      </div>

      {/* Indentation Control */}
      <div className="mb-3">
        <label className="block font-medium mb-1">JSON Indentation:</label>
        <input
          type="number"
          min="0"
          max="8"
          value={indent}
          onChange={(e) => setIndent(parseInt(e.target.value, 10))}
          className="border rounded-lg p-2 w-20"
        />
      </div>

      {/* JSON Output */}
      {jsonOutput && (
        <div className="mt-4">
          <pre className="p-3 bg-gray-100 rounded-lg overflow-x-auto text-sm">
            {jsonOutput}
          </pre>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={downloadJson}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Download JSON
            </button>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvToJson;
