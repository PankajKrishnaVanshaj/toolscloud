"use client";

import React, { useState } from 'react';

const SSLCertificateChecker = () => {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkSSLCertificate = async (domainName) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Using a free SSL checker API (replace with your own API key or service if needed)
      const response = await fetch(`https://api.ssl-cert-checker.com/v1/ssl-check?domain=${encodeURIComponent(domainName)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult({
        valid: data.valid,
        issuer: data.issuer,
        subject: data.subject,
        validFrom: new Date(data.validFrom).toLocaleString(),
        validTo: new Date(data.validTo).toLocaleString(),
        daysRemaining: data.daysRemaining,
        certificate: data.certificate
      });
    } catch (err) {
      setError('Failed to fetch SSL certificate details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!domain.trim()) {
      setError('Please enter a domain name');
      return;
    }
    checkSSLCertificate(domain);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">SSL Certificate Checker</h2>

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
            {loading ? 'Checking...' : 'Check SSL Certificate'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-md ${result.valid ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="font-semibold text-gray-700">Status</h3>
              <p className={`text-lg ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                {result.valid ? 'Valid SSL Certificate' : 'Invalid SSL Certificate'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Certificate Details</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><strong>Issuer:</strong> {result.issuer}</li>
                <li><strong>Subject:</strong> {result.subject}</li>
                <li><strong>Valid From:</strong> {result.validFrom}</li>
                <li><strong>Valid To:</strong> {result.validTo}</li>
                <li><strong>Days Remaining:</strong> {result.daysRemaining}</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Raw Certificate</h3>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                {result.certificate}
              </pre>
            </div>
          </div>
        )}

        {/* Notes */}
        {!result && !error && !loading && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Enter a domain name (e.g., example.com) to check its SSL certificate details.</p>
            <p className="mt-1">This tool uses a third-party API to fetch certificate information.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SSLCertificateChecker;