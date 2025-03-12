"use client";

import React, { useState, useCallback, useRef } from 'react';
import { FaSync, FaDownload, FaInfoCircle, FaHistory } from 'react-icons/fa';

const SQLInjectionTester = () => {
  const [input, setInput] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testOptions, setTestOptions] = useState({
    basicPatterns: true,
    advancedPatterns: true,
    simulateSanitization: true,
    strictMode: false,
  });
  const [history, setHistory] = useState([]);
  const testCount = useRef(0);

  const commonSQLInjectionPatterns = [
    { pattern: /['"]\s*OR\s*['"1=1]/i, description: 'Basic OR 1=1 injection', category: 'basic' },
    { pattern: /['"]\s*;\s*DROP\s+/i, description: 'DROP statement injection', category: 'basic' },
    { pattern: /['"]\s*;\s*SELECT\s+/i, description: 'Multiple query injection', category: 'basic' },
    { pattern: /UNION\s+(ALL\s+)?SELECT/i, description: 'UNION SELECT attack', category: 'basic' },
    { pattern: /--|\/\*/i, description: 'SQL comment for truncation', category: 'basic' },
    { pattern: /['"]\s*AND\s*['"]?\d+['"]?\s*=\s*['"]?\d+['"]/i, description: 'Boolean-based injection', category: 'advanced' },
    { pattern: /WAITFOR\s+DELAY/i, description: 'Time-based injection', category: 'advanced' },
    { pattern: /EXEC\s*\(/i, description: 'Stored procedure execution', category: 'advanced' },
    { pattern: /\bINFORMATION_SCHEMA\b/i, description: 'Database schema probing', category: 'advanced' },
    { pattern: /xp_cmdshell/i, description: 'System command execution (MSSQL)', category: 'advanced' },
    { pattern: /CAST\(.*AS\s+CHAR\)/i, description: 'Type conversion attack', category: 'advanced' },
  ];

  const simulateSanitization = useCallback((text) => {
    if (!testOptions.simulateSanitization) return text;
    let sanitized = text
      .replace(/'/g, "''")
      .replace(/"/g, '""')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/;/g, '');
    if (testOptions.strictMode) {
      sanitized = sanitized.replace(/[<>]/g, '');
      sanitized = encodeURIComponent(sanitized);
    }
    return sanitized;
  }, [testOptions]);

  const analyzeSQLInjection = useCallback((payload) => {
    if (!payload.trim()) {
      setTestResult({ status: 'error', message: 'Please enter a payload to test', patterns: [], timestamp: new Date() });
      return;
    }

    const activePatterns = commonSQLInjectionPatterns.filter(p => 
      (testOptions.basicPatterns && p.category === 'basic') || 
      (testOptions.advancedPatterns && p.category === 'advanced')
    );

    const detectedPatterns = [];
    let isVulnerable = false;

    activePatterns.forEach(({ pattern, description }) => {
      if (pattern.test(payload)) {
        detectedPatterns.push({ pattern: pattern.source, description });
        isVulnerable = true;
      }
    });

    const sanitized = simulateSanitization(payload);
    const sanitizedVulnerable = activePatterns.some(({ pattern }) => pattern.test(sanitized));

    const result = {
      status: isVulnerable ? 'vulnerable' : 'safe',
      message: isVulnerable 
        ? 'Potential SQL Injection detected!' 
        : 'No obvious SQL injection patterns found',
      patterns: detectedPatterns,
      sanitized,
      sanitizedVulnerable,
      timestamp: new Date(),
    };

    setTestResult(result);
    setHistory(prev => [...prev, { input: payload, result }].slice(-5));
    testCount.current += 1;
  }, [testOptions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeSQLInjection(input);
  };

  const handleReset = () => {
    setInput('');
    setTestResult(null);
    testCount.current = 0;
  };

  const handleDownload = () => {
    const content = testResult 
      ? `Input: ${input}\n\nResult: ${testResult.message}\n\nPatterns: ${testResult.patterns.map(p => p.description).join(', ')}\nSanitized: ${testResult.sanitized}`
      : input;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sql-test-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreFromHistory = (entry) => {
    setInput(entry.input);
    setTestResult(entry.result);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">SQL Injection Tester</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SQL Injection Payload
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Examples:\n' OR '1'='1\n1; DROP TABLE users; --\nadmin' UNION SELECT NULL, password FROM users --`}
              aria-label="SQL Injection Payload"
            />
          </div>

          {/* Test Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Test Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(testOptions).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setTestOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              disabled={!input.trim()}
            >
              Test Payload
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
              <FaDownload className="mr-2" /> Download Result
            </button>
          </div>
        </form>

        {/* Test Results */}
        {testResult && (
          <div className="mt-8 space-y-6">
            <div className={`p-4 rounded-lg ${testResult.status === 'vulnerable' ? 'bg-red-50 border-red-200' : testResult.status === 'safe' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border`}>
              <h3 className="font-semibold text-gray-700 mb-2">Test Result</h3>
              <p className={`text-lg ${testResult.status === 'vulnerable' ? 'text-red-700' : testResult.status === 'safe' ? 'text-green-700' : 'text-gray-700'}`}>
                {testResult.message}
              </p>
              {testResult.patterns && testResult.patterns.length > 0 && (
                <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
                  {testResult.patterns.map((pattern, index) => (
                    <li key={index}>
                      Detected: {pattern.description} (Pattern: <code className="bg-gray-200 px-1 rounded">{pattern.pattern}</code>)
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Tested at: {testResult.timestamp ? `${testResult.timestamp.toLocaleTimeString()} on ${testResult.timestamp.toLocaleDateString()}` : 'Not available'}
              </p>
            </div>

            {testOptions.simulateSanitization && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Sanitized Output</h3>
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all bg-white p-2 rounded">
                  {testResult.sanitized}
                </pre>
                <p className={`mt-2 text-sm ${testResult.sanitizedVulnerable ? 'text-red-600' : 'text-green-600'}`}>
                  {testResult.sanitizedVulnerable 
                    ? '⚠️ Warning: Sanitized output still contains potential SQL injection!'
                    : '✓ Sanitized output appears safe'}
                </p>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
                <FaInfoCircle className="mr-2" /> Important Notes
              </h3>
              <ul className="text-sm text-blue-600 list-disc pl-5 space-y-1">
                <li>This is a simulation tool for educational purposes</li>
                <li>Use parameterized queries to prevent SQL injection</li>
                <li>Test in controlled environments only</li>
                <li>Consider database-specific vulnerabilities</li>
                <li>Real-world testing requires application context</li>
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

export default SQLInjectionTester;