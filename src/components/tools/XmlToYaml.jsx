'use client';

import React, { useState } from 'react';
import xml2js from 'xml2js';
import yaml from 'js-yaml';

const XmlToYaml = () => {
  const [xmlInput, setXmlInput] = useState('');
  const [yamlOutput, setYamlOutput] = useState('');
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    indent: 2, // YAML indentation
    explicitArray: true, // Force arrays in YAML
    trim: true, // Trim whitespace in XML
  });

  const convertXmlToYaml = () => {
    setError('');
    setYamlOutput('');

    if (!xmlInput.trim()) {
      setError('Please enter XML content');
      return;
    }

    xml2js.parseString(xmlInput, { trim: options.trim }, (err, result) => {
      if (err) {
        setError(`Invalid XML: ${err.message}`);
        return;
      }

      try {
        const yamlText = yaml.dump(result, {
          indent: options.indent,
          noArrayIndent: !options.explicitArray,
        });
        setYamlOutput(yamlText);
      } catch (yamlErr) {
        setError(`YAML conversion failed: ${yamlErr.message}`);
      }
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setXmlInput(event.target.result);
        convertXmlToYaml();
      };
      reader.readAsText(file);
    }
  };

  const downloadFile = (content, fileName, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      if (xmlInput) convertXmlToYaml(); // Re-convert with new options
      return newOptions;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          XML to YAML Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                XML Input
              </label>
              <textarea
                value={xmlInput}
                onChange={(e) => setXmlInput(e.target.value)}
                placeholder="Enter XML here..."
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <div className="mt-2 flex gap-2">
                <input
                  type="file"
                  accept=".xml"
                  onChange={handleFileUpload}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  onClick={() => downloadFile(xmlInput, 'input.xml', 'application/xml')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Download XML
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YAML Output
              </label>
              <textarea
                value={yamlOutput}
                readOnly
                placeholder="YAML output will appear here..."
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={convertXmlToYaml}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Convert
                </button>
                <button
                  onClick={() => downloadFile(yamlOutput, 'output.yaml', 'application/x-yaml')}
                  disabled={!yamlOutput}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                  Download YAML
                </button>
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Conversion Options</h2>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <label className="font-medium">Indentation:</label>
                <select
                  value={options.indent}
                  onChange={(e) => handleOptionChange('indent', parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.explicitArray}
                  onChange={(e) => handleOptionChange('explicitArray', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Explicit Arrays
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.trim}
                  onChange={(e) => handleOptionChange('trim', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Trim Whitespace
              </label>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert XML to YAML format</li>
              <li>Upload XML files or paste content</li>
              <li>Download XML input or YAML output</li>
              <li>Customizable indentation and array formatting</li>
              <li>Whitespace trimming option</li>
              <li>Example XML: &lt;root&gt;&lt;item&gt;test&lt;/item&gt;&lt;/root&gt;</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default XmlToYaml;