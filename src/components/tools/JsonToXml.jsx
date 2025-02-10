"use client";

import { useState } from "react";

const JsonToXml = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [xmlOutput, setXmlOutput] = useState("");

  // Function to convert JSON to XML
  const jsonToXml = (json) => {
    if (typeof json !== "object" || json === null) {
      return "";
    }

    let xml = "";
    for (let key in json) {
      if (json.hasOwnProperty(key)) {
        if (Array.isArray(json[key])) {
          json[key].forEach((item) => {
            xml += `<${key}>${jsonToXml(item)}</${key}>`;
          });
        } else if (typeof json[key] === "object") {
          xml += `<${key}>${jsonToXml(json[key])}</${key}>`;
        } else {
          xml += `<${key}>${json[key]}</${key}>`;
        }
      }
    }
    return xml;
  };

  // Handle conversion
  const handleConvert = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const xml = `<root>${jsonToXml(parsedJson)}</root>`;
      setXmlOutput(xml);
    } catch (error) {
      setXmlOutput("Invalid JSON format.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">JSON to XML Converter</h2>

      {/* JSON Input */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder='Enter JSON here...'
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Convert to XML
      </button>

      {/* XML Output */}
      <textarea
        className="w-full h-40 p-3 mt-4 border rounded-lg bg-gray-100"
        placeholder="XML output will appear here..."
        value={xmlOutput}
        readOnly
      />
    </div>
  );
};

export default JsonToXml;
