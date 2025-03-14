"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaFileUpload } from "react-icons/fa";

const XmlToCsv = () => {
  const [xmlInput, setXmlInput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [error, setError] = useState("");
  const [recordTag, setRecordTag] = useState(""); // Custom record tag
  const [flattenNested, setFlattenNested] = useState(false); // Flatten nested XML
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse XML with error handling
  const parseXML = useCallback((xmlString) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        throw new Error("Invalid XML: " + parserError.textContent);
      }
      return xmlDoc;
    } catch (err) {
      setError(`XML Parsing Error: ${err.message}`);
      return null;
    }
  }, []);

  // Convert XML to CSV
  const xmlToCsv = useCallback(() => {
    setError("");
    setCsvOutput("");
    setIsProcessing(true);

    if (!xmlInput.trim()) {
      setError("Please enter XML content");
      setIsProcessing(false);
      return;
    }

    const xmlDoc = parseXML(xmlInput);
    if (!xmlDoc) {
      setIsProcessing(false);
      return;
    }

    // Determine records
    const records = recordTag
      ? xmlDoc.getElementsByTagName(recordTag)
      : xmlDoc.documentElement.children;
    if (records.length === 0) {
      setError(`No records found in XML${recordTag ? ` with tag "${recordTag}"` : ""}`);
      setIsProcessing(false);
      return;
    }

    // Extract headers
    const headers = new Set();
    const processNode = (node, prefix = "") => {
      Array.from(node.children).forEach((child) => {
        const header = prefix + child.tagName;
        headers.add(header);
        if (flattenNested && child.children.length > 0) {
          processNode(child, header + ".");
        }
      });
    };
    processNode(records[0]);

    // Convert to CSV
    let csvLines = [];
    if (includeHeaders) {
      csvLines.push(Array.from(headers).join(delimiter));
    }

    Array.from(records).forEach((record) => {
      const row = Array.from(headers).map((header) => {
        const parts = header.split(".");
        let node = record;
        for (const part of parts) {
          node = node?.querySelector(part) || null;
          if (!node) break;
        }
        return node ? `"${node.textContent.replace(/"/g, '""')}"` : "";
      });
      csvLines.push(row.join(delimiter));
    });

    setCsvOutput(csvLines.join("\n"));
    setIsProcessing(false);
  }, [xmlInput, delimiter, includeHeaders, recordTag, flattenNested, parseXML]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/xml") {
      const reader = new FileReader();
      reader.onload = (event) => setXmlInput(event.target.result);
      reader.readAsText(file);
      setError("");
      setCsvOutput("");
    } else {
      setError("Please upload a valid XML file");
    }
  };

  // Download CSV
  const downloadCsv = () => {
    if (!csvOutput) return;
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset form
  const reset = () => {
    setXmlInput("");
    setCsvOutput("");
    setDelimiter(",");
    setIncludeHeaders(true);
    setRecordTag("");
    setFlattenNested(false);
    setError("");
  };

  // Sample XML
  const sampleXML = `<data>
  <record>
    <name>John Doe</name>
    <age>30</age>
    <address>
      <city>New York</city>
      <zip>10001</zip>
    </address>
  </record>
  <record>
    <name>Jane Smith</name>
    <age>25</age>
    <address>
      <city>Los Angeles</city>
      <zip>90001</zip>
    </address>
  </record>
</data>`;

  const handleSample = () => {
    setXmlInput(sampleXML);
    setError("");
    setCsvOutput("");
    setRecordTag("record");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          XML to CSV Converter
        </h1>

        <form onSubmit={(e) => { e.preventDefault(); xmlToCsv(); }} className="space-y-6">
          {/* XML Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              XML Input
            </label>
            <textarea
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
              placeholder="Paste your XML here or upload a file..."
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 font-mono text-sm resize-y"
              disabled={isProcessing}
            />
            <div className="flex gap-2 mt-2">
              <input
                type="file"
                accept=".xml"
                onChange={handleFileUpload}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isProcessing}
              />
              <button
                type="button"
                onClick={handleSample}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={isProcessing}
              >
                Load Sample
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delimiter
              </label>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab (\t)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Record Tag (optional)
              </label>
              <input
                type="text"
                value={recordTag}
                onChange={(e) => setRecordTag(e.target.value)}
                placeholder="e.g., record"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isProcessing}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Include Headers
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={flattenNested}
                  onChange={(e) => setFlattenNested(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isProcessing}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Flatten Nested Tags
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <FaFileUpload className="mr-2" />
              )}
              {isProcessing ? "Converting..." : "Convert to CSV"}
            </button>
            <button
              onClick={downloadCsv}
              disabled={!csvOutput || isProcessing}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download CSV
            </button>
            <button
              onClick={reset}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* CSV Output */}
        {csvOutput && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">CSV Output:</h2>
            <pre className="text-sm font-mono bg-white p-4 rounded border border-gray-200 overflow-auto max-h-60">
              {csvOutput}
            </pre>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Converts XML to CSV with custom delimiters</li>
            <li>File upload support for XML</li>
            <li>Custom record tag specification</li>
            <li>Option to flatten nested XML elements</li>
            <li>Include/exclude headers</li>
            <li>Download result as CSV</li>
            <li>Sample XML for testing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default XmlToCsv;