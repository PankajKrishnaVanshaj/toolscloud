"use client";

import React, { useState } from 'react';
import * as Diff from 'diff';

const DiffViewer = () => {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffResult, setDiffResult] = useState([]);
  const [viewMode, setViewMode] = useState('sideBySide'); // 'sideBySide' or 'inline'
  const [copied, setCopied] = useState(false);

  const computeDiff = () => {
    if (!text1.trim() && !text2.trim()) {
      setDiffResult([]);
      return;
    }

    const diff = Diff.diffLines(text1, text2, { ignoreWhitespace: true });
    setDiffResult(diff);
    setCopied(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    computeDiff();
  };

  const handleCopy = () => {
    if (diffResult.length > 0) {
      const diffText = diffResult
        .map(part => {
          const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
          return part.value.split('\n').map(line => line ? `${prefix}${line}` : '').join('\n');
        })
        .join('');
      navigator.clipboard.writeText(diffText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderSideBySide = () => {
    const oldLines = [];
    const newLines = [];
    diffResult.forEach(part => {
      const lines = part.value.split('\n').filter(line => line !== '');
      if (part.added) {
        newLines.push(...lines.map(line => ({ text: line, type: 'added' })));
        oldLines.push(...lines.map(() => ({ text: '', type: 'empty' })));
      } else if (part.removed) {
        oldLines.push(...lines.map(line => ({ text: line, type: 'removed' })));
        newLines.push(...lines.map(() => ({ text: '', type: 'empty' })));
      } else {
        oldLines.push(...lines.map(line => ({ text: line, type: 'unchanged' })));
        newLines.push(...lines.map(line => ({ text: line, type: 'unchanged' })));
      }
    });

    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Original Text</h3>
          <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
            {oldLines.map((line, index) => (
              <div
                key={index}
                className={`py-1 ${line.type === 'removed' ? 'bg-red-100' : line.type === 'empty' ? 'bg-gray-100' : ''}`}
              >
                {line.text}
              </div>
            ))}
          </pre>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">New Text</h3>
          <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
            {newLines.map((line, index) => (
              <div
                key={index}
                className={`py-1 ${line.type === 'added' ? 'bg-green-100' : line.type === 'empty' ? 'bg-gray-100' : ''}`}
              >
                {line.text}
              </div>
            ))}
          </pre>
        </div>
      </div>
    );
  };

  const renderInline = () => {
    return (
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Diff</h3>
        <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
          {diffResult.map((part, index) => (
            <span
              key={index}
              className={part.added ? 'bg-green-100' : part.removed ? 'bg-red-100' : ''}
            >
              {part.value}
            </span>
          ))}
        </pre>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Diff Viewer</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Text
              </label>
              <textarea
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter original text here..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Text
              </label>
              <textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new text here..."
              />
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                View Mode
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sideBySide">Side by Side</option>
                <option value="inline">Inline</option>
              </select>
            </div>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Compare
            </button>
          </div>
        </form>

        {/* Diff Result */}
        {diffResult.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Comparison Result</h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy Diff'}
              </button>
            </div>
            {viewMode === 'sideBySide' ? renderSideBySide() : renderInline()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffViewer;