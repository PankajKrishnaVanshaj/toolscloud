"use client";

import React, { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// Supported languages list
const languages = [
  'javascript', 'python', 'java', 'cpp', 'csharp', 'ruby', 'php', 
  'typescript', 'go', 'rust', 'kotlin', 'swift', 'html', 'css', 'sql'
];

const CodeSyntaxHighlighter = () => {
  const [code, setCode] = useState(`function example() {
  const message = "Hello, World!";
  console.log(message);
  return message;
}`);
  const [language, setLanguage] = useState('javascript');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy code');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 font-sans">
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl">
        {/* Header */}
        <div className="px-4 py-2 bg-gray-800 flex items-center justify-between gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 rounded text-sm transition-colors ${
                isCopied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
              onClick={handleCopy}
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
            <button
              className="px-3 py-1 rounded text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
              onClick={() => setCode('')}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Code Editor Input */}
        <div className="p-4 bg-gray-800">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-48 bg-gray-800 text-white font-mono text-sm border border-gray-700 rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
            placeholder="Type your code here..."
            spellCheck="false"
            wrap="off"
          />
        </div>

        {/* Syntax Highlighted Output */}
        <div className="border-t border-gray-700">
          <SyntaxHighlighter
            language={language}
            style={dracula}
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.9rem',
              background: 'transparent',
              minHeight: '100px',
            }}
            showLineNumbers={true}
            wrapLongLines={true}
            lineNumberStyle={{
              paddingRight: '1rem',
              opacity: 0.5,
            }}
          >
            {code || '// Start typing above...'}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default CodeSyntaxHighlighter;