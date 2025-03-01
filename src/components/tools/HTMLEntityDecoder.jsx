"use client";

import React, { useState } from 'react';

const HTMLEntityDecoder = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('decode'); // 'decode' or 'encode'
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const decodeEntities = (text) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const encodeEntities = (text) => {
    const textarea = document.createElement('textarea');
    textarea.textContent = text;
    return textarea.innerHTML;
  };

  const processText = () => {
    setError(null);
    setOutputText('');
    setCopied(false);

    if (!inputText.trim()) {
      setError('Please enter some text');
      return;
    }

    try {
      const result = mode === 'decode' ? decodeEntities(inputText) : encodeEntities(inputText);
      setOutputText(result);
    } catch (err) {
      setError('Error processing text: ' + err.message);
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

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">HTML Entity Decoder/Encoder</h2>

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
              placeholder={mode === 'decode' 
                ? '&lt;p&gt;Hello &amp; welcome!&lt;/p&gt;' 
                : 'Hello & welcome!'}
            />
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="decode">Decode Entities</option>
                <option value="encode">Encode to Entities</option>
              </select>
            </div>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {mode === 'decode' ? 'Decode' : 'Encode'}
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
              <h3 className="font-semibold text-gray-700">
                {mode === 'decode' ? 'Decoded Text' : 'Encoded Text'}
              </h3>
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

        {/* Notes */}
        {!outputText && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Enter text to decode HTML entities (e.g., &amp; → &) or encode text into HTML entities (e.g., & → &amp;).</p>
            <p className="mt-1">Examples:</p>
            <ul className="list-disc pl-5">
              <li>Decode: &lt;div&gt; → </li>
              <li>Encode:  → &lt;div&gt;</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HTMLEntityDecoder;