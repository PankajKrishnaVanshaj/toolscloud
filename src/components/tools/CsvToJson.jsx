"use client";

import { useState } from "react";

const CsvToJson = () => {
  const [csvInput, setCsvInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");

  // Function to convert CSV to JSON
  const convertCsvToJson = () => {
    const lines = csvInput.trim().split("\n");
    if (lines.length < 2) {
      setJsonOutput("Invalid CSV format!");
      return;
    }

    const headers = lines[0].split(",");
    const jsonData = lines.slice(1).map((line) => {
      const values = line.split(",");
      return headers.reduce((acc, header, index) => {
        acc[header.trim()] = values[index]?.trim() || "";
        return acc;
      }, {});
    });

    setJsonOutput(JSON.stringify(jsonData, null, 2));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      {/* CSV Input */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter CSV data here..."
        value={csvInput}
        onChange={(e) => setCsvInput(e.target.value)}
      ></textarea>

      {/* Convert Button */}
      <button
        onClick={convertCsvToJson}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full"
      >
        Convert to JSON
      </button>

      {/* JSON Output */}
      {jsonOutput && (
        <pre className="mt-4 p-3 bg-gray-100 rounded-lg overflow-x-auto text-sm">
          {jsonOutput}
        </pre>
      )}
    </div>
  );
};

export default CsvToJson;
