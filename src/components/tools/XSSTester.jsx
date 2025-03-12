"use client";

import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaPlay, FaHistory } from "react-icons/fa";

const XSSTester = () => {
  const [input, setInput] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [sanitizedOutput, setSanitizedOutput] = useState("");
  const [testOptions, setTestOptions] = useState({
    basicPatterns: true,
    advancedPatterns: false,
    contextSimulation: "html",
    showRawOutput: false,
  });
  const [history, setHistory] = useState([]);

  const basicXSSPatterns = [
    { pattern: /<script.*?>.*?<\/script>/i, description: "Script tag injection" },
    { pattern: /javascript:/i, description: "JavaScript protocol" },
    { pattern: /on\w+\s*=\s*["'].*?["']/i, description: "Event handler attribute" },
    { pattern: /eval\s*\(/i, description: "Eval function call" },
    { pattern: /document\.cookie/i, description: "Document cookie access" },
    { pattern: /<img\s+src\s*=["']javascript:.*?["']/i, description: "Image source JavaScript" },
    { pattern: /<iframe.*?>.*?<\/iframe>/i, description: "Iframe injection" },
    { pattern: /expression\s*\(/i, description: "CSS expression (IE)" },
  ];

  const advancedXSSPatterns = [
    { pattern: /data:[^;]*;base64/i, description: "Data URI injection" },
    { pattern: /vbscript:/i, description: "VBScript protocol" },
    { pattern: /<[^>]+style\s*=\s*["']expression\(.*?\)["']/i, description: "Style expression" },
    { pattern: /<meta.*charset.*>/i, description: "Charset manipulation" },
    { pattern: /<[^>]+srcdoc\s*=\s*["'].*?["']/i, description: "Srcdoc attribute injection" },
    { pattern: /alert\(/i, description: "Alert function call" },
  ];

  const simulateSanitization = (text, context) => {
    let sanitized = text;
    switch (context) {
      case "html":
        sanitized = sanitized
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;")
          .replace(/\//g, "&#x2F;");
        break;
      case "attribute":
        sanitized = sanitized.replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
        break;
      case "javascript":
        sanitized = sanitized.replace(/['"]/g, "\\$&").replace(/[\n\r]/g, "");
        break;
      default:
        break;
    }
    return sanitized;
  };

  const analyzeXSS = useCallback((payload) => {
    if (!payload.trim()) {
      setTestResult({ status: "error", message: "Please enter a payload to test", patterns: [], timestamp: new Date() });
      setSanitizedOutput("");
      return;
    }

    const patterns = testOptions.basicPatterns
      ? testOptions.advancedPatterns
        ? [...basicXSSPatterns, ...advancedXSSPatterns]
        : basicXSSPatterns
      : testOptions.advancedPatterns
      ? advancedXSSPatterns
      : [];

    const detectedPatterns = [];
    let isVulnerable = false;

    patterns.forEach(({ pattern, description }) => {
      if (pattern.test(payload)) {
        detectedPatterns.push({ pattern: pattern.source, description });
        isVulnerable = true;
      }
    });

    const sanitized = simulateSanitization(payload, testOptions.contextSimulation);
    const sanitizedVulnerable = patterns.some(({ pattern }) => pattern.test(sanitized));

    const result = {
      status: isVulnerable ? "vulnerable" : "safe",
      message: isVulnerable ? "Potential XSS detected!" : "No obvious XSS patterns found",
      patterns: detectedPatterns,
      sanitizedVulnerable,
      timestamp: new Date(),
    };

    setTestResult(result);
    setSanitizedOutput(sanitized);
    setHistory(prev => [...prev, { input: payload, result }].slice(-5));
  }, [testOptions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeXSS(input);
  };

  const handleReset = () => {
    setInput("");
    setTestResult(null);
    setSanitizedOutput("");
  };

  const handleDownload = () => {
    const content = testResult 
      ? `Input: ${input}\nResult: ${testResult.message}\nPatterns: ${testResult.patterns.map(p => p.description).join(', ')}\nSanitized: ${sanitizedOutput}`
      : input;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `xss-test-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreFromHistory = (entry) => {
    setInput(entry.input);
    setTestResult(entry.result);
    setSanitizedOutput(simulateSanitization(entry.input, testOptions.contextSimulation));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">XSS Tester</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">XSS Payload</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-40 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Try these examples:\n<script>alert('xss')</script>\n<img src="javascript:alert('xss')">\nonclick="alert('test')"`}
              aria-label="XSS Payload Input"
            />
          </div>

          {/* Test Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Test Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={testOptions.basicPatterns}
                  onChange={(e) => setTestOptions((prev) => ({ ...prev, basicPatterns: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Basic XSS Patterns</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={testOptions.advancedPatterns}
                  onChange={(e) => setTestOptions((prev) => ({ ...prev, advancedPatterns: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Advanced XSS Patterns</span>
              </label>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Context:</label>
                <select
                  value={testOptions.contextSimulation}
                  onChange={(e) => setTestOptions((prev) => ({ ...prev, contextSimulation: e.target.value }))}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="html">HTML Context</option>
                  <option value="attribute">Attribute Context</option>
                  <option value="javascript">JavaScript Context</option>
                </select>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={testOptions.showRawOutput}
                  onChange={(e) => setTestOptions((prev) => ({ ...prev, showRawOutput: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Show Raw Output</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaPlay className="mr-2" /> Test Payload
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={handleDownload}
              disabled={!input.trim()}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </form>

        {/* Test Results */}
        {testResult && (
          <div className="mt-6 space-y-6">
            <div className={`p-4 rounded-lg ${testResult.status === "vulnerable" ? "bg-red-50 border-red-200" : testResult.status === "safe" ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"} border`}>
              <h3 className="font-semibold text-gray-700 mb-2">Analysis Result</h3>
              <p className={`text-lg ${testResult.status === "vulnerable" ? "text-red-700" : testResult.status === "safe" ? "text-green-700" : "text-yellow-700"}`}>
                {testResult.message}
              </p>
              {testResult.patterns && testResult.patterns.length > 0 && (
                <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
                  {testResult.patterns.map((pattern, index) => (
                    <li key={index}>
                      {pattern.description} detected (Pattern: <code className="bg-gray-200 px-1 rounded">{pattern.pattern}</code>)
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Tested at: {testResult.timestamp ? `${testResult.timestamp.toLocaleTimeString()} on ${testResult.timestamp.toLocaleDateString()}` : 'Not available'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Sanitized Output</h3>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all bg-white p-2 rounded">
                {sanitizedOutput}
              </pre>
              {testOptions.showRawOutput && (
                <pre className="text-sm font-mono text-gray-600 mt-2 bg-gray-100 p-2 rounded">
                  Raw: {input}
                </pre>
              )}
              <p className={`mt-2 text-sm ${testResult.sanitizedVulnerable ? "text-red-600" : "text-green-600"}`}>
                {testResult.sanitizedVulnerable ? "⚠ Sanitized output still vulnerable!" : "✓ Sanitized output appears safe"}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-700 mb-2">Testing Notes</h3>
              <ul className="text-sm text-blue-600 list-disc pl-5 space-y-1">
                <li>This is a simulation tool, not a full security audit</li>
                <li>Real XSS testing requires context-specific analysis</li>
                <li>Advanced evasion techniques may bypass these checks</li>
                <li>Use in conjunction with proper security testing tools</li>
              </ul>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <FaHistory className="mr-2" /> Recent Tests (Last 5)
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="truncate max-w-[70%]">{entry.input} → {entry.result.message}</span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default XSSTester;