"use client";

import React, { useState } from 'react';

const PortScanner = () => {
  const [host, setHost] = useState('');
  const [ports, setPorts] = useState(''); // e.g., "80,443" or "1-100"
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Common ports and their typical services (for simulation)
  const commonPorts = {
    21: 'FTP',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    80: 'HTTP',
    443: 'HTTPS',
    3306: 'MySQL',
    5432: 'PostgreSQL',
    8080: 'HTTP Alternate'
  };

  const parsePorts = (input) => {
    const portList = [];
    input.split(',').forEach(range => {
      const trimmed = range.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number);
        if (isNaN(start) || isNaN(end) || start < 1 || end > 65535 || start > end) {
          throw new Error('Invalid port range');
        }
        for (let i = start; i <= end; i++) {
          portList.push(i);
        }
      } else {
        const port = Number(trimmed);
        if (isNaN(port) || port < 1 || port > 65535) {
          throw new Error('Invalid port number');
        }
        portList.push(port);
      }
    });
    return Array.from(new Set(portList)).sort((a, b) => a - b); // Remove duplicates and sort
  };

  const simulateScan = async (host, portList) => {
    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      if (!host.trim()) {
        throw new Error('Please enter a host');
      }
      if (!ports.trim()) {
        throw new Error('Please enter ports to scan');
      }

      const parsedPorts = parsePorts(ports);
      const results = [];

      // Simulate scanning with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      parsedPorts.forEach(port => {
        // Mock logic: assume common ports are "open" 50% of the time
        const isOpen = commonPorts[port] && Math.random() > 0.5;
        results.push({
          port,
          status: isOpen ? 'open' : 'closed',
          service: commonPorts[port] || 'Unknown'
        });
      });

      setScanResult({
        host,
        portsScanned: parsedPorts.length,
        results
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    simulateScan(host, ports);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Port Scanner</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Host (e.g., example.com)
            </label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example.com"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ports (e.g., 80,443 or 1-100)
            </label>
            <input
              type="text"
              value={ports}
              onChange={(e) => setPorts(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="80,443"
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
            {loading ? 'Scanning...' : 'Scan Ports'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Scan Summary</h3>
              <p className="text-sm text-gray-600">
                Host: <span className="font-mono">{scanResult.host}</span>
              </p>
              <p className="text-sm text-gray-600">
                Ports Scanned: {scanResult.portsScanned}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th className="px-4 py-2">Port</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Service</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanResult.results.map((result, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2 font-mono">{result.port}</td>
                        <td className={`px-4 py-2 ${result.status === 'open' ? 'text-green-600' : 'text-red-600'}`}>
                          {result.status}
                        </td>
                        <td className="px-4 py-2">{result.service}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-md">
              <h3 className="font-semibold text-yellow-800 mb-2">Note</h3>
              <p className="text-sm text-yellow-700">
                This is a client-side simulation. Actual port scanning is not possible in the browser due to security restrictions.
                For real scanning, integrate with a server-side API (e.g., Next.js API route with a tool like nmap).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortScanner;