"use client";

import React, { useState, useCallback } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula, vs, solarizedLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FaCopy, FaTrash, FaDownload, FaExpand, FaCompress } from 'react-icons/fa';

// Supported languages list
const languages = [
  'javascript', 'python', 'java', 'cpp', 'csharp', 'ruby', 'php',
  'typescript', 'go', 'rust', 'kotlin', 'swift', 'html', 'css', 'sql',
  'json', 'xml', 'yaml', 'markdown', 'bash'
];

// Themes list
const themes = {
  dracula: dracula,
  vs: vs,
  solarizedLight: solarizedLight,
};

const CodeSyntaxHighlighter = () => {
  const [code, setCode] = useState(`function example() {
  const message = "Hello, World!";
  console.log(message);
  return message;
}`);
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('dracula');
  const [isCopied, setIsCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapLines, setWrapLines] = useState(true);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy code');
    }
  }, [code]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `code-${language}-${Date.now()}.${language === 'cpp' ? 'cpp' : language === 'csharp' ? 'cs' : language}`;
    link.click();
    URL.revokeObjectURL(url);
  }, [code, language]);

 

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8"> {/* Header */}
        <div className="bg-gray-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize w-full sm:w-auto"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize w-full sm:w-auto"
            >
              {Object.keys(themes).map((t) => (
                <option key={t} value={t}>
                  {t.replace(/([A-Z])/g, ' $1').trim()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopy}
              className={`p-2 rounded text-sm transition-colors ${isCopied ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
              title="Copy to clipboard"
            >
              <FaCopy />
              <span className="sr-only">Copy</span>
            </button>
            <button
              onClick={() => setCode('')}
              className="p-2 rounded text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
              title="Clear code"
            >
              <FaTrash />
              <span className="sr-only">Clear</span>
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
              title="Download code"
            >
              <FaDownload />
              <span className="sr-only">Download</span>
            </button>
           
          </div>
        </div>

        {/* Options Panel */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              Line Numbers
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={wrapLines}
                onChange={(e) => setWrapLines(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              Wrap Lines
            </label>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>Font Size:</span>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Math.max(8, Math.min(24, e.target.value)))}
                className="w-16 p-1 border rounded text-sm"
                min="8"
                max="24"
              />
            </div>
          </div>
        </div>

        {/* Code Editor Input */}
        <div className="p-4 bg-gray-800 flex-1">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-48 sm:h-64 bg-gray-800 text-white font-mono border border-gray-700 rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
            placeholder="Type your code here..."
            style={{ fontSize: `${fontSize}px` }}
            spellCheck="false"
            wrap={wrapLines ? "on" : "off"}
            aria-label="Code input"
          />
        </div>

        {/* Syntax Highlighted Output */}
        <div className="border-t border-gray-700">
          <SyntaxHighlighter
            language={language}
            style={themes[theme]}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'transparent',
              minHeight: '150px',
              fontSize: `${fontSize}px`,
            }}
            showLineNumbers={showLineNumbers}
            wrapLongLines={wrapLines}
            lineNumberStyle={{
              paddingRight: '1rem',
              opacity: 0.5,
            }}
          >
            {code || '// Start typing above...'}
          </SyntaxHighlighter>
        </div>

        {/* Features List */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Features:</h3>
          <ul className="list-disc list-inside text-sm text-gray-600">
            <li>Multiple languages and themes</li>
            <li>Customizable font size and line options</li>
            <li>Copy, clear, and download functionality</li>
            <li>Full-screen mode</li>
            <li>Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CodeSyntaxHighlighter;