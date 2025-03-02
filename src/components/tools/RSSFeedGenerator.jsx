"use client";

import React, { useState } from 'react';

const RSSFeedGenerator = () => {
  const [channel, setChannel] = useState({
    title: '',
    link: '',
    description: ''
  });
  const [items, setItems] = useState([{ title: '', link: '', description: '', pubDate: '' }]);
  const [generatedFeed, setGeneratedFeed] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const updateChannel = (field, value) => {
    setChannel(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setItems([...items, { title: '', link: '', description: '', pubDate: '' }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const generateRSSFeed = () => {
    setError(null);
    setGeneratedFeed('');
    setCopied(false);

    // Basic validation
    if (!channel.title.trim() || !channel.link.trim() || !channel.description.trim()) {
      setError('Please fill in all channel fields');
      return;
    }

    if (items.some(item => !item.title.trim() || !item.link.trim())) {
      setError('All items must have a title and link');
      return;
    }

    try {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXML(channel.title)}</title>
    <link>${escapeXML(channel.link)}</link>
    <description>${escapeXML(channel.description)}</description>
${items.map(item => `    <item>
      <title>${escapeXML(item.title)}</title>
      <link>${escapeXML(item.link)}</link>
      <description>${escapeXML(item.description)}</description>
${item.pubDate ? `      <pubDate>${escapeXML(item.pubDate)}</pubDate>` : ''}
    </item>`).join('\n')}
  </channel>
</rss>`;

      setGeneratedFeed(formatXML(xml));
    } catch (err) {
      setError('Error generating RSS feed: ' + err.message);
    }
  };

  const escapeXML = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const formatXML = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    const formatNode = (node, level = 0) => {
      const indent = '  '.repeat(level);
      let result = '';

      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName;
        const attributes = Array.from(node.attributes)
          .map(attr => `${attr.name}="${attr.value}"`)
          .join(' ');
        
        result += `${indent}<${tagName}${attributes ? ' ' + attributes : ''}`;

        const children = Array.from(node.childNodes);
        if (children.length === 0) {
          result += ' />\n';
        } else {
          result += '>\n';
          children.forEach(child => {
            result += formatNode(child, level + 1);
          });
          result += `${indent}</${tagName}>\n`;
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        result += `${indent}${node.textContent.trim()}\n`;
      }

      return result;
    };

    return formatNode(xmlDoc.documentElement).trim();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateRSSFeed();
  };

  const handleCopy = () => {
    if (generatedFeed) {
      navigator.clipboard.writeText(generatedFeed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">RSS Feed Generator</h2>

        {/* Channel Form */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 mb-2">Channel Information</h3>
          <div className="space-y-2">
            <input
              type="text"
              value={channel.title}
              onChange={(e) => updateChannel('title', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Channel Title"
            />
            <input
              type="url"
              value={channel.link}
              onChange={(e) => updateChannel('link', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Channel Link (e.g., https://example.com)"
            />
            <textarea
              value={channel.description}
              onChange={(e) => updateChannel('description', e.target.value)}
              className="w-full h-24 p-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Channel Description"
            />
          </div>

          {/* Items Form */}
          <h3 className="font-semibold text-gray-700 mb-2 mt-6">Feed Items</h3>
          {items.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-md space-y-2">
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Item Title"
              />
              <input
                type="url"
                value={item.link}
                onChange={(e) => updateItem(index, 'link', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Item Link (e.g., https://example.com/post)"
              />
              <textarea
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                className="w-full h-20 p-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Item Description"
              />
              <input
                type="text"
                value={item.pubDate}
                onChange={(e) => updateItem(index, 'pubDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Publication Date (e.g., Mon, 01 Jan 2023 12:00:00 GMT)"
              />
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(index)}
                  className="w-full py-1 text-sm text-red-600 hover:text-red-800"
                >
                  Remove Item
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Add Item
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleSubmit}
          className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Generate RSS Feed
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Generated Feed */}
        {generatedFeed && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Generated RSS Feed</h3>
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
              {generatedFeed}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default RSSFeedGenerator;