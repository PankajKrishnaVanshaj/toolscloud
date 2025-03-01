"use client";

import React, { useState } from 'react';

const SitemapGenerator = () => {
  const [urls, setUrls] = useState([{ url: '', priority: '0.5', changefreq: 'monthly', lastmod: '' }]);
  const [generatedSitemap, setGeneratedSitemap] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const frequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
  const priorities = ['0.0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0'];

  const addUrl = () => {
    setUrls([...urls, { url: '', priority: '0.5', changefreq: 'monthly', lastmod: '' }]);
  };

  const updateUrl = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  const removeUrl = (index) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const generateSitemap = () => {
    setError(null);
    setGeneratedSitemap('');
    setCopied(false);

    if (urls.every(u => !u.url.trim())) {
      setError('Please provide at least one valid URL');
      return;
    }

    try {
      const validUrls = urls.filter(u => u.url.trim());
      if (validUrls.length === 0) throw new Error('No valid URLs provided');

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${validUrls.map(({ url, priority, changefreq, lastmod }) => {
  let entry = `  <url>\n    <loc>${encodeURI(url)}</loc>`;
  if (priority) entry += `\n    <priority>${priority}</priority>`;
  if (changefreq) entry += `\n    <changefreq>${changefreq}</changefreq>`;
  if (lastmod) entry += `\n    <lastmod>${lastmod}</lastmod>`;
  entry += '\n  </url>';
  return entry;
}).join('\n')}
</urlset>`;

      setGeneratedSitemap(sitemap);
    } catch (err) {
      setError('Error generating sitemap: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateSitemap();
  };

  const handleCopy = () => {
    if (generatedSitemap) {
      navigator.clipboard.writeText(generatedSitemap);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Sitemap Generator</h2>

        {/* URL Inputs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 mb-2">Add URLs</h3>
          {urls.map((urlEntry, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-md space-y-3">
              <div className="flex gap-4">
                <input
                  type="url"
                  value={urlEntry.url}
                  onChange={(e) => updateUrl(index, 'url', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/page"
                />
                <select
                  value={urlEntry.priority}
                  onChange={(e) => updateUrl(index, 'priority', e.target.value)}
                  className="w-24 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorities.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select
                  value={urlEntry.changefreq}
                  onChange={(e) => updateUrl(index, 'changefreq', e.target.value)}
                  className="w-32 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {frequencies.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={urlEntry.lastmod}
                  onChange={(e) => updateUrl(index, 'lastmod', e.target.value)}
                  className="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {urls.length > 1 && (
                  <button
                    onClick={() => removeUrl(index)}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={addUrl}
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Add URL
          </button>
        </div>

        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Sitemap
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Generated Sitemap */}
        {generatedSitemap && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Generated XML Sitemap</h3>
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
              {generatedSitemap}
            </pre>
          </div>
        )}

        {/* Notes */}
        {!generatedSitemap && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Enter URLs and optional metadata to generate an XML sitemap.</p>
            <p className="mt-1">Fields:</p>
            <ul className="list-disc pl-5">
              <li>URL: The page address (required)</li>
              <li>Priority: 0.0 to 1.0 (default: 0.5)</li>
              <li>Change Frequency: How often the page changes</li>
              <li>Last Modified: Date of last update (optional)</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SitemapGenerator;