"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { FaDownload, FaSync, FaCog } from 'react-icons/fa';

const PortScanner = () => {
  const [host, setHost] = useState('');
  const [ports, setPorts] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanOptions, setScanOptions] = useState({
    timeout: 1000,
    showClosedPorts: true,
    autoSuggestCommonPorts: false,
  });
  const [history, setHistory] = useState([]);

  // Extended common ports list
  const commonPorts = {
    20: 'FTP-Data', 21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP',
    53: 'DNS', 80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS',
    465: 'SMTPS', 587: 'SMTP-Submission', 993: 'IMAPS', 995: 'POP3S',
    3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL', 8080: 'HTTP-Alt',
    8443: 'HTTPS-Alt'
  };

  const parsePorts = useCallback((input) => {
    const portList = [];
    input.split(',').forEach(range => {
      const trimmed = range.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number);
        if (isNaN(start) || isNaN(end) || start < 1 || end > 65535 || start > end) {
          throw new Error(`Invalid port range: ${trimmed}`);
        }
        for (let i = start; i <= end; i++) portList.push(i);
      } else {
        const port = Number(trimmed);
        if (isNaN(port) || port < 1 || port > 65535) {
          throw new Error(`Invalid port: ${trimmed}`);
        }
        portList.push(port);
      }
    });
    return Array.from(new Set(portList)).sort((a, b) => a - b);
  }, []);

  const simulateScan = async (host, portList) => {
    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      if (!host.trim()) throw new Error('Host is required');
      if (!ports.trim()) throw new Error('Ports are required');

      const parsedPorts = parsePorts(ports);
      const results = [];

      await new Promise(resolve => setTimeout(resolve, scanOptions.timeout));

      parsedPorts.forEach(port => {
        const isOpen = commonPorts[port] && Math.random() > 0.5;
        if (isOpen || scanOptions.showClosedPorts) {
          results.push({
            port,
            status: isOpen ? 'open' : 'closed',
            service: commonPorts[port] || 'Unknown',
            timestamp: new Date().toISOString()
          });
        }
      });

      const scanData = {
        host,
        portsScanned: parsedPorts.length,
        results,
        timestamp: new Date()
      };

      setScanResult(scanData);
      setHistory(prev => [scanData, ...prev].slice(0, 5)); // Keep last 5 scans
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

  const handleReset = () => {
    setHost('');
    setPorts('');
    setScanResult(null);
    setError(null);
  };

  const handleDownload = () => {
    if (!scanResult) return;
    const content = JSON.stringify(scanResult, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `port-scan-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const suggestCommonPorts = () => {
    setPorts(Object.keys(commonPorts).slice(0, 5).join(','));
  };

  useEffect(() => {
    if (scanOptions.autoSuggestCommonPorts && !ports) {
      suggestCommonPorts();
    }
  }, [scanOptions.autoSuggestCommonPorts]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Port Scanner</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="e.g., example.com"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ports</label>
              <input
                type="text"
                value={ports}
                onChange={(e) => setPorts(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="e.g., 80,443 or 1-100"
                disabled={loading}
              />
            </div>
          </div>

          {/* Scan Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <FaCog className="mr-2" /> Scan Options
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={scanOptions.showClosedPorts}
                  onChange={(e) => setScanOptions(prev => ({ ...prev, showClosedPorts: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Show Closed Ports</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={scanOptions.autoSuggestCommonPorts}
                  onChange={(e) => setScanOptions(prev => ({ ...prev, autoSuggestCommonPorts: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Auto-suggest Common Ports</span>
              </label>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Timeout (ms)</label>
                <input
                  type="number"
                  value={scanOptions.timeout}
                  onChange={(e) => setScanOptions(prev => ({ ...prev, timeout: Number(e.target.value) }))}
                  min="500"
                  max="5000"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className={`flex-1 py-3 px-4 rounded-lg text-white transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              disabled={loading}
            >
              {loading ? 'Scanning...' : 'Scan Ports'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaSync className="inline mr-2" /> Reset
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
              disabled={!scanResult || loading}
            >
              <FaDownload className="inline mr-2" /> Download Results
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Scan Results */}
        {scanResult && (
          <div className="mt-6 space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Scan Summary</h3>
              <p className="text-sm text-gray-600">Host: <span className="font-mono">{scanResult.host}</span></p>
              <p className="text-sm text-gray-600">Ports Scanned: {scanResult.portsScanned}</p>
              <p className="text-sm text-gray-600">Time: {scanResult.timestamp.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg overflow-x-auto">
              <h3 className="font-semibold text-gray-700 mb-2">Results</h3>
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs uppercase bg-gray-100">
                  <tr>
                    <th className="px-4 py-3">Port</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {scanResult.results.map((result, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono">{result.port}</td>
                      <td className={`px-4 py-2 ${result.status === 'open' ? 'text-green-600' : 'text-red-600'}`}>
                        {result.status}
                      </td>
                      <td className="px-4 py-2">{result.service}</td>
                      <td className="px-4 py-2 text-xs">{new Date(result.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Scan History (Last 5)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{entry.host} ({entry.portsScanned} ports) - {entry.timestamp.toLocaleString()}</span>
                  <button
                    onClick={() => setScanResult(entry)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Note */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            Note: This is a simulation. Browser security prevents actual port scanning. For real scans, use a server-side solution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortScanner;