'use client'
import React, { useState, useEffect } from 'react';
import htmlToMarkdown from 'html-to-md';

const HtmlToMarkdown = () => {
  const [htmlInput, setHtmlInput] = useState('');
  const [markdownOutput, setMarkdownOutput] = useState('');
  const [error, setError] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [liveConvert, setLiveConvert] = useState(false);
  const [conversionOptions, setConversionOptions] = useState({
    preserveTags: false,
    tableSupport: true,
  });

  // Validate HTML
  const validateHTML = (html) => {
    if (!html.trim()) return 'HTML input is empty';
    if (!html.includes('<') || !html.includes('>')) return 'Input doesn’t appear to be valid HTML';
    return '';
  };

  // Convert HTML to Markdown
  const convertToMarkdown = () => {
    const validationError = validateHTML(htmlInput);
    if (validationError) {
      setError(validationError);
      setMarkdownOutput('');
      return;
    }

    try {
      setError('');
      const markdown = htmlToMarkdown(htmlInput, {
        preserveTags: conversionOptions.preserveTags ? ['<custom-tag>'] : [],
        ignore: conversionOptions.tableSupport ? [] : ['table', 'tr', 'td', 'th'],
      });
      setMarkdownOutput(markdown);
    } catch (err) {
      setError('Conversion error: ' + err.message);
      setMarkdownOutput('');
    }
  };

  // Handle live conversion
  useEffect(() => {
    if (liveConvert && htmlInput) {
      convertToMarkdown();
    }
  }, [htmlInput, liveConvert, conversionOptions]);

  // Handle file upload
  const handleFileUpload = (file) => {
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const htmlData = event.target.result;
      setHtmlInput(htmlData);
      const validationError = validateHTML(htmlData);
      if (validationError) {
        setError(validationError);
        setMarkdownOutput('');
      } else {
        try {
          const markdown = htmlToMarkdown(htmlData, {
            preserveTags: conversionOptions.preserveTags ? ['<custom-tag>'] : [],
            ignore: conversionOptions.tableSupport ? [] : ['table', 'tr', 'td', 'th'],
          });
          setMarkdownOutput(markdown);
        } catch (err) {
          setError('File conversion error: ' + err.message);
          setMarkdownOutput('');
        }
      }
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError('Error reading file');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/html' || file.name.match(/\.(html|htm)$/))) {
      handleFileUpload(file);
    } else {
      setError('Please drop a valid HTML file (.html or .htm)');
    }
  };

  // Handle copy
  const handleCopy = () => {
    if (markdownOutput) {
      navigator.clipboard.writeText(markdownOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (markdownOutput) {
      const blob = new Blob([markdownOutput], { type: 'text/markdown;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'content.md';
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  // Clear all
  const clearAll = () => {
    setHtmlInput('');
    setMarkdownOutput('');
    setError('');
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="relative bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Markdown copied to clipboard!
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">HTML to Markdown Converter</h1>
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
            disabled={isLoading}
          >
            Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Conversion Options */}
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Conversion Options</h3>
          <div className="flex gap-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={liveConvert}
                onChange={(e) => setLiveConvert(e.target.checked)}
                className="mr-2"
                disabled={isLoading}
              />
              Live Conversion
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={conversionOptions.preserveTags}
                onChange={(e) => setConversionOptions(prev => ({ ...prev, preserveTags: e.target.checked }))}
                className="mr-2"
                disabled={isLoading}
              />
              Preserve Custom Tags
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={conversionOptions.tableSupport}
                onChange={(e) => setConversionOptions(prev => ({ ...prev, tableSupport: e.target.checked }))}
                className="mr-2"
                disabled={isLoading}
              />
              Table Support
            </label>
          </div>
        </div>

        {/* HTML Input */}
        <div 
          className={`mb-6 border-2 rounded-md ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex justify-between items-center mb-2 p-2">
            <label className="block text-sm font-medium text-gray-700">
              Enter HTML Content
            </label>
            <div className="flex gap-2">
              <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                Upload File
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  accept=".html,.htm"
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                disabled={!htmlInput || isLoading}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
          </div>
          {showPreview ? (
            <div 
              className="w-full h-40 p-3 border-t border-gray-300 rounded-b-md bg-white overflow-auto text-sm"
              dangerouslySetInnerHTML={{ __html: htmlInput }}
              aria-label="HTML preview"
            />
          ) : (
            <textarea
              value={htmlInput}
              onChange={(e) => {
                setHtmlInput(e.target.value);
                if (!liveConvert) {
                  setMarkdownOutput('');
                  setError('');
                }
              }}
              placeholder="Paste your HTML here or drag-and-drop a file (e.g., <p>Hello <strong>World</strong></p>)"
              className="w-full h-40 px-3 py-2 border-t border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
              aria-label="HTML input"
              disabled={isLoading}
            />
          )}
          {!liveConvert && (
            <button
              onClick={convertToMarkdown}
              className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              disabled={isLoading || !htmlInput.trim()}
            >
              {isLoading ? 'Converting...' : 'Convert to Markdown'}
            </button>
          )}
        </div>

        {/* Markdown Output */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Markdown Output
          </label>
          <textarea
            value={markdownOutput}
            readOnly
            placeholder="Markdown output will appear here"
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-y"
            aria-label="Markdown output"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCopy}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              disabled={!markdownOutput || isLoading}
            >
              Copy Markdown
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              disabled={!markdownOutput || isLoading}
            >
              Download .md
            </button>
          </div>
        </div>

        {/* Example */}
        <div className="text-sm text-gray-600">
          <p>Example input:</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            {`<h1>Title</h1>
<p>Hello <strong>World</strong></p>
<table>
  <tr><th>Name</th><th>Age</th></tr>
  <tr><td>John</td><td>30</td></tr>
</table>`}
          </pre>
          <p className="mt-2">Example output (with table support):</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            {`# Title

Hello **World**

| Name | Age |
|------|-----|
| John | 30  |`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default HtmlToMarkdown;