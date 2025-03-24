"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaTrash, FaPlus } from "react-icons/fa";

const RobotsTxtGenerator = () => {
  const [userAgents, setUserAgents] = useState([{ name: "*", rules: [{ type: "Allow", path: "/" }] }]);
  const [crawlDelay, setCrawlDelay] = useState("");
  const [sitemaps, setSitemaps] = useState([""]);
  const [host, setHost] = useState("");
  const [generatedTxt, setGeneratedTxt] = useState("");
  const [copied, setCopied] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const validateInput = useCallback(() => {
    const errors = [];
    userAgents.forEach((agent, index) => {
      if (!agent.name.trim()) errors.push(`User-agent ${index + 1} name is required`);
      agent.rules.forEach((rule, rIndex) => {
        if (!rule.path.trim()) errors.push(`Path for rule ${rIndex + 1} in User-agent ${index + 1} is required`);
        if (!rule.path.startsWith("/")) errors.push(`Path for rule ${rIndex + 1} in User-agent ${index + 1} must start with /`);
      });
    });
    if (crawlDelay && (isNaN(crawlDelay) || Number(crawlDelay) < 0)) {
      errors.push("Crawl-delay must be a non-negative number");
    }
    sitemaps.forEach((sitemap, index) => {
      if (sitemap.trim() && !/^https?:\/\//.test(sitemap)) {
        errors.push(`Sitemap ${index + 1} must be a valid URL starting with http:// or https://`);
      }
    });
    if (host.trim() && !/^[a-zA-Z0-9.-]+$/.test(host)) {
      errors.push("Host must be a valid domain name");
    }
    setValidationErrors(errors);
    return errors.length === 0;
  }, [userAgents, crawlDelay, sitemaps, host]);

  const generateRobotsTxt = useCallback(() => {
    if (!validateInput()) return;

    let txt = "# Generated robots.txt\n";
    userAgents.forEach(agent => {
      if (agent.name.trim()) {
        txt += `\nUser-agent: ${agent.name}\n`;
        agent.rules.forEach(rule => {
          if (rule.path.trim()) txt += `${rule.type}: ${rule.path}\n`;
        });
      }
    });

    if (crawlDelay.trim() && !isNaN(crawlDelay) && Number(crawlDelay) >= 0) {
      txt += `\nCrawl-delay: ${crawlDelay}\n`;
    }

    sitemaps.forEach(sitemap => {
      if (sitemap.trim()) txt += `\nSitemap: ${sitemap}\n`;
    });

    if (host.trim()) {
      txt += `\nHost: ${host}\n`;
    }

    setGeneratedTxt(txt.trim());
    setCopied(false);
  }, [userAgents, crawlDelay, sitemaps, host, validateInput]);

  const addUserAgent = () => setUserAgents([...userAgents, { name: "", rules: [{ type: "Allow", path: "" }] }]);
  const addRule = (agentIndex) => {
    const newUserAgents = [...userAgents];
    newUserAgents[agentIndex].rules.push({ type: "Allow", path: "" });
    setUserAgents(newUserAgents);
  };
  const addSitemap = () => setSitemaps([...sitemaps, ""]);

  const updateUserAgent = (index, field, value) => {
    const newUserAgents = [...userAgents];
    newUserAgents[index][field] = value;
    setUserAgents(newUserAgents);
  };

  const updateRule = (agentIndex, ruleIndex, field, value) => {
    const newUserAgents = [...userAgents];
    newUserAgents[agentIndex].rules[ruleIndex][field] = value;
    setUserAgents(newUserAgents);
  };

  const updateSitemap = (index, value) => {
    const newSitemaps = [...sitemaps];
    newSitemaps[index] = value;
    setSitemaps(newSitemaps);
  };

  const removeUserAgent = (index) => userAgents.length > 1 && setUserAgents(userAgents.filter((_, i) => i !== index));
  const removeRule = (agentIndex, ruleIndex) => {
    const newUserAgents = [...userAgents];
    if (newUserAgents[agentIndex].rules.length > 1) {
      newUserAgents[agentIndex].rules = newUserAgents[agentIndex].rules.filter((_, i) => i !== ruleIndex);
      setUserAgents(newUserAgents);
    }
  };
  const removeSitemap = (index) => sitemaps.length > 1 && setSitemaps(sitemaps.filter((_, i) => i !== index));

  const handleCopy = () => {
    if (generatedTxt) {
      navigator.clipboard.writeText(generatedTxt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedTxt) {
      const blob = new Blob([generatedTxt], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "robots.txt";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setUserAgents([{ name: "*", rules: [{ type: "Allow", path: "/" }] }]);
    setCrawlDelay("");
    setSitemaps([""]);
    setHost("");
    setGeneratedTxt("");
    setValidationErrors([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Robots.txt Generator</h2>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* User Agents */}
        <div className="space-y-6 mb-6">
          {userAgents.map((agent, agentIndex) => (
            <div key={agentIndex} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-3">
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => updateUserAgent(agentIndex, "name", e.target.value)}
                  className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="User-agent (e.g., *, Googlebot)"
                />
                {userAgents.length > 1 && (
                  <button
                    onClick={() => removeUserAgent(agentIndex)}
                    className="text-red-600 hover:text-red-800 flex items-center"
                  >
                    <FaTrash className="mr-1" /> Remove Agent
                  </button>
                )}
              </div>
              {agent.rules.map((rule, ruleIndex) => (
                <div key={ruleIndex} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-2">
                  <select
                    value={rule.type}
                    onChange={(e) => updateRule(agentIndex, ruleIndex, "type", e.target.value)}
                    className="w-full sm:w-1/4 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Allow">Allow</option>
                    <option value="Disallow">Disallow</option>
                  </select>
                  <input
                    type="text"
                    value={rule.path}
                    onChange={(e) => updateRule(agentIndex, ruleIndex, "path", e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="/path/to/resource"
                  />
                  {agent.rules.length > 1 && (
                    <button
                      onClick={() => removeRule(agentIndex, ruleIndex)}
                      className="text-red-600 hover:text-red-800 flex items-center"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addRule(agentIndex)}
                className="mt-2 text-blue-600 hover:underline flex items-center"
              >
                <FaPlus className="mr-1" /> Add Rule
              </button>
            </div>
          ))}
          <button
            onClick={addUserAgent}
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Add User Agent
          </button>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crawl Delay (seconds)</label>
            <input
              type="number"
              value={crawlDelay}
              onChange={(e) => setCrawlDelay(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 5"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., example.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sitemap URLs</label>
            {sitemaps.map((sitemap, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={sitemap}
                  onChange={(e) => updateSitemap(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/sitemap.xml"
                />
                {sitemaps.length > 1 && (
                  <button
                    onClick={() => removeSitemap(index)}
                    className="text-red-600 hover:text-red-800 flex items-center"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addSitemap}
              className="text-blue-600 hover:underline flex items-center"
            >
              <FaPlus className="mr-1" /> Add Sitemap
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={generateRobotsTxt}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Generate robots.txt
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Generated Output */}
        {generatedTxt && (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
              <h3 className="font-semibold text-gray-700">Generated robots.txt</h3>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                  onClick={handleCopy}
                  className={`py-2 px-4 rounded-md transition-colors flex items-center ${
                    copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap max-h-64 overflow-auto">
              {generatedTxt}
            </pre>
          </div>
        )}

        {/* Features List */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple User-agents with Allow/Disallow rules</li>
            <li>Crawl-delay configuration</li>
            <li>Multiple Sitemap URLs support</li>
            <li>Host directive</li>
            <li>Input validation with error messages</li>
            <li>Copy and download options</li>
            <li>Reset functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RobotsTxtGenerator;