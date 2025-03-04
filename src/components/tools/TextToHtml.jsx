'use client';

import React, { useState } from 'react';

const TextToHtml = () => {
  const [text, setText] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [options, setOptions] = useState({
    headings: true,
    bold: true,
    italic: true,
    lists: true,
    links: true,
    code: true,
    wrapInHtml: false,
  });
  const [previewMode, setPreviewMode] = useState('html'); // 'html' or 'rendered'

  const convertTextToHtml = () => {
    let result = text.trim();

    // Apply formatting based on options
    if (options.headings) {
      result = result
        .replace(/^### (.*)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*)$/gm, '<h1>$1</h1>');
    }
    if (options.bold) {
      result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }
    if (options.italic) {
      result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    if (options.lists) {
      result = result
        .replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        .replace(/^\s*\d+\.\s+(.*)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, match => match.includes('</ul>') ? match : `<ol>${match}</ol>`);
    }
    if (options.links) {
      result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    }
    if (options.code) {
      result = result
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    // Convert newlines to paragraphs
    result = result
      .split('\n\n')
      .map(paragraph => paragraph.trim() ? `<p>${paragraph}</p>` : '')
      .join('');

    // Clean up any leftover newlines within paragraphs
    result = result.replace(/\n/g, '<br>');

    if (options.wrapInHtml) {
      result = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Text</title>
</head>
<body>
    ${result}
</body>
</html>`;
    }

    setHtmlOutput(result);
  };

  const handleTextChange = (value) => {
    setText(value);
    convertTextToHtml();
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      setOptions(newOptions);
      convertTextToHtml();
      return newOptions;
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlOutput);
  };

  const exportHtml = () => {
    const blob = new Blob([htmlOutput], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Text to HTML Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plain Text Input
              </label>
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter text with Markdown-like syntax..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Preview
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setPreviewMode('html')}
                  className={`px-3 py-1 rounded-md ${previewMode === 'html' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white`}
                >
                  HTML Code
                </button>
                <button
                  onClick={() => setPreviewMode('rendered')}
                  className={`px-3 py-1 rounded-md ${previewMode === 'rendered' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white`}
                >
                  Rendered
                </button>
              </div>
              {previewMode === 'html' ? (
                <textarea
                  value={htmlOutput}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 h-40 resize-y font-mono text-sm"
                />
              ) : (
                <div
                  className="w-full p-3 border border-gray-300 rounded-md bg-white h-40 overflow-auto"
                  dangerouslySetInnerHTML={{ __html: htmlOutput }}
                />
              )}
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Formatting Options</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.headings}
                  onChange={(e) => handleOptionChange('headings', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Headings (#, ##, ###)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.bold}
                  onChange={(e) => handleOptionChange('bold', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Bold (**text**)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.italic}
                  onChange={(e) => handleOptionChange('italic', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Italic (*text*)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.lists}
                  onChange={(e) => handleOptionChange('lists', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Lists (- or 1.)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.links}
                  onChange={(e) => handleOptionChange('links', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Links ([text](url))
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.code}
                  onChange={(e) => handleOptionChange('code', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Code (` or ```)
              </label>
              <label className="flex items-center gap-2 col-span-2">
                <input
                  type="checkbox"
                  checked={options.wrapInHtml}
                  onChange={(e) => handleOptionChange('wrapInHtml', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Wrap in Full HTML Document
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={copyToClipboard}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              disabled={!htmlOutput}
            >
              Copy to Clipboard
            </button>
            <button
              onClick={exportHtml}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={!htmlOutput}
            >
              Export as HTML
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Syntax</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert text to HTML with Markdown-like syntax</li>
              <li>Live preview (HTML code or rendered)</li>
              <li>Customizable formatting options</li>
              <li>Export as HTML file or copy to clipboard</li>
              <li>Syntax examples:</li>
              <li># Heading, **bold**, *italic*, - list, [link](url), `code`, ```multiline code```</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TextToHtml;