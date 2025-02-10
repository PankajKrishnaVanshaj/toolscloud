"use client";

import { useState } from "react";

const YamlToJson = () => {
  const [yamlInput, setYamlInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");

  // Function to convert YAML to JSON
  const yamlToJson = (yaml) => {
    const lines = yaml.split("\n");
    const result = {};
    let currentObj = result;
    const stack = [];
    let lastIndent = 0;

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith("#")) continue; // Skip empty lines & comments

      const indent = line.match(/^(\s*)/)[0].length;
      const [key, ...values] = line.split(":");
      const value = values.join(":").trim();

      while (indent < lastIndent) {
        currentObj = stack.pop();
        lastIndent -= 2;
      }

      if (value) {
        currentObj[key.trim()] = isNaN(value) ? value : Number(value);
      } else {
        stack.push(currentObj);
        currentObj[key.trim()] = {};
        currentObj = currentObj[key.trim()];
        lastIndent = indent;
      }
    }

    return JSON.stringify(result, null, 2);
  };

  // Handle conversion
  const handleConvert = () => {
    try {
      const json = yamlToJson(yamlInput);
      setJsonOutput(json);
    } catch (error) {
      setJsonOutput("Invalid YAML format.");
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      {/* YAML Input */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Enter YAML here..."
        value={yamlInput}
        onChange={(e) => setYamlInput(e.target.value)}
      />

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Convert to JSON
      </button>

      {/* JSON Output */}
      <textarea
        className="w-full h-40 p-3 mt-4 border rounded-lg bg-gray-100"
        placeholder="JSON output will appear here..."
        value={jsonOutput}
        readOnly
      />
    </div>
  );
};

export default YamlToJson;
