'use client';

import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // Choose your preferred highlight.js theme

const MarkdownToHtml = () => {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [options, setOptions] = useState({
    gfm: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    highlight: true,
  });

  // Configure marked with highlight.js
  useEffect(() => {
    marked.setOptions({
      ...options,
      highlight: options.highlight
        ? (code, lang) => {
            try {
              return lang && hljs.getLanguage(lang)
                ? hljs.highlight(code, { language: lang }).value
                : hljs.highlightAuto(code).value;
            } catch {
              return code;
            }
          }
        : null,
    });
    convertMarkdown();
  }, [markdown, options]);

  const convertMarkdown = () => {
    try {
      const parsedHtml = marked.parse(markdown);
      setHtml(parsedHtml);
    } catch (err) {
      setHtml(`<p>Error parsing Markdown: ${err.message}</p>`);
    }
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const exportToFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Markdown to HTML Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Markdown Input
              </label>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Enter your Markdown here..."
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>

            {/* Options */}
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Rendering Options</h2>
              <div className="grid gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.gfm}
                    onChange={(e) => handleOptionChange('gfm', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  GitHub Flavored Markdown (GFM)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.breaks}
                    onChange={(e) => handleOptionChange('breaks', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Line Breaks
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.pedantic}
                    onChange={(e) => handleOptionChange('pedantic', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Pedantic Mode (strict Markdown)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.sanitize}
                    onChange={(e) => handleOptionChange('sanitize', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Sanitize HTML
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.highlight}
                    onChange={(e) => handleOptionChange('highlight', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Syntax Highlighting
                </label>
              </div>
            </div>

            {/* Toggle Preview */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTML Output
              </label>
              <textarea
                value={html}
                readOnly
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 resize-y"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => exportToFile(html, 'output.html', 'text/html')}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Export HTML
                </button>
                <button
                  onClick={() => exportToFile(markdown, 'input.md', 'text/markdown')}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                >
                  Export Markdown
                </button>
              </div>
            </div>

            {showPreview && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Live Preview
                </label>
                <div
                  className="p-4 border border-gray-300 rounded-md bg-white prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert Markdown to HTML with real-time updates</li>
              <li>Supports GFM, line breaks, and syntax highlighting</li>
              <li>Live preview toggleable</li>
              <li>Export as HTML or Markdown files</li>
              <li>Customizable rendering options</li>
              <li>Example: `# Heading\n**Bold** text` → `<h1>Heading</h1><p><strong>Bold</strong> text</p>`</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default MarkdownToHtml;