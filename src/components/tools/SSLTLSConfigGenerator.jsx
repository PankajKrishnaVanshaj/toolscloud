"use client";

import React, { useState } from 'react';

const SSLTLSConfigGenerator = () => {
  const [serverType, setServerType] = useState('nginx');
  const [tlsVersion, setTlsVersion] = useState('1.2+');
  const [cipherSuite, setCipherSuite] = useState('modern');
  const [hsts, setHsts] = useState(true);
  const [generatedConfig, setGeneratedConfig] = useState('');
  const [copied, setCopied] = useState(false);

  const serverTypes = ['nginx', 'apache'];
  const tlsVersions = ['1.2+', '1.3 only'];
  const cipherSuites = ['modern', 'intermediate', 'old'];

  const generateConfig = () => {
    let config = '';

    // Common cipher suites
    const modernCiphers = 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305';
    const intermediateCiphers = `${modernCiphers}:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256`;
    const oldCiphers = `${intermediateCiphers}:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384`;

    const ciphers = {
      modern: modernCiphers,
      intermediate: intermediateCiphers,
      old: oldCiphers
    }[cipherSuite];

    if (serverType === 'nginx') {
      config = `# SSL/TLS Configuration for Nginx
ssl_protocols ${tlsVersion === '1.2+' ? 'TLSv1.2 TLSv1.3' : 'TLSv1.3'};
ssl_prefer_server_ciphers on;
ssl_ciphers "${ciphers}";
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_session_tickets off;
`;
      if (hsts) {
        config += 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;\n';
      }
    } else if (serverType === 'apache') {
      config = `# SSL/TLS Configuration for Apache
SSLProtocol ${tlsVersion === '1.2+' ? 'all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1' : 'TLSv1.3'}
SSLCipherSuite ${ciphers}
SSLHonorCipherOrder on
SSLSessionCache "shmcb:/var/cache/mod_ssl/scache(512000)"
SSLSessionCacheTimeout 86400
`;
      if (hsts) {
        config += 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"\n';
      }
    }

    setGeneratedConfig(config);
    setCopied(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateConfig();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">SSL/TLS Config Generator</h2>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Server Type
              </label>
              <select
                value={serverType}
                onChange={(e) => setServerType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {serverTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TLS Version
              </label>
              <select
                value={tlsVersion}
                onChange={(e) => setTlsVersion(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tlsVersions.map(ver => (
                  <option key={ver} value={ver}>{ver}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cipher Suite
              </label>
              <select
                value={cipherSuite}
                onChange={(e) => setCipherSuite(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cipherSuites.map(suite => (
                  <option key={suite} value={suite}>{suite.charAt(0).toUpperCase() + suite.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={hsts}
                onChange={(e) => setHsts(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Enable HSTS
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Config
          </button>
        </form>

        {/* Generated Config */}
        {generatedConfig && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-700">
                Generated {serverType.toUpperCase()} Configuration
              </h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {generatedConfig}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SSLTLSConfigGenerator;