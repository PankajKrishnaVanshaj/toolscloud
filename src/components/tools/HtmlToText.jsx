'use client';

import React, { useState } from 'react';

const HtmlToText = () => {
  const [htmlInput, setHtmlInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [options, setOptions] = useState({
    preserveLineBreaks: true,
    removeTags: true,
    trimWhitespace: false,
    decodeEntities: true,
  });
  const [error, setError] = useState('');

  const convertHtmlToText = (html) => {
    let text = html;

    // Decode HTML entities
    if (options.decodeEntities) {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      text = textarea.value;
    }

    // Remove HTML tags
    if (options.removeTags) {
      text = text.replace(/<[^>]+>/g, '');
    }

    // Preserve line breaks
    if (options.preserveLineBreaks) {
      text = text.replace(/<\/?(p|br|div|h[1-6])[^>]*>/gi, '\n');
    }

    // Trim whitespace
    if (options.trimWhitespace) {
      text = text.replace(/\s+/g, ' ').trim();
    }

    return text;
  };

  const handleInputChange = (value) => {
    setHtmlInput(value);
    setError('');
    try {
      const result = convertHtmlToText(value);
      setTextOutput(result);
    } catch (err) {
      setError(`Error processing HTML: ${err.message}`);
      setTextOutput('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleInputChange(event.target.result);
      };
      reader.onerror = () => {
        setError('Error reading file');
      };
      reader.readAsText(file);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textOutput);
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      setTextOutput(convertHtmlToText(htmlInput));
      return newOptions;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          HTML to Text Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTML Input
              </label>
              <textarea
                value={htmlInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter or paste HTML here..."
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
              <input
                type="file"
                accept=".html,.txt"
                onChange={handleFileUpload}
                className="mt-2 text-sm text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Output
              </label>
              <textarea
                value={textOutput}
                readOnly
                placeholder="Converted text will appear here..."
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none resize-y"
              />
              <button
                onClick={copyToClipboard}
                className="mt-2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Conversion Options</h2>
            <div className="grid gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.preserveLineBreaks}
                  onChange={(e) => handleOptionChange('preserveLineBreaks', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Preserve Line Breaks
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.removeTags}
                  onChange={(e) => handleOptionChange('removeTags', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Remove HTML Tags
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.trimWhitespace}
                  onChange={(e) => handleOptionChange('trimWhitespace', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Trim Whitespace
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.decodeEntities}
                  onChange={(e) => handleOptionChange('decodeEntities', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Decode HTML Entities
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
              <li>Converts HTML to plain text</li>
              <li>Live preview as you type</li>
              <li>File upload support (.html, .txt)</li>
              <li>Customizable conversion options</li>
              <li>Copy output to clipboard</li>
              <li>Example: &lt;p&gt;Hello&lt;/p&gt; → Hello</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default HtmlToText;