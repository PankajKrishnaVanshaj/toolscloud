// components/SecureEmailHeaderAnalyzer.js
'use client';

import React, { useState } from 'react';

const SecureEmailHeaderAnalyzer = () => {
  const [headerInput, setHeaderInput] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Parse and analyze email headers
  const analyzeHeaders = () => {
    setError('');
    setResults(null);

    if (!headerInput.trim()) {
      setError('Please paste email headers to analyze');
      return;
    }

    // Split headers into lines and parse key-value pairs
    const lines = headerInput.split('\n');
    const headers = {};
    let lastKey = '';
    lines.forEach(line => {
      if (line.startsWith(' ') || line.startsWith('\t')) {
        // Continuation of previous header
        if (lastKey && headers[lastKey]) {
          headers[lastKey] += ' ' + line.trim();
        }
      } else {
        const match = line.match(/^([^:]+):\s*(.+)$/);
        if (match) {
          lastKey = match[1].toLowerCase();
          headers[lastKey] = match[2].trim();
        }
      }
    });

    // Analyze security-related headers
    const analysis = {
      from: headers['from'] || 'Not present',
      received: [],
      spf: { present: false, result: 'Not present', details: '' },
      dkim: { present: false, result: 'Not present', details: '' },
      dmarc: { present: false, result: 'Not present', details: '' },
      potentialIssues: []
    };

    // Parse Received headers
    if (headers['received']) {
      const receivedHeaders = Object.keys(headers)
        .filter(key => key === 'received')
        .map(key => headers[key]);
      analysis.received = receivedHeaders;
    }

    // SPF Analysis
    if (headers['received-spf']) {
      analysis.spf.present = true;
      const spfParts = headers['received-spf'].split(';').map(part => part.trim());
      analysis.spf.result = spfParts[0] || 'Unknown';
      analysis.spf.details = spfParts.slice(1).join('; ');
      if (analysis.spf.result.toLowerCase() !== 'pass') {
        analysis.potentialIssues.push({
          issue: 'SPF Failure',
          severity: 'High',
          details: `SPF check returned "${analysis.spf.result}"`
        });
      }
    }

    // DKIM Analysis
    if (headers['dkim-signature']) {
      analysis.dkim.present = true;
      analysis.dkim.result = 'Present';
      analysis.dkim.details = headers['dkim-signature'];
      if (!headers['authentication-results'] || !/dkim=pass/i.test(headers['authentication-results'])) {
        analysis.potentialIssues.push({
          issue: 'DKIM Verification Missing or Failed',
          severity: 'Medium',
          details: 'No DKIM pass confirmation in Authentication-Results'
        });
      } else {
        analysis.dkim.result = 'Pass';
      }
    }

    // DMARC Analysis
    if (headers['authentication-results']) {
      const authResults = headers['authentication-results'].toLowerCase();
      if (/dmarc=/.test(authResults)) {
        analysis.dmarc.present = true;
        const dmarcMatch = authResults.match(/dmarc=(\w+)/);
        analysis.dmarc.result = dmarcMatch ? dmarcMatch[1] : 'Unknown';
        analysis.dmarc.details = headers['authentication-results'];
        if (analysis.dmarc.result !== 'pass') {
          analysis.potentialIssues.push({
            issue: 'DMARC Failure',
            severity: 'High',
            details: `DMARC check returned "${analysis.dmarc.result}"`
          });
        }
      }
    }

    // Additional Checks
    if (headers['from'] && headers['return-path'] && headers['from'] !== headers['return-path']) {
      analysis.potentialIssues.push({
        issue: 'From/Return-Path Mismatch',
        severity: 'Medium',
        details: 'Potential spoofing indicator: From and Return-Path domains differ'
      });
    }

    if (!analysis.spf.present && !analysis.dkim.present) {
      analysis.potentialIssues.push({
        issue: 'No Email Authentication',
        severity: 'High',
        details: 'Neither SPF nor DKIM headers found, increasing spoofing risk'
      });
    }

    setResults(analysis);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeHeaders();
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (results) {
      const text = JSON.stringify(results, null, 2);
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setHeaderInput('');
    setResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6">Secure Email Header Analyzer</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Headers
            </label>
            <textarea
              value={headerInput}
              onChange={(e) => setHeaderInput(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-40 font-mono text-sm"
              placeholder="Paste full email headers here"
            />
            <p className="text-xs text-gray-500 mt-1">
              Copy headers from your email client (e.g., "View Source" or "Show Original")
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Analyze Headers
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mt-4">{error}</div>
        )}

        {/* Analysis Results */}
        {results && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Analysis Results</h2>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Copy Results
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded border space-y-4">
              {/* From */}
              <div>
                <p className="text-sm font-medium">From</p>
                <p className="text-sm">{results.from}</p>
              </div>

              {/* Received Headers */}
              {results.received.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Received Headers ({results.received.length})</p>
                  <ul className="list-disc pl-5 text-sm">
                    {results.received.slice(0, 3).map((header, index) => (
                      <li key={index} className="truncate">{header}</li>
                    ))}
                    {results.received.length > 3 && (
                      <li>...and {results.received.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}

              {/* SPF */}
              <div>
                <p className="text-sm font-medium">SPF</p>
                <p className={`text-sm ${results.spf.result === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                  {results.spf.result}
                </p>
                {results.spf.details && <p className="text-xs text-gray-600">{results.spf.details}</p>}
              </div>

              {/* DKIM */}
              <div>
                <p className="text-sm font-medium">DKIM</p>
                <p className={`text-sm ${results.dkim.result === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                  {results.dkim.result}
                </p>
                {results.dkim.details && <p className="text-xs text-gray-600 truncate">{results.dkim.details}</p>}
              </div>

              {/* DMARC */}
              <div>
                <p className="text-sm font-medium">DMARC</p>
                <p className={`text-sm ${results.dmarc.result === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                  {results.dmarc.result}
                </p>
                {results.dmarc.details && <p className="text-xs text-gray-600">{results.dmarc.details}</p>}
              </div>

              {/* Potential Issues */}
              {results.potentialIssues.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Potential Issues ({results.potentialIssues.length})</p>
                  <ul className="mt-2 space-y-2">
                    {results.potentialIssues.map((issue, index) => (
                      <li key={index} className="border p-2 rounded">
                        <p className={`font-medium ${
                          issue.severity === 'High' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {issue.issue} ({issue.severity})
                        </p>
                        <p className="text-sm text-gray-600">{issue.details}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecureEmailHeaderAnalyzer;