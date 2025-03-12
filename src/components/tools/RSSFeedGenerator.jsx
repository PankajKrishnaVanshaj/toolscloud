"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaPlus, FaTrash, FaSync } from "react-icons/fa";

const RSSFeedGenerator = () => {
  const [channel, setChannel] = useState({
    title: "",
    link: "",
    description: "",
    language: "en-us",
    lastBuildDate: "",
    ttl: "",
  });
  const [items, setItems] = useState([{ 
    title: "", 
    link: "", 
    description: "", 
    pubDate: "", 
    guid: "", 
    category: "" 
  }]);
  const [generatedFeed, setGeneratedFeed] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const updateChannel = (field, value) => {
    setChannel((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setItems([...items, { title: "", link: "", description: "", pubDate: "", guid: "", category: "" }]);
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

  const generateRSSFeed = useCallback(() => {
    setError(null);
    setGeneratedFeed("");
    setCopied(false);

    // Enhanced validation
    if (!channel.title.trim() || !channel.link.trim() || !channel.description.trim()) {
      setError("Please fill in all required channel fields (Title, Link, Description)");
      return;
    }
    if (!/^(https?:\/\/)/.test(channel.link)) {
      setError("Channel link must be a valid URL (http/https)");
      return;
    }
    if (items.some(item => !item.title.trim() || !item.link.trim())) {
      setError("All items must have a title and link");
      return;
    }

    try {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXML(channel.title)}</title>
    <link>${escapeXML(channel.link)}</link>
    <description>${escapeXML(channel.description)}</description>
    ${channel.language ? `<language>${escapeXML(channel.language)}</language>` : ""}
    ${channel.lastBuildDate ? `<lastBuildDate>${escapeXML(channel.lastBuildDate)}</lastBuildDate>` : ""}
    ${channel.ttl ? `<ttl>${escapeXML(channel.ttl)}</ttl>` : ""}
    <atom:link href="${escapeXML(channel.link)}/rss" rel="self" type="application/rss+xml" />
${items.map(item => `    <item>
      <title>${escapeXML(item.title)}</title>
      <link>${escapeXML(item.link)}</link>
      <description>${escapeXML(item.description)}</description>
      ${item.pubDate ? `<pubDate>${escapeXML(item.pubDate)}</pubDate>` : ""}
      ${item.guid ? `<guid isPermaLink="false">${escapeXML(item.guid)}</guid>` : ""}
      ${item.category ? `<category>${escapeXML(item.category)}</category>` : ""}
    </item>`).join("\n")}
  </channel>
</rss>`;

      const formattedXML = formatXML(xml);
      setGeneratedFeed(formattedXML);
      setHistory(prev => [...prev, formattedXML].slice(-5));
    } catch (err) {
      setError("Error generating RSS feed: " + err.message);
    }
  }, [channel, items]);

  const escapeXML = (str) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const formatXML = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");
    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc).replace(/></g, ">\n<");
  };

  const handleCopy = () => {
    if (generatedFeed) {
      navigator.clipboard.writeText(generatedFeed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedFeed) {
      const blob = new Blob([generatedFeed], { type: "application/rss+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rss-feed-${Date.now()}.xml`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setChannel({ title: "", link: "", description: "", language: "en-us", lastBuildDate: "", ttl: "" });
    setItems([{ title: "", link: "", description: "", pubDate: "", guid: "", category: "" }]);
    setGeneratedFeed("");
    setError(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">RSS Feed Generator</h2>

        {/* Channel Form */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Channel Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: "title", placeholder: "Channel Title", required: true },
              { id: "link", placeholder: "Channel Link (e.g., https://example.com)", type: "url", required: true },
              { id: "description", placeholder: "Channel Description", textarea: true, required: true },
              { id: "language", placeholder: "Language (e.g., en-us)" },
              { id: "lastBuildDate", placeholder: "Last Build Date (e.g., Mon, 01 Jan 2023 12:00:00 GMT)" },
              { id: "ttl", placeholder: "TTL (minutes)", type: "number" },
            ].map(field => (
              <div key={field.id} className="space-y-1">
                {field.textarea ? (
                  <textarea
                    value={channel[field.id]}
                    onChange={(e) => updateChannel(field.id, e.target.value)}
                    className="w-full h-24 p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type || "text"}
                    value={channel[field.id]}
                    onChange={(e) => updateChannel(field.id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Items Form */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Feed Items</h3>
          {items.map((item, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "title", placeholder: "Item Title", required: true },
                  { id: "link", placeholder: "Item Link (e.g., https://example.com/post)", type: "url", required: true },
                  { id: "description", placeholder: "Item Description", textarea: true },
                  { id: "pubDate", placeholder: "Publication Date (e.g., Mon, 01 Jan 2023 12:00:00 GMT)" },
                  { id: "guid", placeholder: "GUID (unique identifier)" },
                  { id: "category", placeholder: "Category" },
                ].map(field => (
                  <div key={field.id} className="space-y-1">
                    {field.textarea ? (
                      <textarea
                        value={item[field.id]}
                        onChange={(e) => updateItem(index, field.id, e.target.value)}
                        className="w-full h-20 p-3 border border-gray-300 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type || "text"}
                        value={item[field.id]}
                        onChange={(e) => updateItem(index, field.id, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(index)}
                  className="w-full py-2 text-sm text-red-600 hover:text-red-800 flex items-center justify-center"
                >
                  <FaTrash className="mr-2" /> Remove Item
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Add Item
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={generateRSSFeed}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Generate RSS Feed
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Generated Feed */}
        {generatedFeed && (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-3">
              <h3 className="text-lg font-semibold text-gray-700">Generated RSS Feed</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`py-2 px-4 rounded-lg transition-colors flex items-center ${
                    copied ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200 max-h-96 overflow-auto">
              {generatedFeed}
            </pre>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Recent Feeds (Last 5)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((feed, index) => (
                <li key={index} className="truncate">
                  {feed.slice(0, 100)}...
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports multiple feed items</li>
            <li>Extended channel metadata (language, TTL, last build date)</li>
            <li>Item GUID and category support</li>
            <li>Copy and download options</li>
            <li>Feed history tracking</li>
            <li>Enhanced validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RSSFeedGenerator;