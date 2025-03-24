"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const CsvToXml = () => {
  const [csvInput, setCsvInput] = useState("");
  const [xmlOutput, setXmlOutput] = useState("");
  const [rootElement, setRootElement] = useState("root");
  const [rowElement, setRowElement] = useState("item");
  const [error, setError] = useState("");
  const [indentation, setIndentation] = useState(2);
  const [delimiter, setDelimiter] = useState(",");
  const [wrapValues, setWrapValues] = useState(false); // Wrap values in CDATA
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = React.useRef(null);

  // Parse CSV with custom delimiter
  const parseCSV = useCallback(
    (csv) => {
      const lines = csv.trim().split("\n");
      const headers = lines[0].split(delimiter).map((header) => header.trim());
      const data = lines.slice(1).map((line) => {
        const values = line.split(delimiter).map((value) => value.trim());
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || "";
          return obj;
        }, {});
      });
      return data;
    },
    [delimiter]
  );

  // Convert to XML with options
  const convertToXML = useCallback(
    (data) => {
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n`;
      data.forEach((item) => {
        xml += `${" ".repeat(indentation)}<${rowElement}>\n`;
        Object.entries(item).forEach(([key, value]) => {
          const escapedValue = wrapValues
            ? `<![CDATA[${value}]]>`
            : escapeXML(value);
          xml += `${" ".repeat(indentation * 2)}<${key}>${escapedValue}</${key}>\n`;
        });
        xml += `${" ".repeat(indentation)}</${rowElement}>\n`;
      });
      xml += `</${rootElement}>`;
      return xml;
    },
    [rootElement, rowElement, indentation, wrapValues]
  );

  // Escape XML special characters
  const escapeXML = (str) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  // Handle conversion
  const handleConvert = useCallback(() => {
    setError("");
    setXmlOutput("");
    setIsProcessing(true);

    if (!csvInput.trim()) {
      setError("Please enter CSV data or upload a file");
      setIsProcessing(false);
      return;
    }

    try {
      const data = parseCSV(csvInput);
      const xml = convertToXML(data);
      setXmlOutput(xml);
    } catch (err) {
      setError(`Error converting CSV to XML: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [csvInput, parseCSV, convertToXML]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvInput(event.target.result);
    };
    reader.onerror = () => {
      setError("Error reading file");
    };
    reader.readAsText(file);
  };

  // Download XML
  const downloadXML = () => {
    if (!xmlOutput) return;
    const blob = new Blob([xmlOutput], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset all fields
  const reset = () => {
    setCsvInput("");
    setXmlOutput("");
    setRootElement("root");
    setRowElement("item");
    setError("");
    setIndentation(2);
    setDelimiter(",");
    setWrapValues(false);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          CSV to XML Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSV Input
              </label>
              <textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder={`name${delimiter}age${delimiter}city\nJohn${delimiter}25${delimiter}New York\nJane${delimiter}30${delimiter}London`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 font-mono text-sm resize-y"
                disabled={isProcessing}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isProcessing}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaUpload className="mr-2" />
                  {isProcessing ? "Converting..." : "Convert to XML"}
                </button>
                <button
                  onClick={reset}
                  disabled={isProcessing}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Root Element Name
              </label>
              <input
                type="text"
                value={rootElement}
                onChange={(e) => setRootElement(e.target.value || "root")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Row Element Name
              </label>
              <input
                type="text"
                value={rowElement}
                onChange={(e) => setRowElement(e.target.value || "item")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
            </div>
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
                <option value="\t">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indentation (spaces)
              </label>
              <select
                value={indentation}
                onChange={(e) => setIndentation(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                <option value={0}>0 (No indentation)</option>
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={wrapValues}
                  onChange={(e) => setWrapValues(e.target.checked)}
                  className="mr-2 accent-blue-500"
                  disabled={isProcessing}
                />
                <span className="text-sm text-gray-700">Wrap values in CDATA</span>
              </label>
            </div>
          </div>

          {/* Output Section */}
          {xmlOutput && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-700">XML Output</h2>
                <button
                  onClick={downloadXML}
                  className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download XML
                </button>
              </div>
              <pre className="text-sm font-mono bg-white p-4 rounded border border-gray-200 overflow-auto max-h-80">
                {xmlOutput}
              </pre>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert CSV to XML with custom root and row elements</li>
              <li>Support for multiple delimiters (comma, semicolon, tab, pipe)</li>
              <li>Upload CSV files or paste text</li>
              <li>Adjustable XML indentation</li>
              <li>Option to wrap values in CDATA</li>
              <li>Downloadable XML output</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvToXml;