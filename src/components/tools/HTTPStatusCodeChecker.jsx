"use client";

import React, { useState } from 'react';

const HTTPStatusCodeChecker = () => {
  const [url, setUrl] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const statusCodeDescriptions = {
    100: 'Continue - The server has received the request headers and the client should proceed.',
    200: 'OK - The request was successful.',
    201: 'Created - The request was successful and a resource was created.',
    204: 'No Content - The request was successful but there is no content to return.',
    301: 'Moved Permanently - The resource has been permanently moved to a new URL.',
    302: 'Found - The resource is temporarily located at a different URL.',
    304: 'Not Modified - The resource has not been modified since the last request.',
    400: 'Bad Request - The server cannot process the request due to client error.',
    401: 'Unauthorized - Authentication is required and has failed or not been provided.',
    403: 'Forbidden - The server refuses to fulfill the request.',
    404: 'Not Found - The requested resource could not be found.',
    500: 'Internal Server Error - The server encountered an unexpected condition.',
    502: 'Bad Gateway - The server received an invalid response from an upstream server.',
    503: 'Service Unavailable - The server is temporarily unable to handle the request.',
    504: 'Gateway Timeout - The server did not receive a timely response from an upstream server.'
  };

  const checkStatusCode = async () => {
    setLoading(true);
    setError(null);
    setStatusResult(null);

    if (!url.trim()) {
      setError('Please enter a valid URL');
      setLoading(false);
      return;
    }

    // Ensure URL has a protocol
    const formattedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;

    try {
      const response = await fetch(formattedUrl, {
        method: 'HEAD', // Use HEAD to avoid downloading body
        mode: 'no-cors', // Use no-cors to avoid CORS issues, but note limitations
        redirect: 'follow'
      });

      // no-cors mode doesn't expose status in some browsers, so we'll use a fallback
      let status = response.status;
      if (!status) {
        // Fallback to full GET request if HEAD fails or no-cors hides status
        const fullResponse = await fetch(formattedUrl, {
          method: 'GET',
          redirect: 'follow'
        });
        status = fullResponse.status;
      }

      const description = statusCodeDescriptions[status] || 'Unknown status code - Refer to HTTP standards for details.';
      setStatusResult({
        status,
        description,
        url: formattedUrl
      });
    } catch (err) {
      setError(`Failed to check status: ${err.message}. Note: Some servers may block HEAD requests or require CORS approval.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    checkStatusCode();
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-50 text-green-700';
    if (status >= 400 && status < 500) return 'bg-red-50 text-red-700';
    if (status >= 500) return 'bg-orange-50 text-orange-700';
    return 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">HTTP Status Code Checker</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example.com or https://example.com"
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
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Status Result */}
        {statusResult && (
          <div className="mt-6">
            <div className={`p-4 rounded-md ${getStatusColor(statusResult.status)}`}>
              <h3 className="font-semibold">Result</h3>
              <p className="text-lg mt-1">
                Status: {statusResult.status} - {statusResult.status >= 200 && statusResult.status < 300 ? 'Success' : statusResult.status >= 400 && statusResult.status < 500 ? 'Client Error' : 'Server Error'}
              </p>
              <p className="text-sm mt-1">URL: <span className="font-mono">{statusResult.url}</span></p>
              <p className="text-sm mt-2">{statusResult.description}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="mt-4 text-sm text-gray-600">
          <p>Notes:</p>
          <ul className="list-disc pl-5">
            <li>Uses HEAD request first, falls back to GET if needed.</li>
            <li>Some servers may block HEAD requests or require CORS headers.</li>
            <li>Results may vary due to redirects or server configurations.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HTTPStatusCodeChecker;