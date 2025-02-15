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

  // Handle file upload with proper JSON validation
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedJson = JSON.parse(event.target.result); // Validate JSON
          setJsonInput(JSON.stringify(parsedJson, null, 2)); // Pretty-print JSON in the textarea
        } catch (error) {
          setJsonInput(""); // Clear input on invalid JSON
          setXmlOutput("Invalid JSON format. Please upload a valid JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle download of XML
  const handleDownload = () => {
    const blob = new Blob([xmlOutput], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "output.xml";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(xmlOutput).then(() => {
      alert("Copied to clipboard!");
    });
  };

  // Handle clear input and output
  const handleClear = () => {
    setJsonInput("");
    setXmlOutput("");
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      {/* File Upload */}
      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="mb-3"
      />

      {/* JSON Input */}
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-primary"
        placeholder="Enter JSON here..."
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />

      {/* Convert Button */}
      <div className="flex space-x-2 mt-3">
        <button
          onClick={handleConvert}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Convert to XML
        </button>

        {/* Clear Button */}
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Clear
        </button>
      </div>

      {/* XML Output */}
      <textarea
        className="w-full h-40 p-3 mt-4 border rounded-lg bg-gray-100"
        placeholder="XML output will appear here..."
        value={xmlOutput}
        readOnly
      />

      {/* Additional Buttons */}
      {xmlOutput && (
        <div className="flex justify-between mt-4">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Download XML
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default JsonToXml;
