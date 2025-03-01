"use client";

import React, { useState } from 'react';

const RobotsTxtGenerator = () => {
  const [userAgents, setUserAgents] = useState([{ name: '*', rules: [{ type: 'Allow', path: '' }] }]);
  const [crawlDelay, setCrawlDelay] = useState('');
  const [sitemap, setSitemap] = useState('');
  const [generatedTxt, setGeneratedTxt] = useState('');
  const [copied, setCopied] = useState(false);

  const addUserAgent = () => {
    setUserAgents([...userAgents, { name: '', rules: [{ type: 'Allow', path: '' }] }]);
  };

  const updateUserAgent = (index, field, value) => {
    const newUserAgents = [...userAgents];
    newUserAgents[index][field] = value;
    setUserAgents(newUserAgents);
  };

  const addRule = (agentIndex) => {
    const newUserAgents = [...userAgents];
    newUserAgents[agentIndex].rules.push({ type: 'Allow', path: '' });
    setUserAgents(newUserAgents);
  };

  const updateRule = (agentIndex, ruleIndex, field, value) => {
    const newUserAgents = [...userAgents];
    newUserAgents[agentIndex].rules[ruleIndex][field] = value;
    setUserAgents(newUserAgents);
  };

  const removeRule = (agentIndex, ruleIndex) => {
    const newUserAgents = [...userAgents];
    if (newUserAgents[agentIndex].rules.length > 1) {
      newUserAgents[agentIndex].rules = newUserAgents[agentIndex].rules.filter((_, i) => i !== ruleIndex);
      setUserAgents(newUserAgents);
    }
  };

  const removeUserAgent = (index) => {
    if (userAgents.length > 1) {
      setUserAgents(userAgents.filter((_, i) => i !== index));
    }
  };

  const generateRobotsTxt = () => {
    let txt = '# Generated robots.txt\n';

    userAgents.forEach(agent => {
      if (agent.name.trim()) {
        txt += `\nUser-agent: ${agent.name}\n`;
        agent.rules.forEach(rule => {
          if (rule.path.trim()) {
            txt += `${rule.type}: ${rule.path}\n`;
          }
        });
      }
    });

    if (crawlDelay.trim() && !isNaN(crawlDelay) && Number(crawlDelay) >= 0) {
      txt += `\nCrawl-delay: ${crawlDelay}\n`;
    }

    if (sitemap.trim()) {
      txt += `\nSitemap: ${sitemap}\n`;
    }

    setGeneratedTxt(txt.trim());
    setCopied(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateRobotsTxt();
  };

  const handleCopy = () => {
    if (generatedTxt) {
      navigator.clipboard.writeText(generatedTxt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedTxt) {
      const blob = new Blob([generatedTxt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'robots.txt';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Robots.txt Generator</h2>

        {/* User Agents and Rules */}
        <div className="space-y-4">
          {userAgents.map((agent, agentIndex) => (
            <div key={agentIndex} className="p-4 bg-gray-50 rounded-md space-y-3">
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => updateUserAgent(agentIndex, 'name', e.target.value)}
                  className="w-1/3 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="User-agent (e.g., *, Googlebot)"
                />
                {userAgents.length > 1 && (
                  <button
                    onClick={() => removeUserAgent(agentIndex)}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Agent
                  </button>
                )}
              </div>
              {agent.rules.map((rule, ruleIndex) => (
                <div key={ruleIndex} className="flex gap-2 items-center">
                  <select
                    value={rule.type}
                    onChange={(e) => updateRule(agentIndex, ruleIndex, 'type', e.target.value)}
                    className="w-1/4 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Allow">Allow</option>
                    <option value="Disallow">Disallow</option>
                  </select>
                  <input
                    type="text"
                    value={rule.path}
                    onChange={(e) => updateRule(agentIndex, ruleIndex, 'path', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/path/to/resource"
                  />
                  {agent.rules.length > 1 && (
                    <button
                      onClick={() => removeRule(agentIndex, ruleIndex)}
                      className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addRule(agentIndex)}
                className="text-sm text-blue-600 hover:underline"
              >
                + Add Rule
              </button>
            </div>
          ))}
          <button
            onClick={addUserAgent}
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Add User Agent
          </button>
        </div>

        {/* Additional Settings */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Crawl Delay (seconds)
            </label>
            <input
              type="number"
              value={crawlDelay}
              onChange={(e) => setCrawlDelay(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 5"
              min="0"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sitemap URL
            </label>
            <input
              type="url"
              value={sitemap}
              onChange={(e) => setSitemap(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/sitemap.xml"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate robots.txt
          </button>
        </div>

        {/* Generated robots.txt */}
        {generatedTxt && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Generated robots.txt</h3>
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
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {generatedTxt}
            </pre>
          </div>
        )}

        {/* Notes */}
        {!generatedTxt && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Define rules for web crawlers to generate a robots.txt file.</p>
            <p className="mt-1">Example:</p>
            <pre className="font-mono">
{`User-agent: *
Disallow: /admin/
Allow: /
Crawl-delay: 5
Sitemap: https://example.com/sitemap.xml`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default RobotsTxtGenerator;