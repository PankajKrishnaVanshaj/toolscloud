"use client";

import React, { useState } from 'react';

const DNSLookupTool = () => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for future implementation
    setLoading(true);
    setTimeout(() => setLoading(false), 1000); // Simulate a delay
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">DNS Lookup Tool</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain Name
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example.com"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Lookup DNS'}
          </button>
        </form>

        {/* Coming Soon Message */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-md text-center">
          <h3 className="text-lg font-semibold text-yellow-800">Coming Soon!</h3>
          <p className="text-sm text-yellow-700 mt-2">
            The DNS Lookup Tool is under development. Soon, you'll be able to enter a domain name and retrieve its DNS records directly from this tool.
          </p>
          <p className="text-sm text-yellow-700 mt-2">
            Planned features:
          </p>
          <ul className="text-sm text-yellow-700 list-disc list-inside">
            <li>A, AAAA, MX, NS, TXT, and other record types</li>
            <li>Response time analysis</li>
            <li>Nameserver details</li>
            <li>Copyable output</li>
          </ul>
        </div>

        {/* Placeholder for Future Result */}
        {loading && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md text-center">
            <p className="text-sm text-gray-600">Simulating DNS lookup...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DNSLookupTool;