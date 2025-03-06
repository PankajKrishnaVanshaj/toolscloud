// components/DomainAvailabilityChecker.js
'use client';

import React, { useState } from 'react';

const DomainAvailabilityChecker = () => {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkDomain = async (e) => {
    e.preventDefault();
    if (!domain) {
      setError('Please enter a domain name');
      return;
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      setError('Please enter a valid domain (e.g., example.com)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/check-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to check domain availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Domain Availability Checker</h1>

      <form onSubmit={checkDomain} className="space-y-4">
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
            Enter Domain Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value.toLowerCase())}
              placeholder="example.com"
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {result && (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <h2 className="text-lg font-semibold mb-2">
              {result.domain}
            </h2>
            <p className={result.available ? 'text-green-600' : 'text-red-600'}>
              {result.available 
                ? 'This domain is available!'
                : 'This domain is already taken.'}
            </p>
          </div>
        )}
      </form>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: This is a demo using mock data. For real domain checking, integrate a WHOIS API.
      </p>
    </div>
  );
};

export default DomainAvailabilityChecker;