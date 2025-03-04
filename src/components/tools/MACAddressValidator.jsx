// components/MACAddressValidator.js
'use client';

import React, { useState } from 'react';

const MACAddressValidator = () => {
  const [macAddress, setMacAddress] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Basic OUI database (expandable)
  const ouiDatabase = {
    '00:50:56': 'VMware, Inc.',
    '00:0C:29': 'VMware, Inc.',
    '00:25:00': 'Apple, Inc.',
    '00:14:22': 'Dell Inc.',
    '00:18:F3': 'ASUSTek Computer Inc.',
    '00:D0:59': 'Ambit Microsystems Corp.'
  };

  // Validate and analyze MAC address
  const validateMAC = () => {
    setError('');
    setResults(null);

    if (!macAddress.trim()) {
      setError('Please enter a MAC address');
      return;
    }

    // Common MAC address formats: XX:XX:XX:XX:XX:XX, XX-XX-XX-XX-XX-XX, or XXXXXXXXXXXX
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$/;
    if (!macRegex.test(macAddress)) {
      setError('Invalid MAC address format. Use XX:XX:XX:XX:XX:XX, XX-XX-XX-XX-XX-XX, or XXXXXXXXXXXX');
      return;
    }

    // Normalize MAC address to XX:XX:XX:XX:XX:XX
    let normalizedMac = macAddress.replace(/[:-]/g, '');
    normalizedMac = normalizedMac.match(/.{1,2}/g).join(':').toUpperCase();

    // Extract components
    const octets = normalizedMac.split(':');
    const firstOctet = parseInt(octets[0], 16);
    const oui = octets.slice(0, 3).join(':');

    // Analyze properties
    const isValid = true; // Already validated by regex
    const isMulticast = (firstOctet & 1) === 1; // Least significant bit of first octet
    const isLocallyAdministered = (firstOctet & 2) === 2; // Second least significant bit
    const vendor = ouiDatabase[oui] || 'Unknown vendor (OUI not in database)';

    setResults({
      normalized: normalizedMac,
      isValid,
      isMulticast,
      isLocallyAdministered,
      oui,
      vendor
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    validateMAC();
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
    setMacAddress('');
    setResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">MAC Address Validator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* MAC Address Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MAC Address
            </label>
            <input
              type="text"
              value={macAddress}
              onChange={(e) => setMacAddress(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 font-mono"
              placeholder="e.g., 00:50:56:C0:00:01 or 005056C00001"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: XX:XX:XX:XX:XX:XX, XX-XX-XX-XX-XX-XX, or XXXXXXXXXXXX
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Validate
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

        {/* Validation Results */}
        {results && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Validation Results</h2>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Copy Results
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded border space-y-2">
              <p className="text-sm">
                <strong>Normalized MAC:</strong> {results.normalized}
              </p>
              <p className={`text-sm ${results.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {results.isValid ? '✓ Valid format' : '✗ Invalid format'}
              </p>
              <p className="text-sm">
                <strong>Type:</strong> {results.isMulticast ? 'Multicast' : 'Unicast'}
              </p>
              <p className="text-sm">
                <strong>Locally Administered:</strong> {results.isLocallyAdministered ? 'Yes' : 'No'}
              </p>
              <p className="text-sm">
                <strong>OUI:</strong> {results.oui}
              </p>
              <p className="text-sm">
                <strong>Vendor:</strong> {results.vendor}
              </p>
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> Vendor lookup is based on a limited OUI database. For full vendor identification, use an updated OUI list.
        </p>
      </div>
    </div>
  );
};

export default MACAddressValidator;