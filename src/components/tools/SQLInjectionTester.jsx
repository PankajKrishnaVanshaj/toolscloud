"use client";

import React, { useState } from 'react';

const SQLInjectionTester = () => {
  const [input, setInput] = useState('');
  const [testResult, setTestResult] = useState(null);

  const commonSQLInjectionPatterns = [
    { pattern: /['"]\s*OR\s*['"1=1]/i, description: 'Basic OR 1=1 injection' },
    { pattern: /['"]\s*;\s*DROP\s+/i, description: 'DROP statement injection' },
    { pattern: /['"]\s*;\s*SELECT\s+/i, description: 'Multiple query injection' },
    { pattern: /UNION\s+(ALL\s+)?SELECT/i, description: 'UNION SELECT attack' },
    { pattern: /--|\/\*/i, description: 'SQL comment for truncation' },
    { pattern: /['"]\s*AND\s*['"]?\d+['"]?\s*=\s*['"]?\d+['"]/i, description: 'Boolean-based injection' },
    { pattern: /WAITFOR\s+DELAY/i, description: 'Time-based injection' },
    { pattern: /EXEC\s*\(/i, description: 'Stored procedure execution' },
    { pattern: /\bINFORMATION_SCHEMA\b/i, description: 'Database schema probing' }
  ];

  const simulateSanitization = (text) => {
    // Basic sanitization simulation (not comprehensive)
    return text
      .replace(/'/g, "''") // Escape single quotes
      .replace(/"/g, '""') // Escape double quotes
      .replace(/--/g, '')  // Remove comments
      .replace(/\/\*/g, ''); // Remove block comment start
  };

  const analyzeSQLInjection = (payload) => {
    if (!payload.trim()) {
      setTestResult({ status: 'error', message: 'Please enter a payload to test' });
      return;
    }

    const detectedPatterns = [];
    let isVulnerable = false;

    // Check for SQL injection patterns
    commonSQLInjectionPatterns.forEach(({ pattern, description }) => {
      if (pattern.test(payload)) {
        detectedPatterns.push({ pattern: pattern.source, description });
        isVulnerable = true;
      }
    });

    // Simulate sanitization
    const sanitized = simulateSanitization(payload);
    const sanitizedVulnerable = commonSQLInjectionPatterns.some(({ pattern }) => pattern.test(sanitized));

    setTestResult({
      status: isVulnerable ? 'vulnerable' : 'safe',
      message: isVulnerable 
        ? 'Potential SQL Injection detected!' 
        : 'No obvious SQL injection patterns found',
      patterns: detectedPatterns,
      sanitized: sanitized,
      sanitizedVulnerable: sanitizedVulnerable
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeSQLInjection(input);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">SQL Injection Tester</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SQL Injection Payload
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`' OR '1'='1
or
1; DROP TABLE users; --`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Test Payload
          </button>
        </form>

        {/* Test Results */}
        {testResult && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-md ${testResult.status === 'vulnerable' ? 'bg-red-50' : testResult.status === 'safe' ? 'bg-green-50' : 'bg-gray-50'}`}>
              <h3 className="font-semibold text-gray-700">Result</h3>
              <p className={`text-lg ${testResult.status === 'vulnerable' ? 'text-red-700' : testResult.status === 'safe' ? 'text-green-700' : 'text-gray-700'}`}>
                {testResult.message}
              </p>
              {testResult.patterns.length > 0 && (
                <ul className="mt-2 text-sm text-gray-600 list-disc pl-5">
                  {testResult.patterns.map((pattern, index) => (
                    <li key={index}>
                      Detected: {pattern.description} (Pattern: <code>{pattern.pattern}</code>)
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Sanitized Output</h3>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                {testResult.sanitized}
              </pre>
              <p className={`mt-2 text-sm ${testResult.sanitizedVulnerable ? 'text-red-600' : 'text-green-600'}`}>
                {testResult.sanitizedVulnerable 
                  ? 'Warning: Sanitized output still contains potential SQL injection!'
                  : 'Sanitized output appears safe'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">
                This is a simulation tool. Real SQL injection testing should:
              </p>
              <ul className="text-sm text-gray-600 list-disc pl-5">
                <li>Use parameterized queries for prevention</li>
                <li>Be conducted in a controlled test environment</li>
                <li>Consider database-specific vulnerabilities</li>
                <li>Test against actual application endpoints</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SQLInjectionTester;