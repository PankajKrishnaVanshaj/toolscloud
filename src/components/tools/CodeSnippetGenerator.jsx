"use client";

import React, { useState } from 'react';

const CodeSnippetGenerator = () => {
  const [language, setLanguage] = useState('javascript');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [format, setFormat] = useState('plain');
  const [generatedSnippet, setGeneratedSnippet] = useState('');
  const [copied, setCopied] = useState(false);

  const languages = ['javascript', 'python', 'java', 'cpp', 'html', 'css'];
  const formats = [
    { value: 'plain', label: 'Plain Text' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'html', label: 'HTML' }
  ];

  const generateSnippet = () => {
    if (!code.trim()) {
      setGeneratedSnippet('Please enter some code');
      setCopied(false);
      return;
    }

    let snippet = '';
    switch (format) {
      case 'plain':
        snippet = code;
        break;
      case 'markdown':
        snippet = description.trim() 
          ? `### ${description}\n\n\`\`\`${language}\n${code}\n\`\`\``
          : `\`\`\`${language}\n${code}\n\`\`\``;
        break;
      case 'html':
        const escapedCode = code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
        snippet = description.trim()
          ? `<pre><code class="${language}">\n${escapedCode}\n</code></pre>\n<p>${description}</p>`
          : `<pre><code class="${language}">\n${escapedCode}\n</code></pre>`;
        break;
      default:
        snippet = code;
    }

    setGeneratedSnippet(snippet);
    setCopied(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateSnippet();
  };

  const handleCopy = () => {
    if (generatedSnippet && generatedSnippet !== 'Please enter some code') {
      navigator.clipboard.writeText(generatedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedSnippet && generatedSnippet !== 'Please enter some code') {
      const blob = new Blob([generatedSnippet], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `snippet.${format === 'markdown' ? 'md' : format === 'html' ? 'html' : 'txt'}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Code Snippet Generator</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formats.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Function to add two numbers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`function add(a, b) {\n  return a + b;\n}`}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Snippet
          </button>
        </form>

        {/* Generated Snippet */}
        {generatedSnippet && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Generated {formats.find(f => f.value === format).label} Snippet</h3>
              <div className="space-x-2">
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
              {generatedSnippet}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeSnippetGenerator;