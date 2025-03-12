"use client";

import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaCopy, FaDownload, FaSync } from "react-icons/fa";

const SitemapGenerator = () => {
  const [urls, setUrls] = useState([{ url: "", priority: "0.5", changefreq: "monthly", lastmod: "" }]);
  const [generatedSitemap, setGeneratedSitemap] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [formatOptions, setFormatOptions] = useState({
    prettyPrint: true,
    includeXmlHeader: true,
    includeDate: true,
  });

  const frequencies = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
  const priorities = ["0.0", "0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9", "1.0"];

  const addUrl = () => {
    setUrls([...urls, { url: "", priority: "0.5", changefreq: "monthly", lastmod: "" }]);
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

  const generateSitemap = useCallback(() => {
    setError(null);
    setGeneratedSitemap("");
    setCopied(false);

    const validUrls = urls.filter((u) => u.url.trim());
    if (validUrls.length === 0) {
      setError("Please provide at least one valid URL");
      return;
    }

    try {
      const indent = formatOptions.prettyPrint ? "  " : "";
      const newline = formatOptions.prettyPrint ? "\n" : "";
      let sitemap = formatOptions.includeXmlHeader
        ? `<?xml version="1.0" encoding="UTF-8"?>${newline}`
        : "";
      sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${newline}`;

      sitemap += validUrls
        .map(({ url, priority, changefreq, lastmod }) => {
          const isValidUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(url);
          if (!isValidUrl) throw new Error(`Invalid URL format: ${url}`);

          let entry = `${indent}<url>${newline}`;
          entry += `${indent}${indent}<loc>${encodeURI(url)}</loc>${newline}`;
          if (priority) entry += `${indent}${indent}<priority>${priority}</priority>${newline}`;
          if (changefreq) entry += `${indent}${indent}<changefreq>${changefreq}</changefreq>${newline}`;
          if (lastmod && formatOptions.includeDate)
            entry += `${indent}${indent}<lastmod>${lastmod || new Date().toISOString().split("T")[0]}</lastmod>${newline}`;
          entry += `${indent}</url>`;
          return entry;
        })
        .join(newline);

      sitemap += `${newline}</urlset>`;
      setGeneratedSitemap(sitemap);
    } catch (err) {
      setError("Error generating sitemap: " + err.message);
    }
  }, [urls, formatOptions]);

  const handleCopy = () => {
    if (generatedSitemap) {
      navigator.clipboard.writeText(generatedSitemap);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedSitemap) {
      const blob = new Blob([generatedSitemap], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sitemap-${Date.now()}.xml`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setUrls([{ url: "", priority: "0.5", changefreq: "monthly", lastmod: "" }]);
    setGeneratedSitemap("");
    setError(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Sitemap Generator</h2>

        {/* URL Inputs */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Add URLs</h3>
          <div className="space-y-4">
            {urls.map((urlEntry, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="url"
                  value={urlEntry.url}
                  onChange={(e) => updateUrl(index, "url", e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/page"
                  aria-label={`URL ${index + 1}`}
                />
                <select
                  value={urlEntry.priority}
                  onChange={(e) => updateUrl(index, "priority", e.target.value)}
                  className="w-full sm:w-24 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select
                  value={urlEntry.changefreq}
                  onChange={(e) => updateUrl(index, "changefreq", e.target.value)}
                  className="w-full sm:w-32 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {frequencies.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={urlEntry.lastmod}
                  onChange={(e) => updateUrl(index, "lastmod", e.target.value)}
                  className="w-full sm:w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {urls.length > 1 && (
                  <button
                    onClick={() => removeUrl(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 flex items-center"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addUrl}
              className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add URL
            </button>
          </div>
        </div>

        {/* Format Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Format Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(formatOptions).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setFormatOptions((prev) => ({ ...prev, [key]: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={generateSitemap}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Generate Sitemap
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={handleDownload}
            disabled={!generatedSitemap}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Generated Sitemap */}
        {generatedSitemap && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">Generated XML Sitemap</h3>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-md transition-colors flex items-center ${
                  copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200 max-h-96 overflow-auto">
              {generatedSitemap}
            </pre>
          </div>
        )}

        {/* Instructions */}
        {!generatedSitemap && !error && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">How to Use</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Add URLs with their metadata</li>
              <li>Priority: 0.0-1.0 (importance relative to other URLs)</li>
              <li>Change Frequency: How often content changes</li>
              <li>Last Modified: Optional date of last update</li>
              <li>Customize output format with options</li>
              <li>Generate, copy, or download the XML sitemap</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SitemapGenerator;