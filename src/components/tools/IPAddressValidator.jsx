"use client";

import React, { useState } from 'react';

const IPAddressValidator = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);

  const validateIPv4 = (ip) => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipv4Regex.test(ip)) return false;

    const octets = ip.split('.').map(Number);
    const isPrivate =
      (octets[0] === 10) || 
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || 
      (octets[0] === 192 && octets[1] === 168);
    const isReserved = 
      (octets[0] === 0) || 
      (octets[0] === 127) || 
      (octets[0] >= 224 && octets[0] <= 255);

    return { isValid: true, type: 'IPv4', isPrivate, isReserved };
  };

  const validateIPv6 = (ip) => {
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$|^::([0-9a-fA-F]{0,4}:){0,6}[0-9a-fA-F]{0,4}$|^([0-9a-fA-F]{0,4}:){1,6}:([0-9a-fA-F]{0,4}:){0,5}[0-9a-fA-F]{0,4}$/;
    if (!ipv6Regex.test(ip)) return false;

    return { isValid: true, type: 'IPv6', isPrivate: false, isReserved: false }; // Simplified, no private/reserved check for IPv6 here
  };

  const validateIP = (ip) => {
    setError(null);
    setValidationResult(null);

    if (!ip.trim()) {
      setError('Please enter an IP address');
      return;
    }

    const trimmedIp = ip.trim();
    const ipv4Result = validateIPv4(trimmedIp);
    const ipv6Result = validateIPv6(trimmedIp);

    if (ipv4Result.isValid) {
      setValidationResult(ipv4Result);
    } else if (ipv6Result.isValid) {
      setValidationResult(ipv6Result);
    } else {
      setValidationResult({ isValid: false, type: 'Unknown', message: 'Invalid IP address format' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateIP(ipAddress);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">IP Address Validator</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IP Address
            </label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="192.168.1.1 or 2001:0db8:85a3::8a2e:0370:7334"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Validate
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Validation Result */}
        {validationResult && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-md ${validationResult.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="font-semibold text-gray-700">Validation Result</h3>
              <p className={`text-lg ${validationResult.isValid ? 'text-green-700' : 'text-red-700'}`}>
                {validationResult.isValid ? 'Valid IP Address' : 'Invalid IP Address'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Type: <span className="font-mono">{validationResult.type}</span>
              </p>
              {validationResult.message && (
                <p className="text-sm text-gray-600 mt-1">{validationResult.message}</p>
              )}
              {validationResult.type === 'IPv4' && (
                <>
                  <p className="text-sm text-gray-600 mt-1">
                    Private Range: <span className="font-mono">{validationResult.isPrivate ? 'Yes' : 'No'}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Reserved Range: <span className="font-mono">{validationResult.isReserved ? 'Yes' : 'No'}</span>
                  </p>
                </>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
              <ul className="text-sm text-gray-600 list-disc pl-5">
                <li>IPv4: Must be in format X.X.X.X (0-255 per octet)</li>
                <li>IPv6: Must follow standard colon-separated hex format</li>
                <li>Private IPv4 ranges: 10.0.0.0-10.255.255.255, 172.16.0.0-172.31.255.255, 192.168.0.0-192.168.255.255</li>
                <li>Reserved IPv4 ranges include 0.0.0.0, 127.0.0.0, 224.0.0.0-255.255.255.255</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPAddressValidator;