"use client";

import React, { useState } from 'react';

const HTMLEntityEncoder = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [encodeAll, setEncodeAll] = useState(false); // Encode all characters vs. just special ones
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const encodeEntities = (text, encodeAll = false) => {
    if (encodeAll) {
      // Encode every character as a numeric entity
      return text
        .split('')
        .map(char => `&#${char.charCodeAt(0)};`)
        .join('');
    } else {
      // Encode only special characters using DOM method
      const textarea = document.createElement('textarea');
      textarea.textContent = text;
      return textarea.innerHTML;
    }
  };

  const processText = () => {
    setError(null);
    setOutputText('');
    setCopied(false);

    if (!inputText.trim()) {
      setError('Please enter some text to encode');
      return;
    }

    try {
      const result = encodeEntities(inputText, encodeAll);
      setOutputText(result);
    } catch (err) {
      setError('Error encoding text: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processText();
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Common HTML entities for reference
  const entityTable = [
    { char: '<', entity: '<', description: 'Less than' },
    { char: '>', entity: '>', description: 'Greater than' },
    { char: '&', entity: '&', description: 'Ampersand' },
    { char: '"', entity: '"', description: 'Double quote' },
    { char: "'", entity: "'", description: 'Single quote' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">HTML Entity Encoder</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hello <world> & friends!"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={encodeAll}
                onChange={(e) => setEncodeAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Encode all characters</span>
            </label>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Encode
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Output */}
        {outputText && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Encoded Text</h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
              {outputText}
            </pre>
          </div>
        )}

        {/* Entity Reference Table */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Common HTML Entities</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Character</th>
                  <th className="px-4 py-2">Entity</th>
                  <th className="px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {entityTable.map((entity, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 font-mono">{entity.char}</td>
                    <td className="px-4 py-2 font-mono">{entity.entity}</td>
                    <td className="px-4 py-2">{entity.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Note: "Encode all characters" converts every character to numeric entities (e.g., H → H).
          </p>
        </div>
      </div>
    </div>
  );
};

export default HTMLEntityEncoder;