'use client'
import React, { useState, useRef } from 'react';
import { parseStringPromise } from 'xml2js';

const XmlToJson = () => {
  const [xmlInput, setXmlInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [error, setError] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrettyPrint, setIsPrettyPrint] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [parseOptions, setParseOptions] = useState({
    explicitArray: false,
    trim: true,
    normalize: true,
    mergeAttrs: false,
  });
  const fileInputRef = useRef(null);

  // Validate XML basic structure
  const validateXML = (xml) => {
    if (!xml.trim()) return 'XML input is empty';
    if (!xml.startsWith('<')) return 'XML must start with a tag';
    if (!xml.endsWith('>')) return 'XML must end with a closing tag';
    return '';
  };

  // Convert XML to JSON
  const convertToJson = async () => {
    const validationError = validateXML(xmlInput);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await parseStringPromise(xmlInput, parseOptions);
      const jsonString = isPrettyPrint 
        ? JSON.stringify(result, null, 2) 
        : JSON.stringify(result);
      setJsonOutput(jsonString);
    } catch (err) {
      setError(`XML parsing error: ${err.message}. Check for proper nesting and closing tags.`);
      setJsonOutput('');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const xmlData = event.target.result;
      setXmlInput(xmlData);
      const validationError = validateXML(xmlData);
      if (validationError) {
        setError(validationError);
        setIsLoading(false);
        return;
      }
      try {
        const result = await parseStringPromise(xmlData, parseOptions);
        setJsonOutput(isPrettyPrint ? JSON.stringify(result, null, 2) : JSON.stringify(result));
      } catch (err) {
        setError(`Invalid XML file: ${err.message}`);
        setJsonOutput('');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Error reading file');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/xml') {
      handleFileUpload(file);
    } else {
      setError('Please drop a valid XML file');
    }
  };

  // Handle copy
  const handleCopy = () => {
    if (jsonOutput) {
      navigator.clipboard.writeText(jsonOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (jsonOutput) {
      const blob = new Blob([jsonOutput], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'data.json';
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  // Clear all
  const clearAll = () => {
    setXmlInput('');
    setJsonOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="relative bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            JSON copied to clipboard!
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">XML to JSON Converter</h1>
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
            disabled={isLoading}
          >
            Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Parse Options */}
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Parse Options</h3>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={parseOptions.explicitArray}
                onChange={(e) => setParseOptions(prev => ({ ...prev, explicitArray: e.target.checked }))}
                className="mr-2"
                disabled={isLoading}
              />
              Explicit Array
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={parseOptions.trim}
                onChange={(e) => setParseOptions(prev => ({ ...prev, trim: e.target.checked }))}
                className="mr-2"
                disabled={isLoading}
              />
              Trim Whitespace
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={parseOptions.normalize}
                onChange={(e) => setParseOptions(prev => ({ ...prev, normalize: e.target.checked }))}
                className="mr-2"
                disabled={isLoading}
              />
              Normalize Spaces
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={parseOptions.mergeAttrs}
                onChange={(e) => setParseOptions(prev => ({ ...prev, mergeAttrs: e.target.checked }))}
                className="mr-2"
                disabled={isLoading}
              />
              Merge Attributes
            </label>
          </div>
        </div>

        {/* XML Input */}
        <div 
          className={`mb-6 border-2 rounded-md ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex justify-between items-center mb-2 p-2">
            <label className="block text-sm font-medium text-gray-700">
              Enter XML Data
            </label>
            <div className="flex gap-2">
              <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                Upload File
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  accept=".xml"
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>
          <textarea
            value={xmlInput}
            onChange={(e) => {
              setXmlInput(e.target.value);
              setJsonOutput('');
              setError('');
            }}
            placeholder='Paste your XML here or drag-and-drop an XML file'
            className="w-full h-40 px-3 py-2 border-t border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
            aria-label="XML input"
            disabled={isLoading}
          />
          <button
            onClick={convertToJson}
            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={isLoading || !xmlInput.trim()}
          >
            {isLoading ? 'Converting...' : 'Convert to JSON'}
          </button>
        </div>

        {/* JSON Output */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              JSON Output
            </label>
            <button
              onClick={() => {
                if (jsonOutput) {
                  setJsonOutput(isPrettyPrint ? JSON.stringify(JSON.parse(jsonOutput)) : JSON.stringify(JSON.parse(jsonOutput), null, 2));
                  setIsPrettyPrint(!isPrettyPrint);
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              disabled={!jsonOutput || isLoading}
            >
              {isPrettyPrint ? 'Minify' : 'Pretty Print'}
            </button>
          </div>
          <textarea
            value={jsonOutput}
            readOnly
            placeholder="JSON output will appear here"
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-y"
            aria-label="JSON output"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCopy}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              disabled={!jsonOutput || isLoading}
            >
              Copy JSON
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              disabled={!jsonOutput || isLoading}
            >
              Download JSON
            </button>
          </div>
        </div>

        {/* Example */}
        <div className="text-sm text-gray-600">
          <p>Example input:</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            {`<people>
  <person id="1">
    <name>John</name>
    <age>30</age>
  </person>
  <person id="2">
    <name>Jane</name>
    <age>25</age>
  </person>
</people>`}
          </pre>
          <p className="mt-2">Example output (with default options):</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            {`{
  "people": {
    "person": [
      {
        "id": "1",
        "name": "John",
        "age": "30"
      },
      {
        "id": "2",
        "name": "Jane",
        "age": "25"
      }
    ]
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default XmlToJson;