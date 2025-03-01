"use client";

import React, { useState } from 'react';

const XSSTester = () => {
  const [input, setInput] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [sanitizedOutput, setSanitizedOutput] = useState('');

  const commonXSSPatterns = [
    /<script.*?>.*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=\s*["'].*?["']/i, // e.g., onload="alert()"
    /eval\s*\(/i,
    /document\.cookie/i,
    /<img\s+src\s*=["']javascript:.*?["']/i,
    /<iframe.*?>.*?<\/iframe>/i,
    /expression\s*\(/i, // IE-specific
  ];

  const simulateSanitization = (text) => {
    // Simple sanitization simulation (not comprehensive)
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  const analyzeXSS = (payload) => {
    if (!payload.trim()) {
      setTestResult({ status: 'error', message: 'Please enter a payload to test' });
      setSanitizedOutput('');
      return;
    }

    const detectedPatterns = [];
    let isVulnerable = false;

    // Check for XSS patterns
    commonXSSPatterns.forEach((pattern, index) => {
      if (pattern.test(payload)) {
        detectedPatterns.push({
          pattern: pattern.source,
          description: getPatternDescription(index)
        });
        isVulnerable = true;
      }
    });

    // Simulate sanitization
    const sanitized = simulateSanitization(payload);

    // Check if sanitized output still contains potential XSS
    const sanitizedVulnerable = commonXSSPatterns.some(pattern => pattern.test(sanitized));

    setTestResult({
      status: isVulnerable ? 'vulnerable' : 'safe',
      message: isVulnerable 
        ? 'Potential XSS detected!' 
        : 'No obvious XSS patterns found',
      patterns: detectedPatterns,
      sanitizedVulnerable: sanitizedVulnerable
    });
    setSanitizedOutput(sanitized);
  };

  const getPatternDescription = (index) => {
    const descriptions = [
      'Script tag injection',
      'JavaScript protocol',
      'Event handler attribute',
      'Eval function call',
      'Document cookie access',
      'Image source JavaScript',
      'Iframe injection',
      'CSS expression (IE)'
    ];
    return descriptions[index];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeXSS(input);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">XSS Tester</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              XSS Payload
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`<script>alert('xss')</script>
or
<img src="javascript:alert('xss')">`}
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
            <div className={`p-4 rounded-md ${testResult.status === 'vulnerable' ? 'bg-red-50' : 'bg-green-50'}`}>
              <h3 className="font-semibold text-gray-700">Result</h3>
              <p className={`text-lg ${testResult.status === 'vulnerable' ? 'text-red-700' : 'text-green-700'}`}>
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
                {sanitizedOutput}
              </pre>
              <p className={`mt-2 text-sm ${testResult.sanitizedVulnerable ? 'text-red-600' : 'text-green-600'}`}>
                {testResult.sanitizedVulnerable 
                  ? 'Warning: Sanitized output still contains potential XSS!'
                  : 'Sanitized output appears safe'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">
                This is a basic simulation. Real-world XSS testing should involve:
              </p>
              <ul className="text-sm text-gray-600 list-disc pl-5">
                <li>Context-specific sanitization (HTML, attributes, JS, etc.)</li>
                <li>Testing against actual application endpoints</li>
                <li>Consideration of encoding and evasion techniques</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XSSTester;