"use client";
import { useState, useCallback } from "react";
import { FaDownload, FaCopy, FaSync, FaFileUpload } from "react-icons/fa";
import prettier from "prettier/standalone";
import xmlPlugin from "@prettier/plugin-xml";

const JsonToXml = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [xmlOutput, setXmlOutput] = useState("");
  const [formatOutput, setFormatOutput] = useState(true);
  const [rootNode, setRootNode] = useState("root");
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to convert JSON to XML
  const jsonToXml = useCallback((json, rootName = "root") => {
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
    return `<${rootName}>${xml}</${rootName}>`;
  }, []);

  // Handle conversion
  const handleConvert = useCallback(async () => {
    setIsProcessing(true);
    try {
      const parsedJson = JSON.parse(jsonInput);
      let xml = jsonToXml(parsedJson, rootNode || "root");

      if (formatOutput) {
        xml = prettier.format(xml, {
          parser: "xml",
          plugins: [xmlPlugin],
          printWidth: 80,
        });
      }
      setXmlOutput(xml);
    } catch (error) {
      setXmlOutput("Invalid JSON format. Please check your input.");
    }
    setIsProcessing(false);
  }, [jsonInput, formatOutput, rootNode, jsonToXml]);

  // Handle file upload
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedJson = JSON.parse(event.target.result);
          setJsonInput(JSON.stringify(parsedJson, null, 2));
          setXmlOutput("");
        } catch (error) {
          setJsonInput("");
          setXmlOutput("Invalid JSON format. Please upload a valid JSON file.");
        }
      };
      reader.readAsText(file);
    }
  }, []);

  // Handle download
  const handleDownload = () => {
    const blob = new Blob([xmlOutput], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `output-${Date.now()}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(xmlOutput).then(() => {
      alert("XML copied to clipboard!");
    });
  };

  // Handle clear
  const handleClear = () => {
    setJsonInput("");
    setXmlOutput("");
    setRootNode("root");
    setFormatOutput(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          JSON to XML Converter
        </h1>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Root Node Name
            </label>
            <input
              type="text"
              value={rootNode}
              onChange={(e) => setRootNode(e.target.value)}
              placeholder="e.g., root"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formatOutput}
                onChange={(e) => setFormatOutput(e.target.checked)}
                className="mr-2 accent-blue-500"
                disabled={isProcessing}
              />
              <span className="text-sm text-gray-700">Format XML Output</span>
            </label>
          </div>
        </div>

        {/* JSON Input and XML Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* JSON Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JSON Input
            </label>
            <textarea
              className="w-full h-64 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Enter or paste JSON here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {/* XML Output */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              XML Output
            </label>
            <textarea
              className="w-full h-64 p-3 border rounded-lg bg-gray-50 resize-y"
              placeholder="XML output will appear here..."
              value={xmlOutput}
              readOnly
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleConvert}
            disabled={!jsonInput || isProcessing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <FaFileUpload className="mr-2" />
            )}
            {isProcessing ? "Converting..." : "Convert to XML"}
          </button>
          <button
            onClick={handleClear}
            disabled={isProcessing}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Clear
          </button>
          {xmlOutput && !xmlOutput.includes("Invalid") && (
            <>
              <button
                onClick={handleDownload}
                className="flex-1 py-2 px共和-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download XML
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <FaCopy className="mr-2" /> Copy to Clipboard
              </button>
            </>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert JSON to XML with custom root node</li>
            <li>Optional XML formatting with Prettier</li>
            <li>File upload support for JSON files</li>
            <li>Download XML output or copy to clipboard</li>
            <li>Real-time error checking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JsonToXml;