"use client";

import React, { useState } from 'react';

const RandomIPGenerator = () => {
  const [ipType, setIpType] = useState('ipv4');
  const [quantity, setQuantity] = useState(1);
  const [generatedIPs, setGeneratedIPs] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateIPv4 = () => {
    const octets = [];
    for (let i = 0; i < 4; i++) {
      octets.push(Math.floor(Math.random() * 256));
    }
    return octets.join('.');
  };

  const generateIPv6 = () => {
    const segments = [];
    for (let i = 0; i < 8; i++) {
      segments.push(Math.floor(Math.random() * 65536).toString(16));
    }
    return segments.join(':');
  };

  const generateIPs = () => {
    const newIPs = [];
    const generator = ipType === 'ipv4' ? generateIPv4 : generateIPv6;
    
    for (let i = 0; i < Math.min(quantity, 100); i++) { // Cap at 100 for performance
      newIPs.push(generator());
    }
    
    setGeneratedIPs(newIPs);
    setCopiedIndex(null);
  };

  const handleCopy = (ip, index) => {
    navigator.clipboard.writeText(ip);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateIPs();
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Random IP Generator</h2>

        {/* Generator Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IP Type
              </label>
              <select
                value={ipType}
                onChange={(e) => setIpType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ipv4">IPv4</option>
                <option value="ipv6">IPv6</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (1-100)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate IPs
          </button>
        </form>

        {/* Generated IPs */}
        {generatedIPs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Generated {ipType.toUpperCase()} Addresses
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {generatedIPs.map((ip, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span className="font-mono text-sm text-gray-800 break-all">
                    {ip}
                  </span>
                  <button
                    onClick={() => handleCopy(ip, index)}
                    className={`ml-2 px-2 py-1 text-sm rounded transition-colors ${
                      copiedIndex === index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {copiedIndex === index ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomIPGenerator;